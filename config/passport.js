const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' },
        async (email, password, done) => {
            try {
                // Procurar usuário
                const user = await User.findOne({ email: email });
                if (!user) {
                    return done(null, false, { message: 'Email não registrado' });
                }

                // Verificar senha
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: 'Senha incorreta' });
                }

                // Atualizar último login
                user.lastLogin = new Date();
                await user.save();

                return done(null, user);
            } catch (err) {
                console.error('Erro no login:', err);
                return done(err);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};