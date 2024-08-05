let currentStation = null;
let isMuted = false;

// Funkcja do zapisania ulubionych stacji w localStorage
function saveFavorites(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Funkcja do pobrania ulubionych stacji z localStorage
function getFavorites() {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
}

// Funkcja do aktualizacji ikon ulubionych stacji
function updateFavoriteIcons() {
    const favorites = getFavorites();
    document.querySelectorAll('#stations .favorite-icon').forEach(icon => {
        const stationId = icon.dataset.stationId;
        if (favorites.includes(stationId)) {
            icon.classList.add('favorited');
        } else {
            icon.classList.remove('favorited');
        }
    });
}

// Funkcja do dodawania stacji do ulubionych
function toggleFavorite(stationId) {
    let favorites = getFavorites();
    const index = favorites.indexOf(stationId);

    if (index === -1) {
        favorites.push(stationId); // Dodaj do ulubionych
    } else {
        favorites.splice(index, 1); // Usuń z ulubionych
    }

    saveFavorites(favorites);
    updateFavoriteIcons();
}

// Funkcja do wyświetlania listy stacji
function displayStationList(stations) {
    const listContainer = document.getElementById('station-list');
    const stationsList = document.getElementById('stations');
    
    stationsList.innerHTML = '';
    stations.forEach(station => {
        const listItem = document.createElement('li');
        listItem.textContent = station.name;
        listItem.dataset.stationId = station.id; // Zakładając, że każda stacja ma unikalne id

        const playIcon = document.createElement('i');
        playIcon.classList.add('fas', 'fa-play', 'play-icon');
        listItem.appendChild(playIcon);

        const favoriteIcon = document.createElement('i');
        favoriteIcon.classList.add('fas', 'fa-heart', 'favorite-icon');
        favoriteIcon.dataset.stationId = station.id; // Zakładając, że każda stacja ma unikalne id
        favoriteIcon.addEventListener('click', () => toggleFavorite(station.id));
        listItem.appendChild(favoriteIcon);

        listItem.addEventListener('click', () => {
            playStation(station);
        });

        stationsList.appendChild(listItem);
    });

    listContainer.style.display = 'block';
    updateFavoriteIcons(); // Aktualizuj ikony ulubionych
}

// Funkcja do odtwarzania stacji
function playStation(station) {
    const player = document.getElementById('radio-player');
    player.src = station.url;
    player.play();

    document.getElementById('station-name-display').textContent = station.name;
    document.getElementById('play-button').style.display = 'none';
    document.getElementById('stop-button').style.display = 'inline';
    document.getElementById('play-label').style.display = 'none';
    document.getElementById('stop-label').style.display = 'inline';
}

// Funkcja do zatrzymywania odtwarzania stacji
function stopStation() {
    const player = document.getElementById('radio-player');
    player.pause();
    player.src = '';

    document.getElementById('station-name-display').textContent = 'Nazwa Stacji';
    document.getElementById('play-button').style.display = 'inline';
    document.getElementById('stop-button').style.display = 'none';
    document.getElementById('play-label').style.display = 'inline';
    document.getElementById('stop-label').style.display = 'none';
}

// Funkcja do zarządzania głośnością
function setVolume(value) {
    const player = document.getElementById('radio-player');
    player.volume = value;
}

// Inicjalizacja
document.getElementById('play-button').addEventListener('click', () => {
    if (currentStation) {
        playStation(currentStation);
    }
});

document.getElementById('stop-button').addEventListener('click', stopStation);

document.getElementById('volume-control').addEventListener('input', (event) => {
    setVolume(event.target.value);
});

document.getElementById('mute-button').addEventListener('click', () => {
    const volumeControl = document.getElementById('volume-control');
    isMuted = !isMuted;
    volumeControl.value = isMuted ? 0 : 0.5;
    setVolume(isMuted ? 0 : 0.5);
    document.getElementById('mute-button').classList.toggle('fa-volume-mute', isMuted);
    document.getElementById('mute-button').classList.toggle('fa-volume-up', !isMuted);
});

// Pobieranie listy stacji i wyświetlanie ich
fetch('https://radio-app-763s.onrender.com/api/radio/top')
    .then(response => response.json())
    .then(data => displayStationList(data.stations))
    .catch(error => console.error('Błąd:', error));
