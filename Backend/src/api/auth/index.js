const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../../utils/database');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'superSalainenJwtAvain123';

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Täytä vähintään nimi, sähköposti ja salasana'
      });
    }

    // Onko email jo olemassa?
    const [existing] = await pool.query(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Sähköposti on jo rekisteröity'
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (email, password_hash, name, phone)
       VALUES (?, ?, ?, ?)`,
      [email, hash, name, phone || null]
    );

    const userId = result.insertId;

    const token = jwt.sign(
      {
        userId,
        email,
        name,
        isAdmin: false
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.status(201).json({
      success: true,
      message: 'Rekisteröinti onnistui',
      user: {
        user_id: userId,
        email,
        name,
        phone: phone || null,
        is_admin: false
      },
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      success: false,
      error: 'Palvelinvirhe rekisteröinnissä'
    });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Anna sähköposti ja salasana'
      });
    }

    const [rows] = await pool.query(
      `SELECT user_id, email, password_hash, name, is_admin, is_active
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Väärä sähköposti tai salasana'
      });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Käyttäjätili ei ole aktiivinen'
      });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({
        success: false,
        error: 'Väärä sähköposti tai salasana'
      });
    }

    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE user_id = ?',
      [user.user_id]
    );

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
      success: true,
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
    return res.status(500).json({
      success: false,
      error: 'Palvelinvirhe kirjautumisessa'
    });
  }
});

module.exports = router;
