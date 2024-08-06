let currentStation = null;
let isMuted = false;
let favoriteStations = JSON.parse(localStorage.getItem('favoriteStations')) || [];

// Automatycznie załaduj najczęściej słuchane stacje przy starcie
document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/radio/top')
        .then(response => response.json())
        .then(data => {
            displayStationList(data);
        })
        .catch(error => {
            console.error('Błąd:', error);
            alert('Nie udało się pobrać najczęściej słuchanych stacji.');
        });

    // Załaduj opcje filtrowania
    loadFilterOptions();
});

// Obsługa przycisku 'Szukaj według nazwy'
document.getElementById('search-name').addEventListener('click', function() {
    const name = document.getElementById('station-name').value;
    if (name) {
        fetch(`/api/radio/name?name=${name}`)
            .then(response => response.json())
            .then(data => {
                displayStationList(data);
            })
            .catch(error => {
                console.error('Błąd:', error);
                alert('Nie udało się znaleźć stacji o podanej nazwie.');
            });
    }
});

// Obsługa filtrowania według kraju, języka, tagów i popularności
document.getElementById('filter-country').addEventListener('change', filterStations);
document.getElementById('filter-language').addEventListener('change', filterStations);
document.getElementById('filter-tag').addEventListener('change', filterStations);
document.getElementById('filter-popularity').addEventListener('change', filterStations);

function filterStations() {
    const country = document.getElementById('filter-country').value;
    const language = document.getElementById('filter-language').value;
    const tag = document.getElementById('filter-tag').value;
    const popularity = document.getElementById('filter-popularity').value;

    let query = '/api/radio/filter?';
    if (country) query += `country=${country}&`;
    if (language) query += `language=${language}&`;
    if (tag) query += `tag=${tag}&`;
    if (popularity) query += `order=${popularity}&`;

    fetch(query)
        .then(response => response.json())
        .then(data => {
            displayStationList(data);
        })
        .catch(error => {
            console.error('Błąd:', error);
            alert('Nie udało się zastosować filtru.');
        });
}

function displayStationList(stations) {
    const stationsList = document.getElementById('stations');
    stationsList.innerHTML = '';

    stations.forEach(station => {
        const li = document.createElement('li');
        li.textContent = station.name;
        li.dataset.stationUrl = station.url;
        li.dataset.stationName = station.name;
        li.addEventListener('click', () => playStation(station.url, station.name));

        const playIcon = document.createElement('i');
        playIcon.classList.add('fas', 'fa-play', 'play-icon');
        li.appendChild(playIcon);

        const favoriteIcon = document.createElement('i');
        favoriteIcon.classList.add('fas', 'fa-heart', 'favorite-icon');
        if (favoriteStations.includes(station.url)) {
            favoriteIcon.classList.add('favorited');
        }
        favoriteIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavoriteStation(station.url, station.name);
            favoriteIcon.classList.toggle('favorited');
        });
        li.appendChild(favoriteIcon);

        stationsList.appendChild(li);
    });
}

function loadFilterOptions() {
    fetch('/api/radio/filters')
        .then(response => response.json())
        .then(data => {
            populateSelectOptions('filter-country', data.countries);
            populateSelectOptions('filter-language', data.languages);
            populateSelectOptions('filter-tag', data.tags);
        })
        .catch(error => {
            console.error('Błąd:', error);
        });
}

function populateSelectOptions(selectId, options) {
    const select = document.getElementById(selectId);
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
    });
}

function playStation(url, name) {
    const player = document.getElementById('radio-player');
    player.src = url;
    player.play();
    currentStation = url;
    document.getElementById('station-name-display').textContent = name;
    document.getElementById('play-button').style.display = 'none';
    document.getElementById('stop-button').style.display = 'inline';
    document.getElementById('play-label').style.display = 'none';
    document.getElementById('stop-label').style.display = 'inline';
}

document.getElementById('stop-button').addEventListener('click', function() {
    const player = document.getElementById('radio-player');
    player.pause();
    currentStation = null;
    document.getElementById('station-name-display').textContent = 'Nazwa Stacji';
    document.getElementById('play-button').style.display = 'inline';
    document.getElementById('stop-button').style.display = 'none';
    document.getElementById('play-label').style.display = 'inline';
    document.getElementById('stop-label').style.display = 'none';
});

document.getElementById('volume-control').addEventListener('input', function() {
    const player = document.getElementById('radio-player');
    player.volume = this.value;
});

document.getElementById('mute-button').addEventListener('click', function() {
    const player = document.getElementById('radio-player');
    isMuted = !isMuted;
    player.muted = isMuted;
    this.classList.toggle('fa-volume-up', !isMuted);
    this.classList.toggle('fa-volume-mute', isMuted);
});

function toggleFavoriteStation(url, name) {
    if (favoriteStations.includes(url)) {
        favoriteStations = favoriteStations.filter(station => station !== url);
    } else {
        favoriteStations.push(url);
    }
    localStorage.setItem('favoriteStations', JSON.stringify(favoriteStations));
    displayFavoriteStations();
}

function displayFavoriteStations() {
    const favoritesList = document.getElementById('favorites');
    favoritesList.innerHTML = '';
    favoriteStations.forEach(stationUrl => {
        fetch(`/api/radio/url?url=${encodeURIComponent(stationUrl)}`)
            .then(response => response.json())
            .then(station => {
                const li = document.createElement('li');
                li.textContent = station.name;
                li.dataset.stationUrl = station.url;
                li.dataset.stationName = station.name;
                li.addEventListener('click', () => playStation(station.url, station.name));

                const playIcon = document.createElement('i');
                playIcon.classList.add('fas', 'fa-play', 'play-icon');
                li.appendChild(playIcon);

                const favoriteIcon = document.createElement('i');
                favoriteIcon.classList.add('fas', 'fa-heart', 'favorite-icon', 'favorited');
                favoriteIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleFavoriteStation(station.url, station.name);
                    li.remove();
                });
                li.appendChild(favoriteIcon);

                favoritesList.appendChild(li);
            })
            .catch(error => {
                console.error('Błąd:', error);
            });
    });
}

displayFavoriteStations();
