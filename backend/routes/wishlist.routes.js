const express = require('express');

const router = express.Router();

const pool = require('../db');

const {
    authenticateToken
} = require('../middleware/auth.middleware');


// ============================================
// POST /api/wishlist/:kamp_id
// Dodavanje kampa u listu želja
// ============================================

router.post(
    '/:kamp_id',
    authenticateToken,
    async (req, res) => {

        try {

            const korisnik_id = req.user.id;
            const kamp_id = req.params.kamp_id;


            // Provjeri da li kamp postoji

            const kamp = await pool.query(
                `
                SELECT id, naziv
                FROM kamp_mjesta
                WHERE id = $1;
                `,
                [kamp_id]
            );


            if (kamp.rows.length === 0) {

                return res.status(404).json({
                    error:
                        'Kamp mjesto nije pronađeno.'
                });

            }


            // Dodaj u listu želja

            const result = await pool.query(
                `
                INSERT INTO lista_zelja
                    (korisnik_id, kamp_id)

                VALUES
                    ($1, $2)

                RETURNING *;
                `,
                [
                    korisnik_id,
                    kamp_id
                ]
            );


            res.status(201).json({

                message:
                    'Kamp mjesto je dodano u listu želja.',

                lista_zelja:
                    result.rows[0]

            });


        } catch (error) {

            // PostgreSQL error 23505 =
            // duplicate key

            if (error.code === '23505') {

                return res.status(409).json({

                    error:
                        'Kamp mjesto je već u listi želja.'

                });

            }


            console.error(
                'Greška pri dodavanju u wishlist:',
                error
            );


            res.status(500).json({

                error:
                    'Greška na serveru.'

            });

        }

    }
);


// ============================================
// GET /api/wishlist
// Prikaz moje liste želja
// ============================================

router.get(
    '/',
    authenticateToken,
    async (req, res) => {

        try {

            const korisnik_id = req.user.id;


            const result = await pool.query(
                `
                SELECT

                    k.id,
                    k.naziv,
                    k.opis,
                    k.cijena_po_noci,
                    k.karakteristike,
                    k.latitude,
                    k.longitude

                FROM lista_zelja lz

                INNER JOIN kamp_mjesta k
                    ON lz.kamp_id = k.id

                WHERE lz.korisnik_id = $1

                ORDER BY k.naziv;
                `,
                [korisnik_id]
            );


            res.json({

                lista_zelja:
                    result.rows

            });


        } catch (error) {

            console.error(
                'Greška pri dohvaćanju liste želja:',
                error
            );


            res.status(500).json({

                error:
                    'Greška na serveru.'

            });

        }

    }
);


// ============================================
// DELETE /api/wishlist/:kamp_id
// Uklanjanje kampa iz liste želja
// ============================================

router.delete(
    '/:kamp_id',
    authenticateToken,
    async (req, res) => {

        try {

            const korisnik_id = req.user.id;
            const kamp_id = req.params.kamp_id;


            const result = await pool.query(
                `
                DELETE FROM lista_zelja

                WHERE korisnik_id = $1
                  AND kamp_id = $2

                RETURNING *;
                `,
                [
                    korisnik_id,
                    kamp_id
                ]
            );


            if (result.rows.length === 0) {

                return res.status(404).json({

                    error:
                        'Kamp mjesto nije pronađeno u listi želja.'

                });

            }


            res.json({

                message:
                    'Kamp mjesto je uklonjeno iz liste želja.'

            });


        } catch (error) {

            console.error(
                'Greška pri uklanjanju iz wishlist:',
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