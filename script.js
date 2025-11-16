// ==========================================================
// 1. GLOBAL DEĞİŞKENLER VE AYARLAR
// ==========================================================
let map;
let turkeyLayer;
let secretCityFeature;
let guessCount = 0;
let provinceData = []; 

let isGameStarted = false; // Oyunun durumunu takip eder

// Gizli şehrin adını ve koordinatlarını tutacak değişkenler
let SECRET_CITY_NAME = '';
let SECRET_CITY_COORDINATES = []; 

// Zamanlayıcı değişkenleri
let TIMER_SECONDS = 60; 
let countdownInterval;

// YENİ: Can Sistemi Değişkenleri
const MAX_LIVES = 3;
const GUESSES_PER_LIFE = 5;
let currentLives = MAX_LIVES;
let guessCounter = 0; // 10 tahmine ulaşmayı sayar

// Puanlama ve Renk Ayarları (uzaklığa göre Red-Yellow-Green skalası - TERS MANTIK)
const COLORS = [
    { maxDistanceKm: 100, color: '#008000' },     
    { maxDistanceKm: 250, color: '#32CD32' },   
    { maxDistanceKm: 450, color: '#ADFF2F' },   
    { maxDistanceKm: 650, color: '#FFD700' },   
    { maxDistanceKm: 850, color: '#FFA500' },   
    { maxDistanceKm: 1000, color: '#FF4500' }, 
    { maxDistanceKm: Infinity, color: '#FF0000' } 
];

// YENİ İP UCUNU YÖNETEN VERİ YAPISI
// YENİ İP UCUNU YÖNETEN VERİ YAPISI (ZORLUK SEVİYESİ YÜKSEK İLÇELER)
const SAMPLE_DISTRICT_DATA = {
    "Adana": "Tufanbeyli", "Adıyaman": "Sincik", "Afyonkarahisar": "Kızılören", "Ağrı": "Hamur", "Aksaray": "Gülağaç",
    "Amasya": "Göynücek", "Ankara": "Güdül", "Antalya": "İbradı", "Ardahan": "Posof", "Artvin": "Şavşat",
    "Aydın": "Karacasu", "Balıkesir": "Savaştepe", "Bartın": "Kurucaşile", "Batman": "Gercüş", "Bayburt": "Aydıntepe",
    "Bilecik": "Yenipazar", "Bingöl": "Yayla", "Bitlis": "Mutki", "Bolu": "Dörtdivan", "Burdur": "Çeltikçi",
    "Bursa": "Harmancık", "Çanakkale": "Eceabat", "Çankırı": "Atkaracalar", "Çorum": "Uğurludağ", "Denizli": "Kale",
    "Diyarbakır": "Çüngüş", "Düzce": "Çilimli", "Edirne": "Lalapaşa", "Elazığ": "Ağın", "Erzincan": "Otlukbeli",
    "Erzurum": "Çat", "Eskişehir": "Sarıcakaya", "Gaziantep": "Karkamış", "Giresun": "Çamoluk", "Gümüşhane": "Şiran",
    "Hakkari": "Çukurca", "Hatay": "Yayladağı", "Iğdır": "Karakoyunlu", "Isparta": "Yenişarbademli", "İstanbul": "Şile",
    "İzmir": "Beydağ", "Kahramanmaraş": "Ekinözü", "Karabük": "Eflani", "Karaman": "Ayrancı", "Kars": "Akyaka",
    "Kastamonu": "Ağlı", "Kayseri": "Özvatan", "Kilis": "Musabeyli", "Kırıkkale": "Karakeçili", "Kırklareli": "Kofçaz",
    "Kırşehir": "Akçakent", "Kocaeli": "Kandıra", "Konya": "Hadim", "Kütahya": "Dumlupınar", "Malatya": "Kuluncak",
    "Manisa": "Köprübaşı", "Mardin": "Ömerli", "Mersin": "Çamlıyayla", "Muğla": "Kavaklıdere", "Muş": "Korkut",
    "Nevşehir": "Acıgöl", "Niğde": "Çamardı", "Ordu": "Korgan", "Osmaniye": "Hasanbeyli", "Rize": "İkizdere",
    "Sakarya": "Taraklı", "Samsun": "Yakakent", "Şanlıurfa": "Harran", "Siirt": "Aydınlar", "Sinop": "Saraydüzü",
    "Sivas": "Gürün", "Şırnak": "Beytüşşebap", "Tekirdağ": "Şarköy", "Tokat": "Almus", "Trabzon": "Köprübaşı",
    "Tunceli": "Nazimiye", "Uşak": "Ulubey", "Van": "Bahçesaray", "Yalova": "Armutlu", "Yozgat": "Aydıncık",
    "Zonguldak": "Alaplı"
};

