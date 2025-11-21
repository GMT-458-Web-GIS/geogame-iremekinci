// ==========================================================
// 1. GLOBAL VARIABLES AND SETTINGS
// ==========================================================
let map;
let turkeyLayer;
let secretCityFeature;
let guessCount = 0;
let provinceData = []; 

let isGameStarted = false; // Tracks the game state

// Variables to hold the hidden city's name and coordinates
let SECRET_CITY_NAME = '';
let SECRET_CITY_COORDINATES = []; 

// Timer variables
let TIMER_SECONDS = 60; 
let countdownInterval;

// NEW: Life System Variables
const MAX_LIVES = 3;
const GUESSES_PER_LIFE = 5; // UPDATED: Lose 1 life every 5 incorrect guesses
let currentLives = MAX_LIVES;
let guessCounter = 0; 

// Scoring and Color Settings (REVERSE Red-Yellow-Green scale)
const COLORS = [
    { maxDistanceKm: 100, color: '#008000' },     // Dark Green (Closest)
    { maxDistanceKm: 250, color: '#32CD32' },   
    { maxDistanceKm: 450, color: '#ADFF2F' },   
    { maxDistanceKm: 650, color: '#FFD700' },   // Yellow
    { maxDistanceKm: 850, color: '#FFA500' },   
    { maxDistanceKm: 1000, color: '#FF4500' }, // Dark Orange
    { maxDistanceKm: Infinity, color: '#FF0000' } // Red (Farthest)
];

// NEW HINT DATA (Lesser-known districts)
const SAMPLE_DISTRICT_DATA = {
    "Adana": "Tufanbeyli", "Adıyaman": "Sincik", "Afyonkarahisar": "Kızılören", "Ağrı": "Hamur", "Aksaray": "Gülağaç",
    "Amasya": "Göynücek", "Ankara": "Güdül", "Antalya": "İbradı", "Ardahan": "Posof", "Artvin": "Şavşat",
    "Aydın": "Karacasu", "Balıkesir": "Savaştepe", "Bartın": "Kurucaşile", "Batman": "Gercüş", "Bayburt": "Aydıntepe",
    "Bilecik": "Yenipazar", "Bingöl": "Yayla", "Bitlis": "Mutki", "Bolu": "Dörtdivan", "Burdur": "Çeltikçi",
    "Bursa": "Harmancık", "Çanakkale": "Eceabat", "Çankırı": "Atkaracalar", "Çorum": "Uğurludağ", "Denizli": "Kale",
    "Diyarbakır": "Çüngüş", "Düzce": "Akçakoca", "Edirne": "Lalapaşa", "Elazığ": "Keban", "Erzincan": "Otlukbeli",
    "Erzurum": "Çat", "Eskişehir": "Sarıcakaya", "Gaziantep": "Karkamış", "Giresun": "Çamoluk", "Gümüşhane": "Şiran",
    "Hakkari": "Çukurca", "Hatay": "Yayladağı", "Iğdır": "Karakoyunlu", "Isparta": "Yenişarbademli", "İstanbul": "Şile",
    "İzmir": "Beydağ", "Kahramanmaraş": "Ekinözü", "Karabük": "Eflani", "Karaman": "Ayrancı", "Kars": "Akyaka",
    "Kastamonu": "Ağlı", "Kayseri": "Özvatan", "Kilis": "Musabeyli", "Kırıkkale": "Karakeçili", "Kırklareli": "Kofçaz",
    "Kırşehir": "Akçakent", "Kocaeli": "Kandıra", "Konya": "Hadim", "Kütahya": "Dumlupınar", "Malatya": "Kuluncak",
    "Manisa": "Köprübaşı", "Mardin": "Ömerli", "Mersin": "Çamlıyayla", "Muğla": "Kavaklıdere", "Muş": "Korkut",
    "Nevşehir": "Acıgöl", "Niğde": "Çamardı", "Ordu": "Korgan", "Osmaniye": "Hasanbeyli", "Rize": "İkizdere",
    "Sakarya": "Taraklı", "Samsun": "Yakakent", "Şanlıurfa": "Harran", "Siirt": "Aydınlar", "Sinop": "Saraydüzü",
    "Sivas": "Gürün", "Şırnak": "Beytüşşebap", "Tekirdağ": "Şarköy", "Tokat": "Almus", "Trabzon": "Akçaabat",
    "Tunceli": "Nazimiye", "Uşak": "Ulubey", "Van": "Bahçesaray", "Yalova": "Armutlu", "Yozgat": "Sorgun",
    "Zonguldak": "Ereğli"
};

// DOM elements
const guessInput = document.getElementById('city-input');
const guessForm = document.getElementById('guess-form');
const guessList = document.getElementById('guess-list');
const guessCountSpan = document.getElementById('guess-count');
const timerSpan = document.getElementById('timer'); 
const provinceNames = []; 
const startModal = document.getElementById('start-modal');
const startGameButton = document.getElementById('start-game-button');
const restartButton = document.getElementById('restart-button'); 

