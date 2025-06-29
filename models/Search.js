const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    query: {
        type: String,
        required: true
    },
    results: {
        type: Object,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Search', searchSchema);