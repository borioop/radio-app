const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;
const apiURL = 'http://www.radio-browser.info/webservice/json/stations/';

app.use(express.static('public'));

app.get('/api/radio/top', (req, res) => {
    axios.get(apiURL + 'topclick/10')
        .then(response => res.json(response.data))
        .catch(error => res.status(500).json({ error: error.toString() }));
});

app.get('/api/radio/name', (req, res) => {
    const { name } = req.query;
    axios.get(`${apiURL}search?name=${name}`)
        .then(response => res.json(response.data))
        .catch(error => res.status(500).json({ error: error.toString() }));
});

app.get('/api/radio/filter', (req, res) => {
    const { country, language, tag, order } = req.query;
    let query = 'search?';

    if (country) query += `country=${country}&`;
    if (language) query += `language=${language}&`;
    if (tag) query += `tag=${tag}&`;
    if (order) query += `order=${order}&`;

    axios.get(apiURL + query)
        .then(response => res.json(response.data))
        .catch(error => res.status(500).json({ error: error.toString() }));
});

app.get('/api/radio/filters', (req, res) => {
    Promise.all([
        axios.get(apiURL + 'countries'),
        axios.get(apiURL + 'languages'),
        axios.get(apiURL + 'tags')
    ])
    .then(([countriesRes, languagesRes, tagsRes]) => {
        res.json({
            countries: countriesRes.data.map(country => country.name),
            languages: languagesRes.data.map(language => language.name),
            tags: tagsRes.data.map(tag => tag.name)
        });
    })
    .catch(error => res.status(500).json({ error: error.toString() }));
});

app.get('/api/radio/url', (req, res) => {
    const { url } = req.query;
    axios.get(`${apiURL}search?url=${url}`)
        .then(response => res.json(response.data[0]))
        .catch(error => res.status(500).json({ error: error.toString() }));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
