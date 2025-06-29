const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Middleware para verificar autenticação
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
};

// Rotas de Login
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
}));

// Rotas de Registo
router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const userExists = await User.findOne({ username });
        
        if (userExists) {
            return res.redirect('/auth/register');
        }

        const user = new User({ username, password });
        await user.save();
        
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        res.redirect('/auth/register');
    }
});

// Rota de Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/auth/login');
});

module.exports = router;