// UPDATED LIFE/HINT DOM ELEMENTS
const livesDisplay = document.getElementById('lives-display'); 
const cityHintText = document.getElementById('city-hint-text'); 

// NEW SCOREBOARD DOM ELEMENTS
const usernameInput = document.getElementById('username-input');
const saveUsernameButton = document.getElementById('save-username-button');
const welcomeMessage = document.getElementById('welcome-message');
const highScoreList = document.getElementById('high-score-list');
const userSetupDiv = document.getElementById('user-setup'); 

// NEW SCOREBOARD VARIABLES
let currentUsername = 'Anonim'; 
const SCORE_KEY = 'geoGameHighScores'; 


// ==========================================================
// HELPER FUNCTIONS
// ==========================================================

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const toRad = (value) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; 
}

// Hint Text simplified and removed "visual guess cue" reference
function generateHint() {
    const district = SAMPLE_DISTRICT_DATA[SECRET_CITY_NAME];
    
    if (district) {
        // HINT TEXT DÜZELTİLDİ: Sadeleştirildi.
        cityHintText.innerHTML = `Hidden City Hint: A representative district of the province you are looking for is ${district}.`;
    } else {
        cityHintText.innerHTML = `No district hint found for the hidden city.`;
    }
}

function renderLives() {
    if (!livesDisplay) return; 

    let heartsHTML = '';
    
    for (let i = 0; i < currentLives; i++) {
        // Large red hearts
        heartsHTML += '<span style="color: red; font-size: 1.8em; margin: 0 2px;">❤️</span>';
    }
    
    for (let i = 0; i < MAX_LIVES - currentLives; i++) {
        // Grey/empty hearts
        heartsHTML += '<span style="color: lightgray; font-size: 1.8em; margin: 0 2px;">🤍</span>';
    }
    
    livesDisplay.innerHTML = heartsHTML;
}

function getHighScores() {
    const scores = localStorage.getItem(SCORE_KEY);
    return scores ? JSON.parse(scores).sort((a, b) => {
        if (a.score !== b.score) {
            return a.score - b.score;
        }
        return a.time - b.time;
    }) : [];
}

function renderHighScores() {
    const scores = getHighScores();
    highScoreList.innerHTML = '';
    
    scores.slice(0, 5).forEach((item, index) => { 
        const listItem = document.createElement('li');
        const timeDisplay = item.time > 0 ? `(${item.time} sec)` : ''; 
        
        listItem.innerHTML = `
            <strong>${index + 1}. ${item.username}</strong>: ${item.score} Guesses ${timeDisplay}
        `;
        highScoreList.appendChild(listItem);
    });
    
    if (scores.length === 0) {
        highScoreList.innerHTML = '<li>No scores yet. Be the first!</li>';
    }
}

function updateWelcomeDisplay(username) {
    if (!userSetupDiv) return;
    
    userSetupDiv.innerHTML = `
        <p id="welcome-message" style="font-weight: bold; color: #00796b; margin-top: 10px; text-align: center;">
            Welcome, ${username}!
        </p>
    `;
}

function handleUsernameSave() {
    if (!usernameInput || !userSetupDiv) return;

    const username = usernameInput.value.trim();
    if (username.length > 2) {
        currentUsername = username;
        localStorage.setItem('geoGameUsername', username);
        
        updateWelcomeDisplay(currentUsername);
        
        startModal.style.display = 'flex';
    } else {
        alert('Username must be at least 3 characters long.');
    }
}


// ==========================================================
// 2. MAP PROVINCE BOUNDARIES AND HIDDEN CITY LOADING
// ==========================================================

function initMap() {
    map = L.map('map').setView([39.9334, 36.6064], 6); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 10,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    fetch('tr.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error code: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            provinceData = data.features;
            
            provinceData.forEach(feature => {
                const nameTR = feature.properties.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); 
                provinceNames.push({ normalized: nameTR, original: feature.properties.name });
            });

            renderHighScores();
            
            const savedUsername = localStorage.getItem('geoGameUsername');
            if (savedUsername) {
                currentUsername = savedUsername;
                updateWelcomeDisplay(currentUsername); 
                startModal.style.display = 'flex';
            } else {
                startModal.style.display = 'flex';
            }

            turkeyLayer = L.geoJSON(data, {
                style: defaultStyle,
                onEachFeature: onEachFeature 
            }).addTo(map);
            
            renderLives();
            
            guessInput.disabled = true;
            guessForm.querySelector('button').disabled = true;
        })
        .catch(error => {
            console.error("Error loading GeoJSON data:", error);
            alert(`Map data could not be loaded: ${error.message}. Ensure 'tr.json' is named and contains correct data.`);
        });
}

