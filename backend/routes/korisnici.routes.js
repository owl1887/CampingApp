
const express = require('express');

const router = express.Router();

const pool = require('../db');

const {
    authenticateToken,
    requireAdmin
} = require('../middleware/auth.middleware');


// =====================================================
// GET /api/korisnici/admin/svi
// Dohvaća sve korisnike
// Samo administrator
// =====================================================

router.get(
    '/admin/svi',
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
                ORDER BY ime_prezime ASC;
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
                    'Greška pri učitavanju korisnika.'
            });

        }

    }
);


// =====================================================
// PUT /api/korisnici/admin/:id/status
// Aktivira ili deaktivira korisnički račun
// Samo administrator
// =====================================================

router.put(
    '/admin/:id/status',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const korisnikId =
                req.params.id;

            const { aktivan } =
                req.body;


            // Provjera vrijednosti

            if (typeof aktivan !== 'boolean') {

                return res.status(400).json({
                    error:
                        'Vrijednost aktivan mora biti true ili false.'
                });

            }


            // Ne dozvoljavamo administratoru
            // da deaktivira samog sebe

            if (
                Number(korisnikId) ===
                Number(req.user.id)
            ) {

                return res.status(400).json({
                    error:
                        'Ne možete deaktivirati vlastiti administratorski račun.'
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
                    korisnikId
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
                        ? 'Korisnički račun je uspješno aktiviran.'
                        : 'Korisnički račun je uspješno deaktiviran.',

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
                    'Greška pri promjeni statusa korisnika.'
            });

        }

    }
);


// =====================================================
// PUT /api/korisnici/admin/:id/uloga
// Mijenja ulogu korisnika
// Samo administrator
// =====================================================

router.put(
    '/admin/:id/uloga',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const korisnikId =
                req.params.id;

            const { uloga } =
                req.body;


            // Dozvoljene uloge

            const dozvoljeneUloge = [
                'korisnik',
                'admin'
            ];


            if (
                !dozvoljeneUloge.includes(uloga)
            ) {

                return res.status(400).json({
                    error:
                        'Neispravna uloga korisnika.'
                });

            }


            // Ne dozvoljavamo administratoru
            // da promijeni vlastitu ulogu

            if (
                Number(korisnikId) ===
                Number(req.user.id)
            ) {

                return res.status(400).json({
                    error:
                        'Ne možete promijeniti vlastitu administratorsku ulogu.'
                });

            }


            const result = await pool.query(
                `
                UPDATE korisnici
                SET uloga = $1
                WHERE id = $2
                RETURNING
                    id,
                    ime_prezime,
                    email,
                    uloga,
                    aktivan;
                `,
                [
                    uloga,
                    korisnikId
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
                    'Uloga korisnika je uspješno promijenjena.',

                korisnik:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                'Greška pri promjeni uloge korisnika:',
                error
            );


            res.status(500).json({
                error:
                    'Greška pri promjeni uloge korisnika.'
            });

        }

    }
);


module.exports = router;
