const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Middleware de autenticação
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Não autorizado' });
};

// Rota para obter dados do clima
router.get('/weather/:city', isAuthenticated, async (req, res) => {
    try {
        const city = req.params.city;
        const apiKey = process.env.WEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            // Log da busca
            console.log(`[${new Date().toISOString()}] User ${req.user.email} searched for: ${city}`);
            
            // Formatar os dados do clima
            const weatherData = {
                city: data.name,
                country: data.sys.country,
                temperature: Math.round(data.main.temp),
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                icon: data.weather[0].icon,
                timestamp: new Date().toISOString(),
                user: req.user.email
            };

            res.json(weatherData);
        } else {
            res.status(response.status).json({
                error: 'Cidade não encontrada',
                details: data.message
            });
        }
    } catch (error) {
        console.error('Erro na API do clima:', error);
        res.status(500).json({
            error: 'Erro ao buscar dados do clima',
            details: error.message
        });
    }
});

module.exports = router;