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
});

// Usunięto obsługę przycisku 'Najczęściej słuchane stacje'

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
                alert('Nie znaleziono stacji o podanej nazwie.');
            });
    } else {
        alert('Proszę wprowadzić nazwę stacji.');
    }
});

document.getElementById('play-button').addEventListener('click', function() {
    const player = document.getElementById('radio-player');
    player.play();
    document.getElementById('play-button').style.display = 'none';
    document.getElementById('stop-button').style.display = 'block';
    document.getElementById('play-label').style.display = 'none';
    document.getElementById('stop-label').style.display = 'block';
    document.getElementById('volume-control').style.display = 'block'; // Pasek głośności widoczny
});

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

document.getElementById('volume-control').addEventListener('input', function() {
    const player = document.getElementById('radio-player');
    player.volume = this.value;
});

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

function displayStationList(stations) {
    const listContainer = document.getElementById('station-list');
    const stationsList = document.getElementById('stations');
    
    stationsList.innerHTML = '';
    stations.forEach(station => {
        const listItem = document.createElement('li');
        listItem.textContent = `${station.name} (${station.country})`; // Ukryto tagi
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
}

function displayFavoriteStations() {
    const favoritesContainer = document.getElementById('favorite-stations');
    const favoritesList = document.getElementById('favorites');
    
    favoritesList.innerHTML = '';
    favoriteStations.forEach(station => {
        const listItem = document.createElement('li');
        listItem.textContent = `${station.name} (${station.country})`; // Ukryto tagi
        const playIcon = document.createElement('i');
        playIcon.classList.add('fas', 'fa-play', 'play-icon');
        listItem.appendChild(playIcon);
        listItem.addEventListener('click', () => playStation(station));
        favoritesList.appendChild(listItem);
    });
    
    favoritesContainer.style.display = 'block';
}

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
