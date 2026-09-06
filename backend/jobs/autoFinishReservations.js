const cron = require('node-cron');

const pool = require('../db');


// =====================================================
// Automatsko završavanje rezervacija
// =====================================================

async function autoFinishReservations() {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');


        // =================================================
        // 1. Pronalazimo rezervacije kojima je istekao
        //    datum odjave
        // =================================================

        const rezervacijeResult = await client.query(
            `
            SELECT
                id

            FROM rezervacije

            WHERE status = 'aktivna'
              AND datum_odjave <= CURRENT_TIMESTAMP

            FOR UPDATE SKIP LOCKED;
            `
        );


        // Ako nema rezervacija za završavanje
        if (rezervacijeResult.rows.length === 0) {

            await client.query('COMMIT');

            return;

        }


        // =================================================
        // 2. Obrada svake rezervacije
        // =================================================

        for (
            const rezervacija
            of rezervacijeResult.rows
        ) {

            const rezervacijaId =
                rezervacija.id;


            // =================================================
            // 3. Dohvaćamo rezervisanu opremu
            // =================================================

            const opremaResult =
                await client.query(
                    `
                    SELECT
                        oprema_id,
                        kolicina

                    FROM rezervacija_oprema

                    WHERE rezervacija_id = $1;
                    `,
                    [
                        rezervacijaId
                    ]
                );


            // =================================================
            // 4. Vraćamo opremu u inventar
            // =================================================

            for (
                const stavka
                of opremaResult.rows
            ) {

                await client.query(
                    `
                    UPDATE oprema

                    SET kolicina =
                        kolicina + $1

                    WHERE id = $2;
                    `,
                    [
                        stavka.kolicina,
                        stavka.oprema_id
                    ]
                );

            }


            // =================================================
            // 5. Završavamo rezervaciju
            // =================================================

            await client.query(
                `
                UPDATE rezervacije

                SET status = 'zavrsena',
                    updated_at = CURRENT_TIMESTAMP

                WHERE id = $1
                  AND status = 'aktivna';
                `,
                [
                    rezervacijaId
                ]
            );


            console.log(
                `Automatski završena rezervacija #${rezervacijaId}`
            );

        }


        // =================================================
        // 6. Potvrda transakcije
        // =================================================

        await client.query('COMMIT');


    } catch (error) {

        // =================================================
        // ROLLBACK
        // =================================================

        try {

            await client.query('ROLLBACK');

        } catch (rollbackError) {

            console.error(
                'Greška pri ROLLBACK-u:',
                rollbackError
            );

        }


        console.error(
            'Greška pri automatskom završavanju rezervacija:',
            error
        );


    } finally {

        client.release();

    }

}


// =====================================================
// Pokretanje cron joba
// =====================================================
//
// */1 * * * *
// znači: svake minute
//
// =====================================================

cron.schedule(
    '*/1 * * * *',
    () => {

        autoFinishReservations();

    }
);


console.log(
    'Automatsko završavanje rezervacija je aktivirano.'
);