// DOM elemanları
const guessInput = document.getElementById('city-input');
const guessForm = document.getElementById('guess-form');
const guessList = document.getElementById('guess-list');
const guessCountSpan = document.getElementById('guess-count');
const timerSpan = document.getElementById('timer'); 
const provinceNames = []; 
const startModal = document.getElementById('start-modal');
const startGameButton = document.getElementById('start-game-button');
const restartButton = document.getElementById('restart-button'); 

// GÜNCELLENEN CAN/İPUCU DOM ELEMANLARI
// GÜNCELLENEN CAN/İPUCU DOM ELEMANLARI
const livesDisplay = document.getElementById('lives-display'); // Artık harita üstündeki div'i hedefliyor
const cityHintText = document.getElementById('city-hint-text'); 
// ...

// YENİ SKOR TABLOSU DOM ELEMANLARI
const usernameInput = document.getElementById('username-input');
const saveUsernameButton = document.getElementById('save-username-button');
const welcomeMessage = document.getElementById('welcome-message');
const highScoreList = document.getElementById('high-score-list');
const userSetupDiv = document.getElementById('user-setup'); 

// YENİ SKOR TABLOSU DEĞİŞKENLERİ
let currentUsername = 'Anonim'; // Varsayılan kullanıcı adı
const SCORE_KEY = 'geoGameHighScores'; // Local Storage anahtarı


// ==========================================================
// YARDIMCI FONKSİYONLAR
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

function generateHint() {
    const district = SAMPLE_DISTRICT_DATA[SECRET_CITY_NAME];
    
    if (district) {
        cityHintText.innerHTML = `Gizli Şehir İpucu: Aradığınız ilin önemli bir ilçesi ${district}'dir.`;
    } else {
        cityHintText.innerHTML = `Gizli şehirle ilgili ilçe ipucu bulunamadı.`;
    }
}

function renderLives() {
    // Hata olmadığından emin olmak için livesDisplay null kontrolü ekledik
    if (!livesDisplay) return; 

    let heartsHTML = '';
    
    for (let i = 0; i < currentLives; i++) {
        heartsHTML += '<span style="color: red; font-size: 1.2em; margin: 0 1px;">❤️</span>';
    }
    
    for (let i = 0; i < MAX_LIVES - currentLives; i++) {
        heartsHTML += '<span style="color: lightgray; font-size: 1.2em; margin: 0 1px;">🤍</span>';
    }
    
    livesDisplay.innerHTML = heartsHTML;
}

// YENİ: Local Storage'dan skorları çeker, sıralar ve döndürür
function getHighScores() {
    const scores = localStorage.getItem(SCORE_KEY);
    return scores ? JSON.parse(scores).sort((a, b) => {
        // 1. Kural: Daha az tahmin
        if (a.score !== b.score) {
            return a.score - b.score;
        }
        // 2. Kural: Tahmin eşitse daha kısa süre
        return a.time - b.time;
    }) : [];
}

// YENİ: Skor tablosunu günceller ve listeyi render eder
function renderHighScores() {
    const scores = getHighScores();
    highScoreList.innerHTML = '';
    
    scores.slice(0, 5).forEach((item, index) => { // İlk 10 skoru göster
        const listItem = document.createElement('li');
        const timeDisplay = item.time > 0 ? `(${item.time} sn)` : ''; 
        
        listItem.innerHTML = `
            <strong>${index + 1}. ${item.username}</strong>: ${item.score} Tahmin ${timeDisplay}
        `;
        highScoreList.appendChild(listItem);
    });
    
    if (scores.length === 0) {
        highScoreList.innerHTML = '<li>Henüz skor yok. İlk siz olun!</li>';
    }
}

