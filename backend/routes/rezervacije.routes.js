const express = require('express');
const router = express.Router();

const pool = require('../db');

const {
    authenticateToken,
    requireAdmin
} = require('../middleware/auth.middleware');


// =====================================================
// GET /api/rezervacije
// Dohvaća sve rezervacije
// =====================================================

router.get('/', async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                r.id,
                k.ime_prezime AS korisnik,
                k.email,
                km.naziv AS kamp,
                r.datum_prijave,
                r.datum_odjave,
                r.ukupna_cijena,
                r.status
            FROM rezervacije r

            JOIN korisnici k
                ON r.korisnik_id = k.id

            JOIN kamp_mjesta km
                ON r.kamp_id = km.id

            ORDER BY r.datum_prijave DESC;
        `);


        res.json(result.rows);


    } catch (error) {

        console.error(
            'Greška:',
            error
        );


        res.status(500).json({
            error:
                'Greška na serveru.'
        });

    }

});


// POST /api/rezervacije
// Prijavljeni korisnik može napraviti rezervaciju
// zajedno sa dodatnom opremom

router.post(
    '/',
    authenticateToken,
    async (req, res) => {

        const client = await pool.connect();

        try {

            const korisnik_id = req.user.id;

            const {
                kamp_id,
                datum_prijave,
                datum_odjave,
                oprema = []
            } = req.body;


            // ==========================================
            // 1. Provjera osnovnih podataka
            // ==========================================

            if (
                !kamp_id ||
                !datum_prijave ||
                !datum_odjave
            ) {

                return res.status(400).json({
                    error:
                        'Kamp i datumi rezervacije su obavezni.'
                });

            }


            // ==========================================
            // 2. Provjera datuma
            // ==========================================

            if (
                datum_prijave >= datum_odjave
            ) {

                return res.status(400).json({
                    error:
                        'Datum odjave mora biti nakon datuma prijave.'
                });

            }


            // ==========================================
            // 3. Provjera da li kamp postoji
            // ==========================================

            const kampResult = await client.query(
                `
                SELECT
                    id,
                    naziv,
                    cijena_po_noci
                FROM kamp_mjesta
                WHERE id = $1
                  AND aktivno = TRUE;
                `,
                [kamp_id]
            );


            if (kampResult.rows.length === 0) {

                return res.status(404).json({
                    error:
                        'Kamp mjesto nije pronađeno ili nije aktivno.'
                });

            }


            const kamp = kampResult.rows[0];


            // ==========================================
            // 4. Provjera zauzetosti kampa
            // ==========================================

            const zauzetaRezervacija =
                await client.query(
                    `
                    SELECT id
                    FROM rezervacije
                    WHERE kamp_id = $1
                      AND status = 'aktivna'
                      AND datum_prijave < $3
                      AND datum_odjave > $2;
                    `,
                    [
                        kamp_id,
                        datum_prijave,
                        datum_odjave
                    ]
                );


            if (
                zauzetaRezervacija.rows.length > 0
            ) {

                return res.status(409).json({
                    error:
                        'Kamp mjesto je zauzeto u odabranom periodu.'
                });

            }


            // ==========================================
            // 5. Provjera formata opreme
            // ==========================================

            if (!Array.isArray(oprema)) {

                return res.status(400).json({
                    error:
                        'Podaci o opremi nisu ispravni.'
                });

            }


            // ==========================================
            // 6. Provjera opreme
            // ==========================================

            const opremaPodaci = [];

            for (const stavka of oprema) {

                const oprema_id =
                    Number(stavka.oprema_id);

                const kolicina =
                    Number(stavka.kolicina);


                if (
                    !Number.isInteger(oprema_id) ||
                    !Number.isInteger(kolicina) ||
                    kolicina <= 0
                ) {

                    return res.status(400).json({
                        error:
                            'Podaci o odabranoj opremi nisu ispravni.'
                    });

                }


                const opremaResult =
                    await client.query(
                        `
                        SELECT
                            id,
                            kamp_id,
                            naziv,
                            cijena,
                            jedinica,
                            kolicina AS dostupna_kolicina
                        FROM oprema
                        WHERE id = $1
                          AND kamp_id = $2
                          AND aktivno = TRUE;
                        `,
                        [
                            oprema_id,
                            kamp_id
                        ]
                    );


                if (
                    opremaResult.rows.length === 0
                ) {

                    return res.status(404).json({
                        error:
                            'Odabrana oprema nije pronađena ili nije dostupna za ovaj kamp.'
                    });

                }


                const stavkaOpreme =
                    opremaResult.rows[0];


                // Provjera količine

                if (
                    kolicina >
                    stavkaOpreme.dostupna_kolicina
                ) {

                    return res.status(409).json({
                        error:
                            `Nije dostupna tražena količina opreme: ${stavkaOpreme.naziv}.`
                    });

                }


                const cijenaPoJedinici =
                    Number(
                        stavkaOpreme.cijena
                    );


                const ukupnaCijenaOpreme =
                    cijenaPoJedinici *
                    kolicina;


                opremaPodaci.push({
                    oprema_id,
                    naziv:
                        stavkaOpreme.naziv,
                    kolicina,
                    cijena_po_jedinici:
                        cijenaPoJedinici,
                    ukupna_cijena:
                        ukupnaCijenaOpreme
                });

            }


            // ==========================================
            // 7. Izračun broja noći
            // ==========================================

            const datum1 =
                new Date(datum_prijave);

            const datum2 =
                new Date(datum_odjave);


            const razlika =
                datum2.getTime() -
                datum1.getTime();


            const broj_noci =
                Math.ceil(
                    razlika /
                    (1000 * 60 * 60 * 24)
                );


            // ==========================================
            // 8. Cijena kampa
            // ==========================================

            const cijenaKampa =
                broj_noci *
                Number(kamp.cijena_po_noci);


            // ==========================================
            // 9. Cijena opreme
            // ==========================================

            const cijenaOpreme =
                opremaPodaci.reduce(
                    (
                        ukupno,
                        stavka
                    ) =>
                        ukupno +
                        stavka.ukupna_cijena,
                    0
                );


            // ==========================================
            // 10. Konačna cijena
            // ==========================================

            const ukupna_cijena =
                cijenaKampa +
                cijenaOpreme;


            // ==========================================
            // 11. TRANSAKCIJA
            // ==========================================

            await client.query('BEGIN');


            // ==========================================
            // 12. Kreiranje rezervacije
            // ==========================================

            const rezervacijaResult =
                await client.query(
                    `
                    INSERT INTO rezervacije
                    (
                        korisnik_id,
                        kamp_id,
                        datum_prijave,
                        datum_odjave,
                        ukupna_cijena,
                        status
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        'aktivna'
                    )
                    RETURNING *;
                    `,
                    [
                        korisnik_id,
                        kamp_id,
                        datum_prijave,
                        datum_odjave,
                        ukupna_cijena
                    ]
                );


            const rezervacija =
                rezervacijaResult.rows[0];


            // ==========================================
            // 13. Dodavanje opreme rezervaciji
            // ==========================================

            for (
                const stavka
                of opremaPodaci
            ) {

                await client.query(
                    `
                    INSERT INTO rezervacija_oprema
                    (
                        rezervacija_id,
                        oprema_id,
                        kolicina,
                        cijena_po_jedinici,
                        ukupna_cijena
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5
                    );
                    `,
                    [
                        rezervacija.id,
                        stavka.oprema_id,
                        stavka.kolicina,
                        stavka.cijena_po_jedinici,
                        stavka.ukupna_cijena
                    ]
                );

            }


            // ==========================================
            // 14. Potvrda transakcije
            // ==========================================

            await client.query('COMMIT');


            // ==========================================
            // 15. Odgovor
            // ==========================================

            res.status(201).json({

                message:
                    'Rezervacija je uspješno kreirana.',

                rezervacija,

                broj_noci,

                cijena_po_noci:
                    Number(
                        kamp.cijena_po_noci
                    ),

                cijena_kampa:
                    cijenaKampa,

                cijena_opreme:
                    cijenaOpreme,

                ukupna_cijena,

                oprema:
                    opremaPodaci

            });


        } catch (error) {

            await client.query('ROLLBACK');


            console.error(
                'Greška pri kreiranju rezervacije:',
                error
            );


            res.status(500).json({
                error:
                    'Greška pri kreiranju rezervacije.'
            });


        } finally {

            client.release();

        }

    }
);


// =====================================================
// GET /api/rezervacije/moje
// Rezervacije trenutno prijavljenog korisnika
// =====================================================

router.get(
    '/moje',
    authenticateToken,
    async (req, res) => {

        try {

            const korisnik_id =
                req.user.id;


            const result =
                await pool.query(
                    `
                    SELECT
                        r.id,
                        r.kamp_id,

                        k.naziv AS kamp_naziv,
                        k.opis AS kamp_opis,
                        k.cijena_po_noci,

                        r.datum_prijave,
                        r.datum_odjave,
                        r.ukupna_cijena,
                        r.status,

                        k.latitude,
                        k.longitude

                    FROM rezervacije r

                    INNER JOIN kamp_mjesta k
                        ON r.kamp_id = k.id

                    WHERE r.korisnik_id = $1

                    ORDER BY r.datum_prijave DESC;
                    `,
                    [korisnik_id]
                );


            res.json({
                rezervacije:
                    result.rows
            });


        } catch (error) {

            console.error(
                'Greška pri dohvaćanju rezervacija:',
                error
            );


            res.status(500).json({
                error:
                    'Greška na serveru.'
            });

        }

    }
);


// =====================================================
// GET /api/rezervacije/:id
// Detalji jedne rezervacije korisnika
// =====================================================

router.get(
    '/:id',
    authenticateToken,
    async (req, res) => {

        try {

            const korisnik_id =
                req.user.id;

            const rezervacija_id =
                req.params.id;


            const result =
                await pool.query(
                    `
                    SELECT
                        r.id,
                        r.korisnik_id,
                        r.kamp_id,

                        k.naziv AS kamp_naziv,
                        k.opis AS kamp_opis,
                        k.cijena_po_noci,

                        k.karakteristike,
                        k.latitude,
                        k.longitude,

                        r.datum_prijave,
                        r.datum_odjave,
                        r.ukupna_cijena,
                        r.status

                    FROM rezervacije r

                    INNER JOIN kamp_mjesta k
                        ON r.kamp_id = k.id

                    WHERE r.id = $1
                      AND r.korisnik_id = $2;
                    `,
                    [
                        rezervacija_id,
                        korisnik_id
                    ]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({
                    error:
                        'Rezervacija nije pronađena.'
                });

            }


            const rezervacija =
                result.rows[0];


            // =====================================================
            // Dohvaćanje opreme rezervacije
            // =====================================================

            const opremaResult =
                await pool.query(
                    `
                    SELECT
                        ro.id,
                        ro.oprema_id,
                        o.naziv,
                        o.opis,

                        ro.kolicina,
                        ro.cijena_po_jedinici,
                        ro.broj_dana,
                        ro.ukupna_cijena

                    FROM rezervacija_oprema ro

                    INNER JOIN oprema o
                        ON ro.oprema_id = o.id

                    WHERE ro.rezervacija_id = $1

                    ORDER BY o.naziv ASC;
                    `,
                    [
                        rezervacija_id
                    ]
                );


            res.json({

                rezervacija,

                oprema:
                    opremaResult.rows

            });


        } catch (error) {

            console.error(
                'Greška pri dohvaćanju rezervacije:',
                error
            );


            res.status(500).json({
                error:
                    'Greška na serveru.'
            });

        }

    }
);


// =====================================================
// GET /api/rezervacije/admin/sve
// Administrator vidi sve rezervacije
// =====================================================

router.get(
    '/admin/sve',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `
                    SELECT
                        r.id AS rezervacija_id,

                        r.datum_prijave,
                        r.datum_odjave,
                        r.ukupna_cijena,
                        r.status,

                        k.id AS kamp_id,
                        k.naziv AS kamp_naziv,

                        u.id AS korisnik_id,
                        u.ime_prezime AS korisnik_ime,
                        u.email AS korisnik_email

                    FROM rezervacije r

                    INNER JOIN kamp_mjesta k
                        ON r.kamp_id = k.id

                    INNER JOIN korisnici u
                        ON r.korisnik_id = u.id

                    ORDER BY r.datum_prijave DESC;
                    `
                );


            res.json({
                rezervacije:
                    result.rows
            });


        } catch (error) {

            console.error(
                'Greška pri dohvaćanju svih rezervacija:',
                error
            );


            res.status(500).json({
                error:
                    'Greška na serveru.'
            });

        }

    }
);


// =====================================================
// PUT /api/rezervacije/admin/:id/status
// Administrator mijenja status rezervacije
// =====================================================

router.put(
    '/admin/:id/status',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const rezervacija_id =
                req.params.id;

            const { status } =
                req.body;


            const dozvoljeniStatusi = [
                'aktivna',
                'otkazana',
                'zavrsena'
            ];


            if (
                !dozvoljeniStatusi.includes(status)
            ) {

                return res.status(400).json({
                    error:
                        'Neispravan status rezervacije.'
                });

            }


            const postojecaRezervacija =
                await pool.query(
                    `
                    SELECT
                        id,
                        status
                    FROM rezervacije
                    WHERE id = $1;
                    `,
                    [rezervacija_id]
                );


            if (
                postojecaRezervacija.rows.length === 0
            ) {

                return res.status(404).json({
                    error:
                        'Rezervacija nije pronađena.'
                });

            }


            const result =
                await pool.query(
                    `
                    UPDATE rezervacije
                    SET status = $1
                    WHERE id = $2
                    RETURNING *;
                    `,
                    [
                        status,
                        rezervacija_id
                    ]
                );


            res.json({

                message:
                    'Status rezervacije je uspješno promijenjen.',

                rezervacija:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                'Greška pri promjeni statusa:',
                error
            );


            res.status(500).json({
                error:
                    'Greška na serveru.'
            });

        }

    }
);


// =====================================================
// DELETE /api/rezervacije/:id
// Korisnik otkazuje samo svoju rezervaciju
// =====================================================

router.delete(
    '/:id',
    authenticateToken,
    async (req, res) => {

        try {

            const korisnik_id =
                req.user.id;

            const rezervacija_id =
                req.params.id;


            const result =
                await pool.query(
                    `
                    SELECT
                        id,
                        kamp_id,
                        datum_prijave,
                        datum_odjave,
                        status

                    FROM rezervacije

                    WHERE id = $1
                      AND korisnik_id = $2;
                    `,
                    [
                        rezervacija_id,
                        korisnik_id
                    ]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({
                    error:
                        'Rezervacija nije pronađena.'
                });

            }


            const rezervacija =
                result.rows[0];


            if (
                rezervacija.status ===
                'otkazana'
            ) {

                return res.status(400).json({
                    error:
                        'Rezervacija je već otkazana.'
                });

            }


            const updateResult =
                await pool.query(
                    `
                    UPDATE rezervacije

                    SET status = 'otkazana'

                    WHERE id = $1
                      AND korisnik_id = $2

                    RETURNING *;
                    `,
                    [
                        rezervacija_id,
                        korisnik_id
                    ]
                );


            res.json({

                message:
                    'Rezervacija je uspješno otkazana.',

                rezervacija:
                    updateResult.rows[0]

            });


        } catch (error) {

            console.error(
                'Greška pri otkazivanju rezervacije:',
                error
            );


            res.status(500).json({
                error:
                    'Greška na serveru.'
            });

        }

    }
);


module.exports = router;