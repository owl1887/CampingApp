require('dotenv').config();
const express = require('express');
const cors = require('cors');



const kampoviRoutes = require('./routes/kampovi.routes');
const rezervacijeRoutes = require('./routes/rezervacije.routes');
const authRoutes = require('./routes/auth.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const adminRoutes =
    require('./routes/admin.routes');

const {
    authenticateToken
} = require('./middleware/auth.middleware');

const korisniciRoutes =
    require('./routes/korisnici.routes');
const opremaRoutes =
    require('./routes/oprema.routes');



const app = express();
app.use(cors());

app.use('/images', express.static('images'));

const PORT = 3000;

app.use(express.json());


// Testna ruta
app.get('/', (req, res) => {
    res.json({
        message: 'Camping Reservation API radi!'
    });
});

app.get(
    '/api/test-auth',
    authenticateToken,
    (req, res) => {

        res.json({
            message: 'Uspješno ste prošli autentifikaciju.',
            korisnik: req.user
        });

    }
);

// Kampovi
app.use('/api/kampovi', kampoviRoutes);


// Rezervacije
app.use('/api/rezervacije', rezervacijeRoutes);

app.use('/api/auth', authRoutes);

app.use(
    '/api/wishlist',
    wishlistRoutes
);

app.use(
    '/api/admin',
    adminRoutes
);
app.use(
    '/api/korisnici',
    korisniciRoutes
);
app.use(
    '/api/oprema',
    opremaRoutes
);



app.listen(PORT, () => {
    console.log(
        `Server pokrenut na http://localhost:${PORT}`
    );
});