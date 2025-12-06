const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../../database/db');
const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        // Debug: log request body
        console.log('Login request body:', req.body);
        const { email, password } = req.body;
        console.log('Email received:', email);
        console.log('Password received:', password);

        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ error: 'Anna sähköposti ja salasana' });
        }

        // Hae käyttäjä emaililla
        const [rows] = await pool.query(
            `SELECT user_id, email, password_hash, name, is_admin, is_active
             FROM users
             WHERE email = ?`,
            [email]
        );
        // Debug: log database query result
        console.log('User query result:', rows);

        if (rows.length === 0) {
            console.log('User not found for email:', email);
            return res.status(401).json({ error: 'Väärä sähköposti tai salasana' });
        }

        const user = rows[0];
        console.log('User found:', user);
        console.log('User password_hash from DB:', user.password_hash);

        if (!user.is_active) {
            console.log('User not active:', user);
            return res.status(403).json({ error: 'Käyttäjätili ei ole aktiivinen' });
        }

        // Tarkista salasana
        console.log('Comparing password:', password, 'with hash:', user.password_hash);
        try {
            const ok = await bcrypt.compare(password, user.password_hash);
            console.log('Password match result:', ok);
            if (!ok) {
                console.log('Incorrect password for user:', email);
                return res.status(401).json({ error: 'Väärä sähköposti tai salasana' });
            }
        } catch (err) {
            console.error('Error comparing password:', err);
            return res.status(500).json({ error: 'Virhe salasanan tarkistuksessa' });
        }
        if (!ok) {
            console.log('Incorrect password for user:', email);
            return res.status(401).json({ error: 'Väärä sähköposti tai salasana' });
        }

        // Päivitä last_login
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE user_id = ?',
            [user.user_id]
        );

        // Luo JWT
        const token = jwt.sign(
            {
                userId: user.user_id,
                email: user.email,
                name: user.name,
                isAdmin: !!user.is_admin
            },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.json({
            message: 'Kirjautuminen onnistui',
            user: {
                user_id: user.user_id,
                email: user.email,
                name: user.name,
                is_admin: !!user.is_admin
            },
            token
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Palvelinvirhe kirjautumisessa' });
    }
});

module.exports = router;
