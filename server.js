const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const RADIOBROWSER_API = 'https://de1.api.radio-browser.info/json';

// Endpoint API do pobierania najczęściej słuchanych stacji
app.get('/api/radio/top', async (req, res) => {
    try {
        const response = await axios.get(`${RADIOBROWSER_API}/stations/topclick/30`);
        res.json(response.data);
    } catch (error) {
        console.error('Błąd podczas pobierania danych z API:', error);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

// Endpoint API do pobierania stacji według nazwy
app.get('/api/radio/name', async (req, res) => {
    const name = req.query.name;
    if (!name) {
        return res.status(400).json({ error: 'Missing name parameter' });
    }
    try {
        const response = await axios.get(`${RADIOBROWSER_API}/stations/byname/${encodeURIComponent(name)}`);
        res.json(response.data);
    } catch (error) {
        console.error('Błąd podczas pobierania danych z API:', error);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

// Endpoint API do pobierania listy krajów
app.get('/api/radio/countries', async (req, res) => {
    try {
        const response = await axios.get(`${RADIOBROWSER_API}/countries`);
        res.json(response.data);
    } catch (error) {
        console.error('Błąd podczas pobierania danych z API:', error);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

// Endpoint API do pobierania stacji według kraju
app.get('/api/radio/country', async (req, res) => {
    const country = req.query.country;
    if (!country) {
        return res.status(400).json({ error: 'Missing country parameter' });
    }
    try {
        const response = await axios.get(`${RADIOBROWSER_API}/stations/bycountry/${encodeURIComponent(country)}`);
        res.json(response.data);
    } catch (error) {
        console.error('Błąd podczas pobierania danych z API:', error);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
