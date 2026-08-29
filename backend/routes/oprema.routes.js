const express = require('express');

const router = express.Router();

const pool = require('../db');

const {
    authenticateToken,
    requireAdmin
} = require('../middleware/auth.middleware');


// =====================================================
// GET /api/oprema/kamp/:kampId
// Dohvaća aktivnu opremu određenog kampa
// =====================================================

router.get(
    '/kamp/:kampId',
    async (req, res) => {

        try {

            const kampId =
                req.params.kampId;


            const result = await pool.query(
                `
                SELECT
                    id,
                    kamp_id,
                    naziv,
                    opis,
                    cijena,
                    jedinica,
                    kolicina,
                    aktivno
                FROM oprema
                WHERE kamp_id = $1
                  AND aktivno = TRUE
                ORDER BY naziv ASC;
                `,
                [kampId]
            );


            res.json({
                oprema: result.rows
            });


        } catch (error) {

            console.error(
                'Greška pri dohvaćanju opreme:',
                error
            );


            res.status(500).json({
                error:
                    'Greška pri učitavanju opreme.'
            });

        }

    }
);


// =====================================================
// POST /api/oprema
// Administrator dodaje novu opremu
// =====================================================

router.post(
    '/',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                kamp_id,
                naziv,
                opis,
                cijena,
                jedinica,
                kolicina
            } = req.body;


            // Provjera obaveznih podataka

            if (
                !kamp_id ||
                !naziv ||
                cijena === undefined ||
                cijena === null
            ) {

                return res.status(400).json({
                    error:
                        'Kamp, naziv i cijena su obavezni.'
                });

            }


            // Provjera da li kamp postoji

            const kampResult =
                await pool.query(
                    `
                    SELECT id
                    FROM kamp_mjesta
                    WHERE id = $1;
                    `,
                    [kamp_id]
                );


            if (kampResult.rows.length === 0) {

                return res.status(404).json({
                    error:
                        'Kamp nije pronađen.'
                });

            }


            // Dodavanje opreme

            const result =
                await pool.query(
                    `
                    INSERT INTO oprema
                    (
                        kamp_id,
                        naziv,
                        opis,
                        cijena,
                        jedinica,
                        kolicina,
                        aktivno
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        TRUE
                    )
                    RETURNING *;
                    `,
                    [
                        kamp_id,
                        naziv,
                        opis || null,
                        cijena,
                        jedinica || 'dan',
                        kolicina || 1
                    ]
                );


            res.status(201).json({

                message:
                    'Oprema je uspješno dodana.',

                oprema:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                'Greška pri dodavanju opreme:',
                error
            );


            res.status(500).json({
                error:
                    'Greška pri dodavanju opreme.'
            });

        }

    }
);


// =====================================================
// PUT /api/oprema/:id
// Administrator uređuje opremu
// =====================================================

router.put(
    '/:id',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const opremaId =
                req.params.id;


            const {
                naziv,
                opis,
                cijena,
                jedinica,
                kolicina,
                aktivno
            } = req.body;


            const result =
                await pool.query(
                    `
                    UPDATE oprema
                    SET
                        naziv =
                            COALESCE($1, naziv),

                        opis =
                            COALESCE($2, opis),

                        cijena =
                            COALESCE($3, cijena),

                        jedinica =
                            COALESCE($4, jedinica),

                        kolicina =
                            COALESCE($5, kolicina),

                        aktivno =
                            COALESCE($6, aktivno)

                    WHERE id = $7

                    RETURNING *;
                    `,
                    [
                        naziv,
                        opis,
                        cijena,
                        jedinica,
                        kolicina,
                        aktivno,
                        opremaId
                    ]
                );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    error:
                        'Oprema nije pronađena.'
                });

            }


            res.json({

                message:
                    'Oprema je uspješno izmijenjena.',

                oprema:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                'Greška pri uređivanju opreme:',
                error
            );


            res.status(500).json({
                error:
                    'Greška pri uređivanju opreme.'
            });

        }

    }
);


// =====================================================
// DELETE /api/oprema/:id
// Administrator deaktivira opremu
// =====================================================

router.delete(
    '/:id',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const opremaId =
                req.params.id;


            const result =
                await pool.query(
                    `
                    UPDATE oprema
                    SET aktivno = FALSE
                    WHERE id = $1
                    RETURNING *;
                    `,
                    [opremaId]
                );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    error:
                        'Oprema nije pronađena.'
                });

            }


            res.json({

                message:
                    'Oprema je uspješno deaktivirana.',

                oprema:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                'Greška pri deaktiviranju opreme:',
                error
            );


            res.status(500).json({
                error:
                    'Greška pri deaktiviranju opreme.'
            });

        }

    }
);


module.exports = router;