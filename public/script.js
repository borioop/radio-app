let currentStation = null;
let isMuted = false;
let favoriteStations = JSON.parse(localStorage.getItem('favoriteStations')) || [];

// Funkcja do wyświetlania listy stacji
function displayStationList(stations) {
    const listContainer = document.getElementById('station-list');
    const stationsList = document.getElementById('stations');
    stationsList.innerHTML = '';

    if (Array.isArray(stations)) {
        stations.forEach(station => {
            const listItem = document.createElement('li');
            listItem.textContent = `${station.name} (${station.country})`;
            const playIcon = document.createElement('i');
            playIcon.classList.add('fas', 'fa-play', 'play-icon');
            listItem.appendChild(playIcon);
            
            const favoriteIcon = document.createElement('i');
            favoriteIcon.classList.add('fas', 'fa-heart', 'favorite-icon');
            if (favoriteStations.some(fav => fav.url === station.url)) {
                favoriteIcon.classList.add('favorited');
            }
            favoriteIcon.addEventListener('click', (event) => {
                event.stopPropagation();
                toggleFavorite(station, favoriteIcon);
            });
            listItem.appendChild(favoriteIcon);
            
            listItem.addEventListener('click', () => playStation(station));
            stationsList.appendChild(listItem);
        });
        listContainer.style.display = 'block';
        displayFavoriteStations();
    } else {
        console.error('Oczekiwano tablicy stacji, otrzymano:', stations);
        alert('Nie udało się załadować stacji.');
    }
}

// Funkcja do wyświetlania ulubionych stacji
function displayFavoriteStations() {
    const favoritesContainer = document.getElementById('favorite-stations');
    const favoritesList = document.getElementById('favorites');
    favoritesList.innerHTML = '';

    favoriteStations.forEach(station => {
        const listItem = document.createElement('li');
        listItem.textContent = `${station.name} (${station.country})`;
        const playIcon = document.createElement('i');
        playIcon.classList.add('fas', 'fa-play', 'play-icon');
        listItem.appendChild(playIcon);
        listItem.addEventListener('click', () => playStation(station));
        favoritesList.appendChild(listItem);
    });
    favoritesContainer.style.display = 'block';
}

// Funkcja do odtwarzania stacji
function playStation(station) {
    const player = document.getElementById('radio-player');
    player.src = station.url;
    player.play();
    document.getElementById('station-name-display').textContent = station.name;
    document.getElementById('play-button').style.display = 'none';
    document.getElementById('stop-button').style.display = 'block';
    document.getElementById('play-label').style.display = 'none';
    document.getElementById('stop-label').style.display = 'block';
    document.getElementById('volume-control').style.display = 'block'; // Pasek głośności widoczny

    if (currentStation) {
        currentStation.querySelector('.play-icon').classList.replace('fa-stop', 'fa-play');
    }
    currentStation = document.querySelector(`#stations li:contains('${station.name}')`);
    if (currentStation) {
        currentStation.querySelector('.play-icon').classList.replace('fa-play', 'fa-stop');
    }
}

// Funkcja do dodawania/zmiany statusu ulubionych stacji
function toggleFavorite(station, icon) {
    const isFavorited = favoriteStations.some(fav => fav.url === station.url);
    if (isFavorited) {
        favoriteStations = favoriteStations.filter(fav => fav.url !== station.url);
        icon.classList.remove('favorited');
    } else {
        favoriteStations.push(station);
        icon.classList.add('favorited');
    }
    localStorage.setItem('favoriteStations', JSON.stringify(favoriteStations));
    displayFavoriteStations();
}

// Obsługuje przycisk 'Szukaj według nazwy'
document.getElementById('search-name').addEventListener('click', function() {
    const name = document.getElementById('station-name').value;
    if (name) {
        fetch(`/api/radio/name?name=${name}`)
            .then(response => response.json())
            .then(data => {
                console.log('Odpowiedź API:', data);
                displayStationList(data);
            })
            .catch(error => {
                console.error('Błąd:', error);
                alert('Nie znaleziono stacji.');
            });
    } else {
        alert('Proszę wprowadzić nazwę stacji.');
    }
});

// Obsługuje przycisk 'Filtruj'
document.getElementById('filter-button').addEventListener('click', function() {
    const country = document.getElementById('country-filter').value;
    const language = document.getElementById('language-filter').value;
    const tag = document.getElementById('tag-filter').value;

    let query = '';
    if (country) {
        query += `country=${country}&`;
    }
    if (language) {
        query += `language=${language}&`;
    }
    if (tag) {
        query += `tag=${tag}&`;
    }

    fetch(`/api/radio/search?${query}`)
        .then(response => response.json())
        .then(data => {
            console.log('Odpowiedź API:', data);
            displayStationList(data);
        })
        .catch(error => {
            console.error('Błąd:', error);
            alert('Nie udało się pobrać stacji.');
        });
});

// Obsługuje przycisk 'Odtwórz'
document.getElementById('play-button').addEventListener('click', function() {
    const player = document.getElementById('radio-player');
    player.play();
    document.getElementById('play-button').style.display = 'none';
    document.getElementById('stop-button').style.display = 'block';
    document.getElementById('play-label').style.display = 'none';
    document.getElementById('stop-label').style.display = 'block';
    document.getElementById('volume-control').style.display = 'block'; // Pasek głośności widoczny
});

// Obsługuje przycisk 'Zatrzymaj'
document.getElementById('stop-button').addEventListener('click', function() {
    const player = document.getElementById('radio-player');
    player.pause();
    document.getElementById('play-button').style.display = 'block';
    document.getElementById('stop-button').style.display = 'none';
    document.getElementById('play-label').style.display = 'block';
    document.getElementById('stop-label').style.display = 'none';
    document.getElementById('volume-control').style.display = 'block'; // Pasek głośności widoczny

    if (currentStation) {
        currentStation.querySelector('.play-icon').classList.replace('fa-stop', 'fa-play');
    }
});

// Obsługuje suwak głośności
document.getElementById('volume-control').addEventListener('input', function() {
    const player = document.getElementById('radio-player');
    player.volume = this.value;
});

// Obsługuje przycisk 'Wyłącz dźwięk'
document.getElementById('mute-button').addEventListener('click', function() {
    const player = document.getElementById('radio-player');
    if (isMuted) {
        player.muted = false;
        document.getElementById('mute-button').classList.replace('fa-volume-mute', 'fa-volume-up');
    } else {
        player.muted = true;
        document.getElementById('mute-button').classList.replace('fa-volume-up', 'fa-volume-mute');
    }
    isMuted = !isMuted;
});
