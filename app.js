require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const mongoose = require('mongoose');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Inicializar Express
const app = express();

// Aplicar middleware de segurança
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https://api.openweathermap.org"]
        }
    }
}));

// Configurar rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
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
        console.log(`Usuário: DA-VB`);
    })
    .catch(err => console.error('Erro na conexão com MongoDB:', err));

// Configuração da sessão
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60,
        autoRemove: 'native'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Inicialização do Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Middleware de autenticação
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
};

// Middleware para dados do usuário
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

// Rotas
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Rota principal
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/auth/login');
    }
});

// Rota do dashboard
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', {
        user: req.user,
        currentTime: new Date().toISOString(),
        lastLogin: req.user.lastLogin || 'Primeiro login'
    });
});

// Manipulação de erros
app.use((req, res, next) => {
    res.status(404).render('404', {
        message: 'Página não encontrada'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor em execução na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Data atual (UTC): ${new Date().toISOString()}`);
    console.log(`Usuário: DA-VB`);
});

module.exports = app;