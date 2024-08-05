const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Adres URL API RadioBrowser
const RADIOBROWSER_API = 'https://de1.api.radio-browser.info/json';

// Ustawienie katalogu statycznego
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint API do wyszukiwania stacji według nazwy
app.get('/api/radio/name', async (req, res) => {
    const name = req.query.name;

    if (!name) {
        return res.status(400).json({ error: 'Missing name parameter' });
    }

    try {
        const response = await axios.get(`${RADIOBROWSER_API}/stations/byname/${encodeURIComponent(name)}`);
        const stations = response.data;

        if (stations.length > 0) {
            res.json(stations.slice(0, 10)); // Zwróć top 10 stacji
        } else {
            res.status(404).json({ error: 'Stacja nie znaleziona' });
        }
    } catch (error) {
        console.error('Błąd podczas pobierania danych z API:', error);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

// Endpoint API do pobierania najczęściej słuchanych stacji
app.get('/api/radio/top', async (req, res) => {
    try {
        const response = await axios.get(`${RADIOBROWSER_API}/stations/topvote/10`);
        const stations = response.data;
        res.json(stations);
    } catch (error) {
        console.error('Błąd podczas pobierania danych z API:', error);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

// Endpoint API do pobierania szczegółowych informacji o stacji
app.get('/api/radio/details', async (req, res) => {
    const id = req.query.id;

    if (!id) {
        return res.status(400).json({ error: 'Missing id parameter' });
    }

    try {
        const response = await axios.get(`${RADIOBROWSER_API}/stations/byid/${id}`);
        const station = response.data;
        res.json(station);
    } catch (error) {
        console.error('Błąd podczas pobierania danych z API:', error);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

// Endpoint API do pobierania stacji według gatunku
app.get('/api/radio/genre', async (req, res) => {
    const genre = req.query.genre;

    if (!genre) {
        return res.status(400).json({ error: 'Missing genre parameter' });
    }

    try {
        const response = await axios.get(`${RADIOBROWSER_API}/stations/bytag/${encodeURIComponent(genre)}`);
        const stations = response.data;
        res.json(stations);
    } catch (error) {
        console.error('Błąd podczas pobierania danych z API:', error);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

// Serwer nasłuchuje na porcie 3000
app.listen(port, () => {
    console.log(`Serwer uruchomiony na http://localhost:${port}`);
});
