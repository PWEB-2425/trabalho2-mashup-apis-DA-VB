const mongoose = require('mongoose');
require('dotenv').config();

async function resetDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado ao MongoDB');

        // Remover todos os documentos e índices
        await mongoose.connection.db.collection('users').drop();
        console.log('Coleção users removida');

        // Criar admin
        const bcrypt = require('bcryptjs');
        const User = require('../models/User');

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

        console.log('Banco de dados resetado com sucesso');
    } catch (error) {
        console.error('Erro ao resetar banco de dados:', error);
    } finally {
        await mongoose.connection.close();
    }
}

resetDatabase();