// YENİ: Kullanıcı adını kaydeder (Hoş geldin mesajı ve form gizleme/gösterme)
// YENİ: Kullanıcı adını kaydeder (Hoş geldin mesajı ve form gizleme/gösterme)
function handleUsernameSave() {
    // Null check
    if (!usernameInput || !userSetupDiv) return;

    const username = usernameInput.value.trim();
    if (username.length > 2) {
        currentUsername = username;
        localStorage.setItem('geoGameUsername', username);
        
        // Hoş geldin mesajını göstermek için yeni bir fonksiyona yönlendiriyoruz
        updateWelcomeDisplay(currentUsername);
        
        // Modalın tekrar açılmasını sağlar
        startModal.style.display = 'flex';
    } else {
        // Uyarı sadece bu butona tıklandığında (form boşken) verilir
        alert('Kullanıcı adı en az 3 karakter olmalıdır.');
    }
}

// YENİ YARDIMCI FONKSİYON: Hoş Geldin mesajını gösterir ve formu gizler
function updateWelcomeDisplay(username) {
    if (!userSetupDiv) return;
    
    userSetupDiv.innerHTML = `
        <p id="welcome-message" style="font-weight: bold; color: #00796b; margin-top: 10px; text-align: center;">
            Hoş Geldin, ${username}!
        </p>
    `;
}


