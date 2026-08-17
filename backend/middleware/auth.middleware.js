const jwt = require('jsonwebtoken');




const authenticateToken = (req, res, next) => {

    try {

        // Dohvati Authorization header
        const authHeader = req.headers['authorization'];

        // Ako header ne postoji
        if (!authHeader) {
            return res.status(401).json({
                error: 'Niste prijavljeni.'
            });
        }


        // Očekujemo:
        // Authorization: Bearer TOKEN

        const parts = authHeader.split(' ');


        if (
            parts.length !== 2 ||
            parts[0] !== 'Bearer'
        ) {
            return res.status(401).json({
                error: 'Neispravan format tokena.'
            });
        }


        const token = parts[1];


        // Provjera tokena
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        // Podatke iz tokena spremamo u req.user
        req.user = decoded;


        // Nastavi prema sljedećem middleware-u/ruti
        next();


    } catch (error) {

        console.error(
            'Greška pri provjeri tokena:',
            error.message
        );

        return res.status(403).json({
            error: 'Neispravan ili istekao token.'
        });
    }
};

const requireAdmin = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            error: 'Niste prijavljeni.'
        });
    }


    if (req.user.uloga !== 'admin') {
        return res.status(403).json({
            error:
                'Nemate administratorske ovlasti.'
        });
    }


    next();
};


module.exports = {
    authenticateToken,
    requireAdmin
};