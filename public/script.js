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

    fetch('/api/radio/countries')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateCountrySelect(data);
        })
        .catch(error => {
            console.error('Błąd:', error);
            alert('Nie udało się pobrać listy krajów.');
        });
});

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

document.getElementById('search-country').addEventListener('click', function() {
    const country = document.getElementById('country-select').value;
    if (country) {
        fetch(`/api/radio/country?country=${country}`)
            .then(response => response.json())
            .then(data => {
                displayStationList(data);
            })
            .catch(error => {
                console.error('Błąd:', error);
                alert('Nie znaleziono stacji dla wybranego kraju.');
            });
    } else {
        alert('Proszę wybrać kraj.');
    }
});

function populateCountrySelect(countries) {
    const countrySelect = document.getElementById('country-select');
    countrySelect.innerHTML = '<option value="">Wybierz kraj</option>';
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.name;
        option.textContent = country.name;
        countrySelect.appendChild(option);
    });
}

function displayStationList(stations) {
    if (!Array.isArray(stations)) {
        console.error('Invalid data format:', stations);
        alert('Błędny format danych.');
        return;
    }
    const stationList = document.getElementById('stations');
    stationList.innerHTML = '';
    stations.forEach(station => {
        const li = document.createElement('li');
        li.textContent = station.name;
        li.addEventListener('click', () => playStation(station));
        const playIcon = document.createElement('i');
        playIcon.classList.add('fas', 'fa-play', 'play-icon');
        li.appendChild(playIcon);
        const favoriteIcon = document.createElement('i');
        favoriteIcon.classList.add('fas', 'fa-heart', 'favorite-icon');
        if (isFavorite(station)) {
            favoriteIcon.classList.add('favorited');
        }
        favoriteIcon.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleFavorite(station, favoriteIcon);
        });
        li.appendChild(favoriteIcon);
        stationList.appendChild(li);
    });
}

function playStation(station) {
    const radioPlayer = document.getElementById('radio-player');
    const stationNameDisplay = document.getElementById('station-name-display');
    radioPlayer.src = station.url_resolved;
    radioPlayer.play();
    currentStation = station;
    stationNameDisplay.textContent = station.name;
    showControls();
}

function showControls() {
    document.getElementById('radio-player').style.display = 'block';
    document.getElementById('play-button').style.display = 'inline';
    document.getElementById('stop-button').style.display = 'inline';
    document.getElementById('play-label').style.display = 'inline';
    document.getElementById('stop-label').style.display = 'inline';
    document.getElementById('volume-container').style.display = 'flex';
}

document.getElementById('play-button').addEventListener('click', function() {
    const radioPlayer = document.getElementById('radio-player');
    if (currentStation) {
        radioPlayer.play();
    }
});

document.getElementById('stop-button').addEventListener('click', function() {
    const radioPlayer = document.getElementById('radio-player');
    radioPlayer.pause();
    radioPlayer.currentTime = 0;
});

document.getElementById('mute-button').addEventListener('click', function() {
    const radioPlayer = document.getElementById('radio-player');
    isMuted = !isMuted;
    radioPlayer.muted = isMuted;
    this.classList.toggle('fa-volume-mute', isMuted);
    this.classList.toggle('fa-volume-up', !isMuted);
});

document.getElementById('volume-control').addEventListener('input', function() {
    const radioPlayer = document.getElementById('radio-player');
    radioPlayer.volume = this.value;
});

function toggleFavorite(station, icon) {
    if (isFavorite(station)) {
        removeFavorite(station);
        icon.classList.remove('favorited');
    } else {
        addFavorite(station);
        icon.classList.add('favorited');
    }
}

function isFavorite(station) {
    return favoriteStations.some(fav => fav.stationuuid === station.stationuuid);
}

function addFavorite(station) {
    favoriteStations.push(station);
    localStorage.setItem('favoriteStations', JSON.stringify(favoriteStations));
    displayFavoriteStations();
}

function removeFavorite(station) {
    favoriteStations = favoriteStations.filter(fav => fav.stationuuid !== station.stationuuid);
    localStorage.setItem('favoriteStations', JSON.stringify(favoriteStations));
    displayFavoriteStations();
}

function displayFavoriteStations() {
    const favoriteList = document.getElementById('favorites');
    favoriteList.innerHTML = '';
    favoriteStations.forEach(station => {
        const li = document.createElement('li');
        li.textContent = station.name;
        li.addEventListener('click', () => playStation(station));
        const playIcon = document.createElement('i');
        playIcon.classList.add('fas', 'fa-play', 'play-icon');
        li.appendChild(playIcon);
        const favoriteIcon = document.createElement('i');
        favoriteIcon.classList.add('fas', 'fa-heart', 'favorite-icon', 'favorited');
        favoriteIcon.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleFavorite(station, favoriteIcon);
        });
        li.appendChild(favoriteIcon);
        favorite
