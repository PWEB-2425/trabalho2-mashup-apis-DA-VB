const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const Search = require('../models/Search');

// Middleware de autenticação
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Não autenticado' });
};

// Rota de pesquisa
router.get('/search', isAuthenticated, async (req, res) => {
    try {
        const { city } = req.query;

        // Chamada à API OpenWeatherMap
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.WEATHER_API_KEY}`
        );
        const weatherData = await weatherResponse.json();

        // Chamada à API RestCountries
        const countryResponse = await fetch(
            `https://restcountries.com/v3.1/alpha/${weatherData.sys.country}`
        );
        const countryData = await countryResponse.json();

        // Salvar pesquisa no histórico
        const search = new Search({
            userId: req.user._id,
            query: city,
            results: {
                weather: weatherData,
                country: countryData[0]
            }
        });
        await search.save();

        res.json({
            weather: weatherData,
            country: countryData[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar a pesquisa' });
    }
});

// Rota para obter histórico de pesquisas
router.get('/history', isAuthenticated, async (req, res) => {
    try {
        const searches = await Search.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(searches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter histórico' });
    }
});

module.exports = router;