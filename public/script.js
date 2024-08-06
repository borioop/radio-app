let currentStation = null;
let isMuted = false;
let favoriteStations = JSON.parse(localStorage.getItem('favoriteStations')) || [];

// Automatycznie załaduj najczęściej słuchane stacje przy starcie
document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/radio/top')
        .then(response => response.json())
        .then(data => {
            console.log('Odpowiedź API:', data); // Logowanie danych do sprawdzenia
            if (Array.isArray(data)) {
                displayStationList(data);
            } else {
                console.error('Oczekiwano tablicy stacji, otrzymano:', data);
                alert('Nie udało się pobrać najczęściej słuchanych stacji.');
            }
        })
        .catch(error => {
            console.error('Błąd:', error);
            alert('Nie udało się pobrać najczęściej słuchanych stacji.');
        });
});

// Obsługa przycisku 'Szukaj według nazwy'
document.getElementById('search-name').addEventListener('click', function() {
    const name = document.getElementById('station-name').value;
    if (name) {
        fetch(`/api/radio/name?name=${name}`)
            .then(response => response.json())
            .then(data => {
                console.log('Odpowiedź API:', data); // Logowanie danych do sprawdzenia
                if (Array.isArray(data)) {
                    displayStationList(data);
                } else {
                    console.error('Oczekiwano tablicy stacji, otrzymano:', data);
                    alert('Nie znaleziono stacji.');
                }
            })
            .catch(error => {
                console.error('Błąd:', error);
                alert('Nie znaleziono stacji.');
            });
    } else {
        alert('Proszę wprowadzić nazwę stacji.');
    }
});

// Obsługa filtrowania
document.getElementById('filter-button').addEventListener('click', function() {
    const country = document.getElementById('country-filter').value;
    const language = document.getElementById('language-filter').value;
    const tag = document.getElementById('tag-filter').value;
    let url = '/api/radio/filter?';

    if (country) url += `country=${country}&`;
    if (language) url += `language=${language}&`;
    if (tag) url += `tag=${tag}&`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Odpowiedź API:', data); // Logowanie danych do sprawdzenia
            if (Array.isArray(data)) {
                displayStationList(data);
            } else {
                console.error('Oczekiwano tablicy stacji, otrzymano:', data);
                alert('Nie udało się pobrać filtrów.');
            }
        })
        .catch(error => {
            console.error('Błąd:', error);
            alert('Nie udało się pobrać filtrów.');
        });
});

// Wyświetlanie listy stacji
function displayStationList(stations) {
    const stationList = document.getElementById('stations');
    stationList.innerHTML = '';

    stations.forEach(station => {
        const listItem = document.createElement('li');
        listItem.textContent = station.name;
        listItem.dataset.url = station.url;

        const playIcon = document.createElement('i');
        playIcon.className = 'fas fa-play play-icon';
        playIcon.addEventListener('click', () => playStation(station.url, station.name));
        listItem.appendChild(playIcon);

        const favoriteIcon = document.createElement('i');
        favoriteIcon.className = 'fas fa-heart favorite-icon';
        favoriteIcon.classList.toggle('favorited', favoriteStations.includes(station.url));
        favoriteIcon.addEventListener('click', () => toggleFavorite(station.url, favoriteIcon));
        listItem.appendChild(favoriteIcon);

        stationList.appendChild(listItem);
    });
}

// Odtwarzanie stacji radiowej
function playStation(url, name) {
    const player = document.getElementById('radio-player');
    player.src = url;
    player.play();
    document.getElementById('station-name-display').textContent = name;
    document.getElementById('play-button').style.display = 'none';
    document.getElementById('play-label').style.display = 'none';
    document.getElementById('stop-button').style.display = 'inline';
    document.getElementById('stop-label').style.display = 'inline';
}

// Przerywanie odtwarzania
document.getElementById('stop-button').addEventListener('click', function() {
    const player = document.getElementById('radio-player');
    player.pause();
    document.getElementById('station-name-display').textContent = 'Nazwa Stacji';
    document.getElementById('play-button').style.display = 'inline';
    document.getElementById('play-label').style.display = 'inline';
    document.getElementById('stop-button').style.display = 'none';
    document.getElementById('stop-label').style.display = 'none';
});

// Obsługa głośności
document.getElementById('volume-control').addEventListener('input', function() {
    const player = document.getElementById('radio-player');
    player.volume = this.value;
});

document.getElementById('mute-button').addEventListener('click', function() {
    const player = document.getElementById('radio-player');
    isMuted = !isMuted;
    player.muted = isMuted;
    this.className = isMuted ? 'fas fa-volume-mute control-icon' : 'fas fa-volume-up control-icon';
});

// Obsługa ulubionych stacji
function toggleFavorite(url, icon) {
    const index = favoriteStations.indexOf(url);
    if (index === -1) {
        favoriteStations.push(url);
        icon.classList.add('favorited');
    } else {
        favoriteStations.splice(index, 1);
        icon.classList.remove('favorited');
    }
    localStorage.setItem('favoriteStations', JSON.stringify(favoriteStations));
}

// Aktualizowanie listy ulubionych
function updateFavoriteStations() {
    const favoritesList = document.getElementById('favorites');
    favoritesList.innerHTML = '';

    favoriteStations.forEach(url => {
        fetch(`/api/radio/url?url=${url}`)
            .then(response => response.json())
            .then(data => {
                const listItem = document.createElement('li');
                listItem.textContent = data.name;
                listItem.dataset.url = url;
                listItem.addEventListener('click', () => playStation(url, data.name));

                const favoriteIcon = document.createElement('i');
                favoriteIcon.className = 'fas fa-heart favorite-icon favorited';
                favoriteIcon.addEventListener('click', () => toggleFavorite(url, favoriteIcon));
                listItem.appendChild(favoriteIcon);

                favoritesList.appendChild(listItem);
            });
    });
}

updateFavoriteStations();
