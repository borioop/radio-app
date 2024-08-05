// netlify/functions/radio-api.js
const axios = require('axios');

const RADIOBROWSER_API = 'https://de1.api.radio-browser.info/json';

exports.handler = async function(event, context) {
    const name = event.queryStringParameters.name;

    if (!name) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing name parameter' }),
        };
    }

    try {
        const response = await axios.get(`${RADIOBROWSER_API}/stations/byname/${encodeURIComponent(name)}`);
        const stations = response.data;

        if (stations.length > 0) {
            return {
                statusCode: 200,
                body: JSON.stringify(stations.slice(0, 10)),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Station not found' }),
            };
        }
    } catch (error) {
        console.error('Error fetching data from API:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server error' }),
        };
    }
};
