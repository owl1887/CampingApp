const express = require('express');
const router = express.Router();

const pool = require('../db');

const {
    authenticateToken,
    requireAdmin
} = require('../middleware/auth.middleware');




// GET /api/kampovi
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                naziv,
                opis,
                cijena_po_noci,
                karakteristike,
                latitude,
                longitude,
                slika_url
            FROM kamp_mjesta
            WHERE aktivno = TRUE
            ORDER BY naziv ASC;
        `);

        res.json(result.rows);

    } catch (error) {
        console.error('Greška:', error);

        res.status(500).json({
            error: 'Greška na serveru.'
        });
    }
});


// GET /api/kampovi/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT
                id,
                naziv,
                opis,
                cijena_po_noci,
                karakteristike,
                latitude,
                longitude,
                slika_url
            FROM kamp_mjesta
            WHERE id = $1
              AND aktivno = TRUE;
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Kamp nije pronađen.'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error('Greška:', error);

        res.status(500).json({
            error: 'Greška na serveru.'
        });
    }
});

// POST /api/kampovi
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

    const client = await pool.connect();

    try {

        const {
            naziv,
            opis,
            cijena_po_noci,
            karakteristike,
            latitude,
            longitude,
            slika_url
        } = req.body;


        // Provjera obaveznih podataka

        if (
            !naziv ||
            cijena_po_noci === undefined
        ) {

            return res.status(400).json({
                error: 'Naziv i cijena po noći su obavezni.'
            });

        }


        // Početak transakcije

        await client.query('BEGIN');


        // =====================================================
        // 1. Kreiranje kampa
        // =====================================================

        const kampResult = await client.query(
            `
            INSERT INTO kamp_mjesta
            (
                naziv,
                opis,
                cijena_po_noci,
                karakteristike,
                latitude,
                longitude,
                slika_url,
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
                $7,
                TRUE
            )
            RETURNING *
            `,
            [
                naziv,
                opis || null,
                cijena_po_noci,
                karakteristike || {},
                latitude || null,
                longitude || null,
                slika_url || null
            ]
        );


        const noviKamp = kampResult.rows[0];


        // =====================================================
        // 2. Automatsko dodavanje početne opreme
        // =====================================================

        const pocetnaOprema = [

            {
                naziv: 'Šator',
                opis: 'Šator za kampovanje.',
                cijena: 15,
                jedinica: 'dan',
                kolicina: 5
            },

            {
                naziv: 'Vreća za spavanje',
                opis: 'Vreća za spavanje za jednu osobu.',
                cijena: 5,
                jedinica: 'dan',
                kolicina: 10
            },

            {
                naziv: 'Stolica',
                opis: 'Sklopiva kamperska stolica.',
                cijena: 2,
                jedinica: 'dan',
                kolicina: 10
            },

            {
                naziv: 'Sto',
                opis: 'Kamperski sto.',
                cijena: 5,
                jedinica: 'dan',
                kolicina: 5
            },

            {
                naziv: 'Roštilj',
                opis: 'Prenosivi roštilj za kampovanje.',
                cijena: 8,
                jedinica: 'dan',
                kolicina: 3
            },

            {
                naziv: 'Bicikl',
                opis: 'Bicikl za iznajmljivanje.',
                cijena: 10,
                jedinica: 'dan',
                kolicina: 5
            },

            {
                naziv: 'Kajak',
                opis: 'Kajak za korištenje na vodi.',
                cijena: 20,
                jedinica: 'dan',
                kolicina: 3
            }

        ];


        // =====================================================
        // 3. Upis opreme za novi kamp
        // =====================================================

        for (const oprema of pocetnaOprema) {

            await client.query(
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
                `,
                [
                    noviKamp.id,
                    oprema.naziv,
                    oprema.opis,
                    oprema.cijena,
                    oprema.jedinica,
                    oprema.kolicina
                ]
            );

        }


        // =====================================================
        // 4. Potvrda transakcije
        // =====================================================

        await client.query('COMMIT');


        // =====================================================
        // 5. Odgovor
        // =====================================================

        res.status(201).json({

            message:
                'Kamp mjesto i početna oprema su uspješno dodani.',

            kamp:
                noviKamp,

            oprema:
                pocetnaOprema

        });


    } catch (error) {

        // Ako je nešto pošlo po zlu,
        // poništavamo sve promjene.

        await client.query('ROLLBACK');


        console.error(
            'Greška pri dodavanju kampa i opreme:',
            error
        );


        res.status(500).json({
            error:
                'Greška pri dodavanju kampa i početne opreme.'
        });


    } finally {

        client.release();

    }

});

// PUT /api/kampovi/:id
// Samo administrator može izmijeniti kamp
router.put(
    '/:id',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const { id } = req.params;

            const {
                naziv,
                opis,
                cijena_po_noci,
                karakteristike,
                latitude,
                longitude
            } = req.body;


            // Provjera obaveznih podataka
            if (!naziv || cijena_po_noci === undefined) {

                return res.status(400).json({
                    error: 'Naziv i cijena po noći su obavezni.'
                });

            }


            // Provjera da li kamp postoji
            const postojeciKamp = await pool.query(
                `
                SELECT id
                FROM kamp_mjesta
                WHERE id = $1
                  AND aktivno = TRUE
                `,
                [id]
            );


            if (postojeciKamp.rows.length === 0) {

                return res.status(404).json({
                    error: 'Kamp mjesto nije pronađeno.'
                });

            }


            // Izmjena podataka
            const result = await pool.query(
                `
                UPDATE kamp_mjesta
                SET
                    naziv = $1,
                    opis = $2,
                    cijena_po_noci = $3,
                    karakteristike = $4,
                    latitude = $5,
                    longitude = $6,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $7
                RETURNING *;
                `,
                [
                    naziv,
                    opis || null,
                    cijena_po_noci,
                    karakteristike || {},
                    latitude || null,
                    longitude || null,
                    id
                ]
            );


            res.json({
                message: 'Kamp mjesto je uspješno izmijenjeno.',
                kamp: result.rows[0]
            });


        } catch (error) {

            console.error(
                'Greška pri izmjeni kampa:',
                error
            );

            res.status(500).json({
                error: 'Greška na serveru.'
            });

        }

    }
);

// DELETE /api/kampovi/:id
// Samo administrator može deaktivirati kamp
router.delete(
    '/:id',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const { id } = req.params;


            const result = await pool.query(
                `
                UPDATE kamp_mjesta
                SET
                    aktivno = FALSE,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                  AND aktivno = TRUE
                RETURNING *;
                `,
                [id]
            );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    error:
                        'Kamp mjesto nije pronađeno ili je već deaktivirano.'
                });

            }


            res.json({
                message:
                    'Kamp mjesto je uspješno deaktivirano.',
                kamp: result.rows[0]
            });


        } catch (error) {

            console.error(
                'Greška pri deaktiviranju kampa:',
                error
            );

            res.status(500).json({
                error: 'Greška na serveru.'
            });

        }

    }
);


module.exports = router;

