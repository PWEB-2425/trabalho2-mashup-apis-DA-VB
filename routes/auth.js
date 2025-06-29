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
    res.render('login', {
        user: req.user,
        error: req.flash('error')
    });
});

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => {
    res.render('register', {
        user: req.user,
        error: req.flash('error')
    });
});

// Register Handle
router.post('/register', async (req, res) => {
    try {
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
            return res.render('register', {
                errors,
                name,
                email,
                password,
                password2
            });
        }

        // Verificar se usuário já existe
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            errors.push({ msg: 'Email já registrado' });
            return res.render('register', {
                errors,
                name,
                email,
                password,
                password2
            });
        }

        // Criar novo usuário
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            lastLogin: new Date()
        });

        await newUser.save();
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
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
            console.error('Erro no logout:', err);
            return next(err);
        }
        req.flash('success_msg', 'Você saiu com sucesso');
        res.redirect('/auth/login');
    });
});

module.exports = router;