const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password'
            },
            async (email, password, done) => {
                try {
                    console.log('Tentativa de login para:', email);
                    
                    // Procurar usuário
                    const user = await User.findOne({ email: email.toLowerCase() });
                    
                    if (!user) {
                        console.log('Usuário não encontrado:', email);
                        return done(null, false, { message: 'Email não registrado' });
                    }

                    // Verificar senha
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (!isMatch) {
                        console.log('Senha incorreta para:', email);
                        return done(null, false, { message: 'Senha incorreta' });
                    }

                    console.log('Login bem-sucedido para:', email);
                    return done(null, user);
                } catch (err) {
                    console.error('Erro no processo de login:', err);
                    return done(err);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        console.log('Serializando usuário:', user.id);
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            console.log('Deserializando usuário:', id);
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            console.error('Erro na deserialização:', err);
            done(err);
        }
    });
};