// Default province style
function defaultStyle(feature) {
    return {
        fillColor: '#E0E0E0', 
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
}

// Province interactions (hover/click)
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: (e) => { if (isGameStarted) onMapClick(e); } 
    });
}

function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
        weight: 3,
        color: '#00796b', 
        dashArray: '',
        fillOpacity: 0.9
    });
    layer.bindTooltip(layer.feature.properties.name, {sticky: true}).openTooltip(e.latlng);
}

function resetHighlight(e) {
    if (e.target.options.fillColor === '#E0E0E0') {
          turkeyLayer.resetStyle(e.target);
    } else {
        e.target.setStyle({
             weight: 1,
             color: 'white',
             dashArray: ''
        });
    }
}

function onMapClick(e) {
    const cityName = e.target.feature.properties.name;
    processGuess(cityName);
}

// ==========================================================
// 3. GAME START AND END LOGIC
// ==========================================================

// Timer function
function startTimer() {
    let timeLeft = TIMER_SECONDS;
    timerSpan.textContent = timeLeft;

    countdownInterval = setInterval(() => {
        timeLeft--;
        timerSpan.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            endGame(`⏰ TIME UP! The hidden city was ${SECRET_CITY_NAME}. Your score: ${guessCount}`);
        }
    }, 1000); 
}

