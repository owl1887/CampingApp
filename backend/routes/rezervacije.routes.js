const express = require('express');
const router = express.Router();

const pool = require('../db');

const {
    authenticateToken,
    requireAdmin
} = require('../middleware/auth.middleware');


// GET /api/rezervacije
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

        console.error('Greška:', error);

        res.status(500).json({
            error: 'Greška na serveru.'
        });
    }
});

// POST /api/rezervacije
// Prijavljeni korisnik može napraviti rezervaciju

router.post(
    '/',
    authenticateToken,
    async (req, res) => {

        try {

            const korisnik_id = req.user.id;

            const {
                kamp_id,
                datum_prijave,
                datum_odjave
            } = req.body;


            // 1. Provjera podataka

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


            // 2. Provjera datuma

            if (
                datum_prijave >= datum_odjave
            ) {

                return res.status(400).json({
                    error:
                        'Datum odjave mora biti nakon datuma prijave.'
                });

            }


            // 3. Provjera da li kamp postoji i da li je aktivan

            const kampResult = await pool.query(
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


            // 4. Provjera zauzetosti

            const zauzetaRezervacija =
                await pool.query(
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


            if (zauzetaRezervacija.rows.length > 0) {

                return res.status(409).json({
                    error:
                        'Kamp mjesto je zauzeto u odabranom periodu.'
                });

            }


            // 5. Izračun broja noći

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


            // 6. Izračun ukupne cijene

            const ukupna_cijena =
                broj_noci *
                Number(kamp.cijena_po_noci);


            // 7. Kreiranje rezervacije

            const result = await pool.query(
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


            // 8. Odgovor

            res.status(201).json({

                message:
                    'Rezervacija je uspješno kreirana.',

                rezervacija:
                    result.rows[0],

                broj_noci:
                    broj_noci,

                cijena_po_noci:
                    Number(kamp.cijena_po_noci),

                ukupna_cijena:
                    ukupna_cijena

            });


        } catch (error) {

            console.error(
                'Greška pri kreiranju rezervacije:',
                error
            );

            res.status(500).json({
                error: 'Greška na serveru.'
            });

        }

    }
);

// GET /api/rezervacije/moje
// Vraća samo rezervacije trenutno prijavljenog korisnika

router.get(
    '/moje',
    authenticateToken,
    async (req, res) => {

        try {

            const korisnik_id = req.user.id;

            const result = await pool.query(
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
                rezervacije: result.rows
            });


        } catch (error) {

            console.error(
                'Greška pri dohvaćanju rezervacija:',
                error
            );

            res.status(500).json({
                error: 'Greška na serveru.'
            });

        }

    }
);

// GET /api/rezervacije/:id
// Dohvaća detalje jedne rezervacije korisnika

router.get(
    '/:id',
    authenticateToken,
    async (req, res) => {

        try {

            const korisnik_id = req.user.id;
            const rezervacija_id = req.params.id;


            const result = await pool.query(
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


            if (result.rows.length === 0) {

                return res.status(404).json({
                    error:
                        'Rezervacija nije pronađena.'
                });

            }


            res.json({
                rezervacija: result.rows[0]
            });


        } catch (error) {

            console.error(
                'Greška pri dohvaćanju rezervacije:',
                error
            );

            res.status(500).json({
                error: 'Greška na serveru.'
            });

        }

    }
);

// GET /api/rezervacije/admin/sve
// Samo administrator može vidjeti sve rezervacije

router.get(
    '/admin/sve',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const result = await pool.query(
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
                rezervacije: result.rows
            });


        } catch (error) {

            console.error(
                'Greška pri dohvaćanju svih rezervacija:',
                error
            );

            res.status(500).json({
                error: 'Greška na serveru.'
            });

        }

    }
);

// PUT /api/rezervacije/admin/:id/status
// Samo administrator može promijeniti status rezervacije

router.put(
    '/admin/:id/status',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const rezervacija_id = req.params.id;
            const { status } = req.body;


            // Dozvoljeni statusi

            const dozvoljeniStatusi = [
                'aktivna',
                'otkazana',
                'zavrsena'
            ];


            if (!dozvoljeniStatusi.includes(status)) {

                return res.status(400).json({
                    error:
                        'Neispravan status rezervacije.'
                });

            }


            // Provjera da li rezervacija postoji

            const postojecaRezervacija =
                await pool.query(
                    `
                    SELECT id, status
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


            // Promjena statusa

            const result = await pool.query(
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
                error: 'Greška na serveru.'
            });

        }

    }
);


// DELETE /api/rezervacije/:id
// Korisnik može otkazati samo svoju rezervaciju

router.delete(
    '/:id',
    authenticateToken,
    async (req, res) => {

        try {

            const korisnik_id = req.user.id;
            const rezervacija_id = req.params.id;


            // Pronađi rezervaciju koja pripada
            // trenutno prijavljenom korisniku
            const result = await pool.query(
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


            // Rezervacija ne postoji
            // ili ne pripada korisniku
            if (result.rows.length === 0) {

                return res.status(404).json({
                    error:
                        'Rezervacija nije pronađena.'
                });

            }


            const rezervacija = result.rows[0];


            // Već je otkazana
            if (rezervacija.status === 'otkazana') {

                return res.status(400).json({
                    error:
                        'Rezervacija je već otkazana.'
                });

            }


            // Otkazivanje rezervacije
            const updateResult = await pool.query(
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
                error: 'Greška na serveru.'
            });

        }

    }
);

module.exports = router;