// ==========================================================
// 2. HARİTA İL SINIRLARINI VE GİZLİ ŞEHRİ YÜKLEME
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
                throw new Error(`HTTP hata kodu: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            provinceData = data.features;
            
            provinceData.forEach(feature => {
                const nameTR = feature.properties.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); 
                provinceNames.push({ normalized: nameTR, original: feature.properties.name });
            });

            // YENİ: Skorları yükle ve tabloyu göster
            renderHighScores();
            
            // YENİ: Kayıtlı kullanıcı adı varsa sadece ekranı güncelle
            const savedUsername = localStorage.getItem('geoGameUsername');
            if (savedUsername) {
                currentUsername = savedUsername;
                updateWelcomeDisplay(currentUsername); // Uyarıyı tetiklemeden hoş geldin der
                startModal.style.display = 'flex'; // Modalı açar
            } else {
                // Kullanıcı adı kaydedilmemişse, modali direkt açıyoruz (Kayıt formu görünecektir).
                startModal.style.display = 'flex';
            }

            turkeyLayer = L.geoJSON(data, {
                style: defaultStyle,
                onEachFeature: onEachFeature 
            }).addTo(map);
            
            // Oyun başlamadan önce canları render et
            renderLives();
            
            // Harita yüklendi, oyunu başlatmayı engelle
            guessInput.disabled = true;
            guessForm.querySelector('button').disabled = true;
        })
        .catch(error => {
            console.error("GeoJSON verisi yüklenirken hata oluştu:", error);
            // HATA MESAJI GÖSTERİMİ
            alert(`Harita verisi yüklenemedi: ${error.message}. 'tr.json' dosyasının adının ve içeriğinin doğru olduğundan emin olun.`);
        });
}

// Varsayılan il stili
function defaultStyle(feature) {
    return {
        fillColor: '#E0E0E0', 
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
}

// İl etkileşimleri (hover/tıklama)
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
// 3. OYUN BAŞLATMA VE BİTİRME MANTIĞI
// ==========================================================

// Zamanlayıcı fonksiyonu
function startTimer() {
    let timeLeft = TIMER_SECONDS;
    timerSpan.textContent = timeLeft;

    countdownInterval = setInterval(() => {
        timeLeft--;
        timerSpan.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            endGame(`⏰ SÜRE BİTTİ! Gizli şehir ${SECRET_CITY_NAME} idi. Skorunuz: ${guessCount}`);
        }
    }, 1000); 
}

function startNewGame() {
    guessCount = 0;
    guessList.innerHTML = '';
    guessCountSpan.textContent = guessCount;
    
    // Can ve tahmin sayacını sıfırla
    currentLives = MAX_LIVES;
    guessCounter = 0; 
    renderLives(); // Kalpleri ekrana çiz

    // Formu etkinleştir
    guessInput.disabled = false;
    guessForm.querySelector('button').disabled = false;
    guessForm.style.display = 'block';
    
    // Önceki işaretçileri temizle
    map.eachLayer(layer => {
        if (layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });

    // Zamanlayıcıyı başlatma
    clearInterval(countdownInterval);
    timerSpan.textContent = TIMER_SECONDS;
    startTimer(); 

    // Tüm illeri varsayılan stile sıfırla
    if (turkeyLayer) {
        turkeyLayer.eachLayer(layer => {
            layer.setStyle(defaultStyle(layer.feature));
        });
    }
    
    // Rastgele gizli şehir seçme
    const randomIndex = Math.floor(Math.random() * provinceData.length);
    secretCityFeature = provinceData[randomIndex];
    SECRET_CITY_NAME = secretCityFeature.properties.name;
    
    // İpucunu üret ve göster
    generateHint();
    
    // Gizli şehrin merkez koordinatını bulma
    turkeyLayer.eachLayer(layer => {
        if (layer.feature.properties.name === SECRET_CITY_NAME) {
            const center = layer.getBounds().getCenter();
            SECRET_CITY_COORDINATES = [center.lat, center.lng]; 
        }
    });

    console.log(`Gizli şehir (Sadece geliştiriciler için): ${SECRET_CITY_NAME}`);
    
    map.flyToBounds(turkeyLayer.getBounds(), {padding: L.point(50, 50)});
    
    isGameStarted = true; // Oyun başladı
}

function endGame(message) {
    clearInterval(countdownInterval); // Zamanlayıcıyı durdur
    
    guessInput.disabled = true;
    guessForm.querySelector('button').disabled = true;
    guessForm.style.display = 'none';

    console.log(`Oyun Bitti! ${message}`); 
    
    // YENİ: Skoru Kaydetme Mantığı (Sadece oyun kazanılırsa)
    if (message.includes('TEBRİKLER')) { 
        const finalTime = TIMER_SECONDS - parseInt(timerSpan.textContent); 
        
        const newScore = {
            username: currentUsername || 'Anonim', 
            score: guessCount,
            time: finalTime
        };
        
        const scores = getHighScores();
        scores.push(newScore);
        localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
        
        // Yeni skoru tabloya yansıt
        renderHighScores();
    }
    
    // Tekrar Oyna Butonunu göster
    restartButton.textContent = `TEKRAR OYNA (${guessCount} Tahmin)`; 
    restartButton.style.display = 'block';

    // Gizli şehre büyük bir işaretleyici (marker) ekle
    const lat = SECRET_CITY_COORDINATES[0];
    const lng = SECRET_CITY_COORDINATES[1];
    
    let winPopupContent;
    if (message.includes('TEBRİKLER')) {
        winPopupContent = `
            <div style="text-align: center;">
                <h4 style="color: #008000;">🎉 TEBRİKLER! 🎉</h4>
                <p><strong>Gizli Şehir: ${SECRET_CITY_NAME}</strong></p>
                <p>Sadece <strong>${guessCount}</strong> tahminde buldunuz!</p>
            </div>
        `;
    } else { // Süre bittiğinde veya canlar bitince
        winPopupContent = `
            <div style="text-align: center;">
                <h4 style="color: #FF0000;">💔 KAYBETTİNİZ 💔</h4>
                <p>Gizli Şehir: <strong>${SECRET_CITY_NAME}</strong></p>
                <p>Skorunuz: <strong>${guessCount}</strong> tahmin.</p>
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
    
    // Gizli şehrin sınırlarını kalıcı olarak vurgula
    turkeyLayer.eachLayer(layer => {
        if (layer.feature.properties.name === SECRET_CITY_NAME) {
            layer.setStyle({
                fillColor: '#008000', // Kazanılan şehir koyu yeşil olsun
                color: 'gold',        // Sınır çizgisi altın
                weight: 5,            // Kalın sınır
                fillOpacity: 0.9
            });
            // Haritayı kazanılan şehre yakınlaştır
            map.flyToBounds(layer.getBounds(), {padding: L.point(20, 20), duration: 1});
        }
    });
    
    isGameStarted = false;
}


// ==========================================================
// 4. TAHMİN İŞLEME FONKSİYONU
// ==========================================================

