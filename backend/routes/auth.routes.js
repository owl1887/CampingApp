const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const pool = require('../db');

const {
    authenticateToken
} = require('../middleware/auth.middleware');


// POST /api/auth/register
router.post('/register', async (req, res) => {

    try {

        const {
            ime_prezime,
            email,
            lozinka
        } = req.body;


        // 1. Provjera podataka

        if (!ime_prezime || !email || !lozinka) {

            return res.status(400).json({
                error:
                    'Ime, email i lozinka su obavezni.'
            });

        }


        // 2. Provjera da li korisnik već postoji

        const postojeciKorisnik = await pool.query(
            `
            SELECT
                id,
                email,
                aktivan
            FROM korisnici
            WHERE email = $1
            `,
            [email]
        );


        if (postojeciKorisnik.rows.length > 0) {

            const korisnik =
                postojeciKorisnik.rows[0];


            // Ako postoji, ali je deaktiviran

            if (korisnik.aktivan === false) {

                return res.status(409).json({
                    error:
                        'Korisnički račun sa tim emailom je deaktiviran.'
                });

            }


            return res.status(409).json({
                error:
                    'Korisnik sa tim emailom već postoji.'
            });

        }


        // 3. Hashiranje lozinke

        const lozinkaHash =
            await bcrypt.hash(lozinka, 10);


        // 4. Dodavanje korisnika

        const noviKorisnik = await pool.query(
            `
            INSERT INTO korisnici
            (
                ime_prezime,
                email,
                lozinka_hash,
                uloga,
                aktivan
            )
            VALUES
            (
                $1,
                $2,
                $3,
                'korisnik',
                TRUE
            )
            RETURNING
                id,
                ime_prezime,
                email,
                uloga,
                aktivan;
            `,
            [
                ime_prezime,
                email,
                lozinkaHash
            ]
        );


        res.status(201).json({

            message:
                'Korisnik je uspješno registrovan.',

            korisnik:
                noviKorisnik.rows[0]

        });


    } catch (error) {

        console.error(
            'Greška pri registraciji:',
            error
        );

        res.status(500).json({
            error:
                'Greška na serveru.'
        });

    }

});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {

        const {
            email,
            lozinka
        } = req.body;


        // 1. Provjera podataka
        if (!email || !lozinka) {
            return res.status(400).json({
                error: 'Email i lozinka su obavezni.'
            });
        }


        // 2. Pronalaženje korisnika
const result = await pool.query(
    `
    SELECT
        id,
        ime_prezime,
        email,
        lozinka_hash,
        uloga
    FROM korisnici
    WHERE email = $1
      AND aktivan = TRUE
    `,
    [email]
);


        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Pogrešan email ili lozinka.'
            });
        }


        const korisnik = result.rows[0];


        // 3. Provjera lozinke
        const ispravnaLozinka =
            await bcrypt.compare(
                lozinka,
                korisnik.lozinka_hash
            );


        if (!ispravnaLozinka) {
            return res.status(401).json({
                error: 'Pogrešan email ili lozinka.'
            });
        }


        // 4. Kreiranje JWT tokena
        const token = jwt.sign(
            {
                id: korisnik.id,
                email: korisnik.email,
                uloga: korisnik.uloga
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '2h'
            }
        );


        // 5. Slanje odgovora
        res.json({
            message: 'Uspješna prijava.',
            token: token,
            korisnik: {
                id: korisnik.id,
                ime_prezime: korisnik.ime_prezime,
                email: korisnik.email,
                uloga: korisnik.uloga
            }
        });


    } catch (error) {

        console.error(
            'Greška pri prijavi:',
            error
        );

        res.status(500).json({
            error: 'Greška na serveru.'
        });
    }
});

// GET /api/auth/profile
// Dohvata podatke trenutno prijavljenog korisnika

router.get(
    '/profile',
    authenticateToken,
    async (req, res) => {

        try {

            const korisnik_id = req.user.id;


            const result = await pool.query(
                `
                SELECT
                    id,
                    ime_prezime,
                    email,
                    uloga,
                    aktivan
                FROM korisnici
                WHERE id = $1
                  AND aktivan = TRUE
                `,
                [korisnik_id]
            );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    error:
                        'Korisnički profil nije pronađen ili je deaktiviran.'
                });

            }


            res.json({
                korisnik:
                    result.rows[0]
            });


        } catch (error) {

            console.error(
                'Greška pri dohvaćanju profila:',
                error
            );

            res.status(500).json({
                error:
                    'Greška na serveru.'
            });

        }

    }
);


// DELETE /api/auth/profile
// Deaktivira profil trenutno prijavljenog korisnika

router.delete(
    '/profile',
    authenticateToken,
    async (req, res) => {

        try {

            const korisnik_id = req.user.id;


            const result = await pool.query(
                `
                UPDATE korisnici
                SET aktivan = FALSE
                WHERE id = $1
                  AND aktivan = TRUE
                RETURNING id, ime_prezime, email, aktivan;
                `,
                [korisnik_id]
            );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    error:
                        'Korisnički profil nije pronađen.'
                });

            }


            res.json({

                message:
                    'Korisnički profil je uspješno deaktiviran.',

                korisnik:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                'Greška pri deaktiviranju profila:',
                error
            );

            res.status(500).json({
                error: 'Greška na serveru.'
            });

        }

    }
);


module.exports = router;