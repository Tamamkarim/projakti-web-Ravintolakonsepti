const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();

const app = express();
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
        res.sendStatus(200);
    } else {
        next();
    }
});

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Lisää middleware turvallisuudelle ja validoinnille
const { rateLimit, errorLogger } = require('./middleware/validation');

// Frontend-tiedostojen palvelu välimuistin hallinnalla
app.use(express.static(path.join(__dirname, '../frontend'), {
    maxAge: NODE_ENV === 'production' ? '1d' : '0',
    etag: false
}));

// Pyyntöjen kirjaus kehitystilassa
if (NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        next();
    });
}

// API-reitit (järjestys tärkeä - tarkimmat ensin)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin', require('./routes/admin-api'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/recipes', require('./routes/recipe'));

// API base route - return basic info instead of falling through to HTML
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

// JWT middleware (uses shared JWT_SECRET)
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./routes/shared');

function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'مطلوب تسجيل الدخول' });
    }
    try {
        const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        console.error('JWT verification failed:', e.message);
        return res.status(401).json({ error: 'رمز غير صالح' });
    }
}

// مثال لمسار إدارة محمي
app.get('/api/admin/secret', authMiddleware, (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'غير مصرح' });
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

// Catch-all käsittelijä: palvele frontend kaikille ei-API reiteille
app.use((req, res, next) => {
    // Vältä API-reittien palvelua
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API-päätepistettä ei löydy' });
    }
    // Palvele index.html muille reiteille
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
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

// Käsittele palvelimen sulkeminen siististi
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

