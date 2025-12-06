const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../../../database/db');
const { JWT_SECRET } = require('./shared');

const router = express.Router();

/**
 * POST /api/auth/register
 * Rekisteröi uuden käyttäjän ja tallentaa tietokantaan
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        // Perusvalidaatio
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Täytä vähintään sähköposti, nimi ja salasana' });
        }

        // Tarkista onko email jo käytössä
        const [existing] = await pool.query(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Sähköposti on jo rekisteröity' });
        }

        // Hashaa salasana
        const hash = await bcrypt.hash(password, 10);

        // Tallenna uusi käyttäjä
        const [result] = await pool.query(
            `INSERT INTO users (email, password_hash, name, phone)
             VALUES (?, ?, ?, ?)`,
            [email, hash, name, phone || null]
        );

        const newUserId = result.insertId;

        // Voit halutessasi luoda tokenin heti rekisteröinnin jälkeen
        const token = jwt.sign(
            {
                userId: newUserId,
                email,
                name,
                isAdmin: false
            },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.status(201).json({
            message: 'Rekisteröinti onnistui',
            user: {
                user_id: newUserId,
                email,
                name,
                phone: phone || null,
                is_admin: false
            },
            token
        });

    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Palvelinvirhe rekisteröinnissä' });
    }
});

module.exports = router;
