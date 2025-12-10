// Tämä tiedosto on tarkoituksella tyhjä.
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const database = require('./database/db');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware turvallisuudelle ja suorituskyvyn parantamiselle
app.use((req, res, next) => {
    // CORS-otsikkojen asetus
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    // Lisäturvallisuusasetukset
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// (Jos sulla on nämä middlewaret, voit käyttää niitä)
const { rateLimit, errorLogger } = require('./middleware/validation');

// Frontend-tiedostojen palvelu
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: NODE_ENV === 'production' ? '1d' : '0',
    etag: false
}));
// إضافة خدمة ملفات frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Pyyntöjen kirjaus kehitystilassa
if (NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        next();
    });
}

// API-reitit
app.use('/api/auth', require('./src/api/auth'));
app.use('/api/admin', require('./src/api/admin-api'));
app.use('/api/menu', require('./src/api/menu'));
// GET /api/categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await database.getAllCategories();
        res.json({ success: true, data: categories, count: categories.length });
    } catch (error) {
        console.error('Virhe kategorioiden haussa:', error);
        res.status(500).json({ success: false, error: 'Virhe kategorioiden haussa' });
    }
});

// GET /api/recipes
app.get('/api/recipes', async (req, res) => {
    try {
        const recipes = await database.getAllRecipes();
        res.json({ success: true, data: recipes, count: recipes.length });
    } catch (error) {
        console.error('Virhe reseptien haussa:', error);
        res.status(500).json({ success: false, error: 'Virhe reseptien haussa' });
    }
});
// app.use('/api/recipes', require('./src/routes/recipe'));

// API base route
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Apricus Restaurant API',
        version: '1.0.0',
        endpoints: [
            '/api/auth',
            '/api/admin',
            '/api/menu',
            '/api/recipes'
        ]
    });
});

// JWT middleware
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Kirjautuminen vaaditaan' });
    }
    try {
        const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        console.error('JWT verification failed:', e.message);
        return res.status(401).json({ error: 'Virheellinen tunnus' });
    }
}

// Esimerkki admin-reitistä
app.get('/api/admin/secret', authMiddleware, (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Ei oikeutta' });
    }
    res.json({ message: 'Tervetuloa, järjestelmänvalvoja!' });
});

// Virheiden käsittely
app.use((err, req, res, next) => {
    console.error('Virhe:', err.stack);
    res.status(500).json({ 
        error: NODE_ENV === 'development' ? err.message : 'Palvelinvirhe',
        ...(NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Catch-all: palvele frontend kaikille ei-API reiteille
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API-päätepistettä ei löydy' });
    }
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Käynnistä palvelin
const server = app.listen(PORT, () => {
    console.log('==============================');
    console.log(`✅  Palvelin käynnissä!`);
    console.log(`🌐  Frontend: http://localhost:${PORT}`);
    console.log(`🔧  API-pohja: http://localhost:${PORT}/api`);
    console.log(`📁  Ympäristö: ${NODE_ENV}`);
    console.log('==============================');
});

// Siisti sulkeminen
process.on('SIGTERM', () => {
    console.log('SIGTERM vastaanotettu. Suljetaan siististi...');
    server.close(() => {
        console.log('Prosessi lopetettu');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT vastaanotettu. Suljetaan siististi...');
    server.close(() => {
        console.log('Prosessi lopetettu');
    });
});

module.exports = app;
