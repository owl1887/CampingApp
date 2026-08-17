const express = require('express');

const router = express.Router();

const pool = require('../db');

const {
    authenticateToken,
    requireAdmin
} = require('../middleware/auth.middleware');

// GET /api/admin/korisnici
// Administrator vidi sve korisnike

router.get(
    '/korisnici',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const result = await pool.query(
                `
                SELECT
                    id,
                    ime_prezime,
                    email,
                    uloga,
                    aktivan
                FROM korisnici
                ORDER BY id;
                `
            );


            res.json({
                korisnici: result.rows
            });


        } catch (error) {

            console.error(
                'Greška pri dohvaćanju korisnika:',
                error
            );

            res.status(500).json({
                error:
                    'Greška na serveru.'
            });

        }

    }
);

// GET /api/admin/korisnici/:id
// Administrator vidi jednog korisnika

router.get(
    '/korisnici/:id',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const korisnik_id =
                req.params.id;


            const result = await pool.query(
                `
                SELECT
                    id,
                    ime_prezime,
                    email,
                    uloga,
                    aktivan
                FROM korisnici
                WHERE id = $1;
                `,
                [korisnik_id]
            );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    error:
                        'Korisnik nije pronađen.'
                });

            }


            res.json({
                korisnik:
                    result.rows[0]
            });


        } catch (error) {

            console.error(
                'Greška pri dohvaćanju korisnika:',
                error
            );

            res.status(500).json({
                error:
                    'Greška na serveru.'
            });

        }

    }
);

// PUT /api/admin/korisnici/:id/status
// Administrator aktivira/deaktivira korisnika

router.put(
    '/korisnici/:id/status',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const korisnik_id =
                req.params.id;

            const {
                aktivan
            } = req.body;


            // Provjera vrijednosti

            if (typeof aktivan !== 'boolean') {

                return res.status(400).json({
                    error:
                        'Polje aktivan mora biti true ili false.'
                });

            }


            // Ne dozvoljavamo administratoru
            // da sam sebi deaktivira račun

            if (
                Number(korisnik_id) ===
                Number(req.user.id)
            ) {

                return res.status(400).json({
                    error:
                        'Administrator ne može deaktivirati vlastiti račun.'
                });

            }


            const result = await pool.query(
                `
                UPDATE korisnici
                SET aktivan = $1
                WHERE id = $2
                RETURNING
                    id,
                    ime_prezime,
                    email,
                    uloga,
                    aktivan;
                `,
                [
                    aktivan,
                    korisnik_id
                ]
            );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    error:
                        'Korisnik nije pronađen.'
                });

            }


            res.json({

                message:
                    aktivan
                        ? 'Korisnik je aktiviran.'
                        : 'Korisnik je deaktiviran.',

                korisnik:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                'Greška pri promjeni statusa korisnika:',
                error
            );

            res.status(500).json({
                error:
                    'Greška na serveru.'
            });

        }

    }
);

// GET /api/admin/dashboard
// Statistika za administratora

router.get(
    '/dashboard',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            // ========================================
            // 1. Statistika korisnika
            // ========================================

            const korisnici = await pool.query(
                `
                SELECT
                    COUNT(*) AS ukupno,
                    COUNT(*) FILTER (
                        WHERE aktivan = TRUE
                    ) AS aktivni,
                    COUNT(*) FILTER (
                        WHERE aktivan = FALSE
                    ) AS deaktivirani
                FROM korisnici;
                `
            );


            // ========================================
            // 2. Broj kamp mjesta
            // ========================================

            const kampovi = await pool.query(
                `
                SELECT
                    COUNT(*) AS ukupno
                FROM kamp_mjesta;
                `
            );


            // ========================================
            // 3. Statistika rezervacija
            // ========================================

            const rezervacije = await pool.query(
                `
                SELECT
                    COUNT(*) AS ukupno,

                    COUNT(*) FILTER (
                        WHERE status = 'aktivna'
                    ) AS aktivne,

                    COUNT(*) FILTER (
                        WHERE status = 'otkazana'
                    ) AS otkazane,

                    COUNT(*) FILTER (
                        WHERE status = 'zavrsena'
                    ) AS zavrsene

                FROM rezervacije;
                `
            );


            // ========================================
            // 4. Finansijska statistika
            // ========================================

            const finansije = await pool.query(
                `
                SELECT
                    COALESCE(
                        SUM(ukupna_cijena),
                        0
                    ) AS ukupna_vrijednost,

                    COALESCE(
                        SUM(ukupna_cijena)
                        FILTER (
                            WHERE status = 'aktivna'
                        ),
                        0
                    ) AS aktivna_vrijednost,

                    COALESCE(
                        SUM(ukupna_cijena)
                        FILTER (
                            WHERE status = 'zavrsena'
                        ),
                        0
                    ) AS zavrsena_vrijednost

                FROM rezervacije;
                `
            );


            // ========================================
            // Slanje rezultata
            // ========================================

            res.json({

                korisnici:
                    korisnici.rows[0],

                kampovi:
                    kampovi.rows[0],

                rezervacije:
                    rezervacije.rows[0],

                finansije:
                    finansije.rows[0]

            });


        } catch (error) {

            console.error(
                'Greška pri dohvaćanju dashboard statistike:',
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