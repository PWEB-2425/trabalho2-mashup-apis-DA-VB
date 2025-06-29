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

// Rota para obter dados do clima e do país
router.get('/weather/:city', isAuthenticated, async (req, res) => {
    try {
        const city = req.params.city;
        const apiKey = process.env.WEATHER_API_KEY;
        
        // 1. Buscar dados do clima
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (!weatherResponse.ok) {
            return res.status(weatherResponse.status).json({
                error: 'Cidade não encontrada',
                details: weatherData.message
            });
        }

        // 2. Buscar dados do país usando o código do país do OpenWeather
        const countryCode = weatherData.sys.country;
        const countryUrl = `https://restcountries.com/v3.1/alpha/${countryCode}`;
        const countryResponse = await fetch(countryUrl);
        const countryData = await countryResponse.json();

        // Log da busca
        console.log(`[${new Date().toISOString()}] User ${req.user.email} searched for: ${city}`);
        
        // Combinar dados de ambas as APIs
        const responseData = {
            weather: {
                city: weatherData.name,
                country: weatherData.sys.country,
                temperature: Math.round(weatherData.main.temp),
                description: weatherData.weather[0].description,
                humidity: weatherData.main.humidity,
                windSpeed: weatherData.wind.speed,
                icon: weatherData.weather[0].icon
            },
            countryInfo: {
                name: countryData[0].name.common,
                capital: countryData[0].capital?.[0] || 'N/A',
                population: countryData[0].population,
                region: countryData[0].region,
                subregion: countryData[0].subregion,
                languages: countryData[0].languages,
                currencies: countryData[0].currencies,
                flag: countryData[0].flags.png,
                maps: countryData[0].maps.googleMaps
            },
            timestamp: new Date().toISOString()
        };

        res.json(responseData);
    } catch (error) {
        console.error('Erro na API:', error);
        res.status(500).json({
            error: 'Erro ao buscar dados',
            details: error.message
        });
    }
});

module.exports = router;