function startNewGame() {
    guessCount = 0;
    guessList.innerHTML = '';
    guessCountSpan.textContent = guessCount;
    
    // Reset Lives and counter
    currentLives = MAX_LIVES;
    guessCounter = 0; 
    renderLives(); 

    // Enable form
    guessInput.disabled = false;
    guessForm.querySelector('button').disabled = false;
    guessForm.style.display = 'block';
    
    // Clear previous markers
    map.eachLayer(layer => {
        if (layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });

    // Start timer
    clearInterval(countdownInterval);
    timerSpan.textContent = TIMER_SECONDS;
    startTimer(); 

    // Reset all provinces to default style
    if (turkeyLayer) {
        turkeyLayer.eachLayer(layer => {
            layer.setStyle(defaultStyle(layer.feature));
        });
    }
    
    // Pick random hidden city
    const randomIndex = Math.floor(Math.random() * provinceData.length);
    secretCityFeature = provinceData[randomIndex];
    SECRET_CITY_NAME = secretCityFeature.properties.name;
    
    // Generate and display hint
    generateHint();
    
    // Find coordinates of the hidden city center
    turkeyLayer.eachLayer(layer => {
        if (layer.feature.properties.name === SECRET_CITY_NAME) {
            const center = layer.getBounds().getCenter();
            SECRET_CITY_COORDINATES = [center.lat, center.lng]; 
        }
    });

    console.log(`Hidden city (Dev only): ${SECRET_CITY_NAME}`);
    
    map.flyToBounds(turkeyLayer.getBounds(), {padding: L.point(50, 50)});
    
    isGameStarted = true; // Game started
}

function endGame(message) {
    clearInterval(countdownInterval); 
    
    guessInput.disabled = true;
    guessForm.querySelector('button').disabled = true;
    guessForm.style.display = 'none';

    console.log(`Game Over! ${message}`); 
    
    // Scoreboard Update (only if won)
    if (message.includes('CONGRATULATIONS') || message.includes('TEBRİKLER')) { 
        const finalTime = TIMER_SECONDS - parseInt(timerSpan.textContent); 
        
        const newScore = {
            username: currentUsername || 'Anonim', 
            score: guessCount,
            time: finalTime
        };
        
        const scores = getHighScores();
        scores.push(newScore);
        localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
        
        renderHighScores();
    }
    
    // Show Play Again button
    restartButton.textContent = `PLAY AGAIN (${guessCount} Guesses)`; 
    restartButton.style.display = 'block';

    // Add marker to the hidden city
    const lat = SECRET_CITY_COORDINATES[0];
    const lng = SECRET_CITY_COORDINATES[1];
    
    let winPopupContent;
    if (message.includes('TEBRİKLER') || message.includes('CONGRATULATIONS')) {
        winPopupContent = `
            <div style="text-align: center;">
                <h4 style="color: #008000;">🎉 CONGRATULATIONS! 🎉</h4>
                <p><strong>The Hidden City was: ${SECRET_CITY_NAME}</strong></p>
                <p>You found it in only <strong>${guessCount}</strong> guesses!</p>
            </div>
        `;
    } else { // Time up or lives exhausted
        winPopupContent = `
            <div style="text-align: center;">
                <h4 style="color: #FF0000;">💔 GAME OVER 💔</h4>
                <p>The Hidden City was: <strong>${SECRET_CITY_NAME}</strong></p>
                <p>Your score: <strong>${guessCount}</strong> guesses.</p>
            </div>
        `;
    }


    L.circleMarker([lat, lng], {
        radius: 12, 
        color: 'gold', 
        weight: 3,
        fillColor: '#FFD700', 
        fillOpacity: 1
    }).addTo(map)
      .bindPopup(winPopupContent) 
      .openPopup(); 
    
    // Permanently highlight the hidden province boundary
    turkeyLayer.eachLayer(layer => {
        if (layer.feature.properties.name === SECRET_CITY_NAME) {
            layer.setStyle({
                fillColor: '#008000', 
                color: 'gold',        
                weight: 5,           
                fillOpacity: 0.9
            });
            map.flyToBounds(layer.getBounds(), {padding: L.point(20, 20), duration: 1});
        }
    });
    
    isGameStarted = false;
}


// ==========================================================
// 4. GUESS PROCESSING FUNCTION
// ==========================================================

function processGuess(guessedCityName) {
    if (!isGameStarted || guessInput.disabled) return;

    const normalizedGuess = guessedCityName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
    const matchingProvince = provinceNames.find(p => p.normalized === normalizedGuess);
    
    if (!matchingProvince) {
        alert('Please enter a valid Turkish province name.');
        return;
    }
    
    const actualCityName = matchingProvince.original;

    guessCount++;
    guessCountSpan.textContent = guessCount;

    // Increment guess counter
    guessCounter++;

    let guessedLayer;
    let guessedCityCoordinates;
    
    turkeyLayer.eachLayer(layer => {
        if (layer.feature.properties.name === actualCityName) {
            guessedLayer = layer;
            const center = layer.getBounds().getCenter();
            guessedCityCoordinates = [center.lat, center.lng]; 
        }
    });
    
    if (!guessedLayer) return;

    // 1. Calculate distance
    const distanceKm = calculateDistance(
        guessedCityCoordinates[0], guessedCityCoordinates[1],
        SECRET_CITY_COORDINATES[0], SECRET_CITY_COORDINATES[1]
    );

    // 2. Determine color and feedback
    let resultColor = '#FF0000'; 
    let feedback = '';

    // Check if hidden city found
    if (actualCityName === SECRET_CITY_NAME) {
        resultColor = '#DC143C'; 
        feedback = `🏆 TEBRİKLER! ${actualCityName} was the hidden city! You found it in ${guessCount} guesses.`;
        endGame(feedback);
        return; 
    }
    
    // NEW: Life Control and Penalty (5 guesses)
    if (guessCounter % GUESSES_PER_LIFE === 0) {
        currentLives--;
        renderLives(); // Update hearts
        
        // End game if lives are 0
        if (currentLives <= 0) {
            endGame(`💔 LIVES EXHAUSTED! You reached your limit of ${GUESSES_PER_LIFE * MAX_LIVES} guesses. The hidden city was ${SECRET_CITY_NAME}.`);
            return;
        }
    }


    // Determine color based on proximity
    for (const rule of COLORS) {
        if (distanceKm <= rule.maxDistanceKm) {
            resultColor = rule.color;
            break;
        }
    }
    
    // Create feedback
    const roundedDistance = Math.round(distanceKm);
    feedback = `${actualCityName}: ${roundedDistance} km`;

    // 3. Color the province and add marker
    guessedLayer.setStyle({
        fillColor: resultColor,
        fillOpacity: 0.9
    });
    
    // Add small marker to the guess center
    L.circleMarker(guessedCityCoordinates, {
        radius: 4,
        color: 'black',
        fillColor: resultColor,
        fillOpacity: 1
    }).addTo(map).bindPopup(`${actualCityName}: ${roundedDistance} km`).openTooltip(guessedCityCoordinates);
    
    // 4. Add to guess history
    const listItem = document.createElement('li');
    listItem.textContent = feedback;
    listItem.style.color = resultColor;
    guessList.appendChild(listItem);
    guessList.scrollTop = guessList.scrollHeight; 
    
    // Pan and zoom map
    map.flyTo(guessedCityCoordinates, 7); 
}

// Listen for form submission
guessForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const guessedCity = guessInput.value.trim();
    if (guessedCity) {
        processGuess(guessedCity);
        guessInput.value = ''; // Clear input
    }
});


// START GAME BUTTON LISTENER
startGameButton.addEventListener('click', () => {
    startModal.style.display = 'none'; 
    startNewGame(); 
});

// PLAY AGAIN BUTTON LISTENER
restartButton.addEventListener('click', () => {
    restartButton.style.display = 'none'; // Hide button
    startNewGame(); // Reset and start new game
});

// NEW: Username Save Listener
if (saveUsernameButton) {
    saveUsernameButton.addEventListener('click', handleUsernameSave);
}

// Initialize map on document load
document.addEventListener('DOMContentLoaded', initMap);