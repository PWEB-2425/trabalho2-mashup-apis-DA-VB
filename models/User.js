const mongoose = require('mongoose');

// Remover índices existentes
mongoose.connection.once('open', async () => {
    try {
        await mongoose.connection.collection('users').dropIndex('username_1');
        console.log('Índice username removido com sucesso');
    } catch (error) {
        console.log('Índice username não existe ou já foi removido');
    }
});

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
});

// Criar índices corretos
UserSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;