require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const flash = require('connect-flash');

// Inicializar Express
const app = express();

// Configurar trust proxy
app.set('trust proxy', 1);

// Timestamp e usuário
const TIMESTAMP = '2025-06-29 22:51:26';
const USER = 'DA-VB';

console.log(`Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): ${TIMESTAMP}`);
console.log(`Current User's Login: ${USER}`);

// Aplicar middleware de segurança
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https://api.openweathermap.org"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'none'"],
            frameSrc: ["'none'"]
        }
    }
}));

// Configurar rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite de 100 requisições por IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.log('Rate limit excedido para IP:', req.ip);
        res.status(429).json({
            error: 'Muitas requisições, tente novamente mais tarde'
        });
    }
});

app.use('/api/', limiter);

// Configurações do Express
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Conectado ao MongoDB');
        console.log(`Data atual (UTC): ${new Date().toISOString()}`);
        console.log(`Usuário: ${USER}`);
    })
    .catch(err => console.error('Erro na conexão com MongoDB:', err));

// Configuração da sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret_key',
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60,
        autoRemove: 'native',
        touchAfter: 24 * 3600
    }),
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    },
    name: 'sessionId'
}));

// Flash messages
app.use(flash());

// Inicialização do Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurar Passport
require('./config/passport')(passport);

// Global variables
app.use((req, res, next) => {
    // Debug logs
    console.log('Session ID:', req.sessionID);
    console.log('Authenticated:', req.isAuthenticated());
    if (req.user) {
        console.log('User:', req.user.email);
    }

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Middleware de autenticação
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        console.log('Usuário autenticado:', req.user.email);
        return next();
    }
    console.log('Acesso não autorizado - redirecionando para login');
    req.flash('error_msg', 'Por favor, faça login para acessar esta página');
    res.redirect('/auth/login');
};

// Rotas
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Rota principal
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        console.log('Usuário autenticado, redirecionando para dashboard');
        res.redirect('/dashboard');
    } else {
        console.log('Usuário não autenticado, redirecionando para login');
        res.redirect('/auth/login');
    }
});

// Rota do dashboard
app.get('/dashboard', isAuthenticated, (req, res) => {
    console.log('Acessando dashboard:', req.user.email);
    res.render('dashboard', {
        user: req.user,
        timestamp: TIMESTAMP,
        currentUser: USER
    });
});

// Manipulação de erros 404
app.use((req, res, next) => {
    console.log('404 - Página não encontrada:', req.url);
    res.status(404).render('404', {
        message: 'Página não encontrada',
        user: req.user
    });
});

// Manipulação de erros 500
app.use((err, req, res, next) => {
    console.error('Erro interno do servidor:', err);
    res.status(500).render('error', {
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err : {},
        user: req.user
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor em execução na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Data atual (UTC): ${new Date().toISOString()}`);
    console.log(`Usuário: ${USER}`);
});

// Manipulação de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

module.exports = app;