function processGuess(guessedCityName) {
    if (!isGameStarted || guessInput.disabled) return;

    const normalizedGuess = guessedCityName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
    const matchingProvince = provinceNames.find(p => p.normalized === normalizedGuess);
    
    if (!matchingProvince) {
        alert('Lütfen geçerli bir Türkiye il adı girin.');
        return;
    }
    
    const actualCityName = matchingProvince.original;

    guessCount++;
    guessCountSpan.textContent = guessCount;

    // YENİ: Tahmin sayacını artır
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

    // 1. Mesafeyi hesaplama
    const distanceKm = calculateDistance(
        guessedCityCoordinates[0], guessedCityCoordinates[1],
        SECRET_CITY_COORDINATES[0], SECRET_CITY_COORDINATES[1]
    );

    // 2. Renk ve geri bildirimi belirleme
    let resultColor = '#FF0000'; // Default: En Uzak Renk (Kırmızı)
    let feedback = '';

    // Gizli şehri buldu mu?
    if (actualCityName === SECRET_CITY_NAME) {
        resultColor = '#DC143C'; // Kazanma vurgu rengi
        feedback = `🏆 TEBRİKLER! ${actualCityName} gizli şehirdi! ${guessCount} tahminde buldun.`;
        endGame(feedback);
        return; 
    }
    
    // YENİ: Can Kontrolü ve Cezalandırma
    if (guessCounter % GUESSES_PER_LIFE === 0) {
        currentLives--;
        renderLives(); // Kalpleri güncelle
        
        // Can bitince oyunu sonlandır
        if (currentLives <= 0) {
            endGame(`💔 CANLARIN BİTTİ! ${GUESSES_PER_LIFE * MAX_LIVES} tahmin hakkını doldurdunuz. Gizli şehir ${SECRET_CITY_NAME} idi.`);
            return;
        }
    }


    // Yakınlığa göre rengi belirle
    for (const rule of COLORS) {
        if (distanceKm <= rule.maxDistanceKm) {
            resultColor = rule.color;
            break;
        }
    }
    
    // Geri bildirimi oluştur
    const roundedDistance = Math.round(distanceKm);
    feedback = `${actualCityName}: ${roundedDistance} km`;

    // 3. Haritadaki ili renklendirme ve işaretçi ekleme
    guessedLayer.setStyle({
        fillColor: resultColor,
        fillOpacity: 0.9
    });
    
    // Tahmin merkezine küçük bir işaretçi ekle
    L.circleMarker(guessedCityCoordinates, {
        radius: 4,
        color: 'black',
        fillColor: resultColor,
        fillOpacity: 1
    }).addTo(map).bindPopup(`${actualCityName}: ${roundedDistance} km`).openTooltip(guessedCityCoordinates);
    
    // 4. Tahmin listesine ekleme
    const listItem = document.createElement('li');
    listItem.textContent = feedback;
    listItem.style.color = resultColor;
    guessList.appendChild(listItem);
    guessList.scrollTop = guessList.scrollHeight; 
    
    // Harita Kaydırma/Yakınlaştırma
    map.flyTo(guessedCityCoordinates, 7); 
}

// Form gönderme olayını dinleme (Input alanı kullanıldığında)
guessForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const guessedCity = guessInput.value.trim();
    if (guessedCity) {
        processGuess(guessedCity);
        guessInput.value = ''; // Giriş alanını temizle
    }
});


// BAŞLANGIÇ BUTONU OLAY DİNLEYİCİSİ
startGameButton.addEventListener('click', () => {
    startModal.style.display = 'none'; 
    startNewGame(); 
});

// TEKRAR OYNA BUTONU OLAY DİNLEYİCİSİ
restartButton.addEventListener('click', () => {
    restartButton.style.display = 'none'; // Butonu gizle
    startNewGame(); // Oyunu sıfırla ve yeniden başlat
});

// YENİ: Kullanıcı Adı Kaydetme Olay Dinleyicisi
if (saveUsernameButton) {
    saveUsernameButton.addEventListener('click', handleUsernameSave);
}

// Harita yüklendiğinde initMap'i çağır
document.addEventListener('DOMContentLoaded', initMap);