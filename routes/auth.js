const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Middleware para verificar se usuário NÃO está autenticado
const forwardAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/dashboard');
};

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => {
    console.log('Página de login acessada');
    res.render('login', {
        error: req.flash('error'),
        success_msg: req.flash('success_msg')
    });
});

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => {
    console.log('Página de registro acessada');
    res.render('register', {
        error: req.flash('error')
    });
});

// Rota especial para criar admin
router.get('/create-admin', async (req, res) => {
    try {
        // Verificar se já existe um admin
        const adminExists = await User.findOne({ isAdmin: true });
        if (adminExists) {
            return res.json({ 
                message: 'Admin já existe', 
                admin: adminExists.email 
            });
        }

        // Criar admin
        const hashedPassword = await bcrypt.hash('admin2024', 10);
        const admin = new User({
            name: 'Administrator',
            email: 'admin@davb.com',
            password: hashedPassword,
            isAdmin: true,
            createdAt: new Date(),
            lastLogin: new Date()
        });

        await admin.save();
        console.log('Admin criado com sucesso:', admin.email);
        
        res.json({ 
            message: 'Admin criado com sucesso',
            credentials: {
                email: 'admin@davb.com',
                password: 'admin2024'
            }
        });
    } catch (error) {
        console.error('Erro ao criar admin:', error);
        res.status(500).json({ error: 'Erro ao criar admin' });
    }
});

// Register Handle
router.post('/register', async (req, res) => {
    try {
        console.log('Dados do registro recebidos:', req.body);
        const { name, email, password, password2 } = req.body;
        let errors = [];

        // Validação
        if (!name || !email || !password || !password2) {
            errors.push({ msg: 'Por favor preencha todos os campos' });
        }
        if (password !== password2) {
            errors.push({ msg: 'Senhas não conferem' });
        }
        if (password.length < 6) {
            errors.push({ msg: 'Senha deve ter pelo menos 6 caracteres' });
        }

        if (errors.length > 0) {
            console.log('Erros de validação:', errors);
            return res.render('register', {
                errors,
                name,
                email
            });
        }

        // Verificar se usuário já existe
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            console.log('Email já registrado:', email);
            errors.push({ msg: 'Email já registrado' });
            return res.render('register', {
                errors,
                name,
                email
            });
        }

        // Criar novo usuário
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            createdAt: new Date(),
            lastLogin: new Date()
        });

        await newUser.save();
        console.log('Novo usuário registrado:', email);
        req.flash('success_msg', 'Você está registrado e pode fazer login');
        res.redirect('/auth/login');
    } catch (err) {
        console.error('Erro no registro:', err);
        res.render('register', {
            error: 'Erro no registro. Tente novamente.'
        });
    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    console.log('Tentativa de login recebida para:', req.body.email);
    
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Erro na autenticação:', err);
            req.flash('error', 'Erro interno do servidor');
            return res.redirect('/auth/login');
        }
        
        if (!user) {
            console.log('Login falhou:', info.message);
            req.flash('error', info.message);
            return res.redirect('/auth/login');
        }
        
        req.logIn(user, (err) => {
            if (err) {
                console.error('Erro no login:', err);
                req.flash('error', 'Erro ao fazer login');
                return res.redirect('/auth/login');
            }
            
            console.log('Login bem-sucedido:', user.email);
            // Atualizar último login
            user.lastLogin = new Date();
            user.save().then(() => {
                console.log('Último login atualizado para:', user.email);
                return res.redirect('/dashboard');
            }).catch(err => {
                console.error('Erro ao atualizar último login:', err);
                return res.redirect('/dashboard');
            });
        });
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res, next) => {
    console.log('Logout solicitado para usuário:', req.user?.email);
    req.logout((err) => {
        if (err) {
            console.error('Erro no logout:', err);
            return next(err);
        }
        console.log('Logout realizado com sucesso');
        req.flash('success_msg', 'Você saiu com sucesso');
        res.redirect('/auth/login');
    });
});

// Rota de teste de sessão
router.get('/session-check', (req, res) => {
    res.json({
        sessionID: req.sessionID,
        authenticated: req.isAuthenticated(),
        user: req.user,
        session: req.session
    });
});

module.exports = router;