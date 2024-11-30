const cryptoCards = document.getElementById('crypto-cards');
const selectedCryptos = document.getElementById('selected-cryptos');
const favoriteList = document.getElementById('favorite-list');
const sortSelect = document.getElementById('sort-select');

let selectedIds = JSON.parse(localStorage.getItem('selectedCryptos')) || [];
let favoriteIds = JSON.parse(localStorage.getItem('favoriteCryptos')) || [];
let allCryptos = []; 
async function fetchCryptos() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd');
        const data = await response.json();
        allCryptos = data; 
        displayCryptos(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function displayCryptos(cryptos) {
    cryptoCards.innerHTML = ''; 
    cryptos.forEach(crypto => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${crypto.image}" alt="${crypto.name} Logo">
            <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
            <p data-price="$${crypto.current_price.toFixed(2)}">${crypto.current_price}</p>
            <p data-24h-change="${crypto.price_change_percentage_24h.toFixed(2)}%">${crypto.price_change_percentage_24h.toFixed(2)}%</p>
            <p data-market-cap="$${crypto.market_cap.toLocaleString()}">${crypto.market_cap.toLocaleString()}</p>
            <button class="favorite-btn" onclick="toggleFavorite('${crypto.id}', '${crypto.name}', '${crypto.symbol.toUpperCase()}')">
                ${favoriteIds.includes(crypto.id) ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
            <button onclick="selectCrypto('${crypto.id}', '${crypto.name}', '${crypto.symbol.toUpperCase()}')">Select for Comparison</button>
        `;
        cryptoCards.appendChild(card);
    });
}

function toggleFavorite(id, name, symbol) {
    if (favoriteIds.includes(id)) {
        
        favoriteIds = favoriteIds.filter(cryptoId => cryptoId !== id);
    } else {
        favoriteIds.push(id);
    }
    updateFavorites();
    localStorage.setItem('favoriteCryptos', JSON.stringify(favoriteIds));
}

function updateFavorites() {
    favoriteList.innerHTML = ''; 

    if (favoriteIds.length === 0) {
        favoriteList.innerHTML = '<p>No favorite cryptocurrencies selected.</p>';
        return;
    }

    favoriteIds.forEach(id => {
        const favoriteCard = document.createElement('div');
        favoriteCard.classList.add('favorite-card');

        const crypto = allCryptos.find(c => c.id === id);
        if (crypto) {
            favoriteCard.innerHTML = `
                <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
                <p>Price: $${crypto.current_price.toFixed(2)}</p>
                <p>24h Change: ${crypto.price_change_percentage_24h.toFixed(2)}%</p>
                <button onclick="removeFromFavorites('${crypto.id}')">Remove from Favorites</button>
            `;
            favoriteList.appendChild(favoriteCard);
        }
    });
}

function removeFromFavorites(id) {
    favoriteIds = favoriteIds.filter(cryptoId => cryptoId !== id);
    updateFavorites();
    localStorage.setItem('favoriteCryptos', JSON.stringify(favoriteIds));
}

function selectCrypto(id, name, symbol) {
    if (selectedIds.length >= 5) {
        alert("You can only select up to 5 cryptocurrencies for comparison.");
        return;
    }

    if (!selectedIds.some(crypto => crypto.id === id)) {
        selectedIds.push({ id, name, symbol });
        updateComparison();
        localStorage.setItem('selectedCryptos', JSON.stringify(selectedIds));
    }
}

async function updateComparison() {
    selectedCryptos.innerHTML = '';  

    if (selectedIds.length === 0) {
        return;  
    }

    const ids = selectedIds.map(crypto => crypto.id).join(',');

    const comparisonUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`;

    try {
        const response = await fetch(comparisonUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data = await response.json();
        displayComparison(data);
    } catch (error) {
        console.error('Error fetching comparison data:', error);
        selectedCryptos.innerHTML = `<p style="color: red;">Error fetching comparison data. Please try again later.</p>`;
    }
}

function displayComparison(cryptos) {
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Cryptocurrency</th>
                <th>Price (USD)</th>
                <th>24h Change</th>
                <th>Market Cap</th>
                <th>Remove</th>
            </tr>
        </thead>
        <tbody>
            ${cryptos.map(crypto => `
                <tr>
                    <td>${crypto.name} (${crypto.symbol.toUpperCase()})</td>
                    <td>$${crypto.current_price.toFixed(2)}</td>
                    <td>${crypto.price_change_percentage_24h.toFixed(2)}%</td>
                    <td>$${crypto.market_cap.toLocaleString()}</td>
                    <td><button onclick="removeFromComparison('${crypto.id}')">Remove</button></td>
                </tr>
            `).join('')}
        </tbody>
    `;
    selectedCryptos.appendChild(table);
}

function removeFromComparison(id) {
    selectedIds = selectedIds.filter(crypto => crypto.id !== id);
    updateComparison();
    localStorage.setItem('selectedCryptos', JSON.stringify(selectedIds));
}

function savePreferences() {
    localStorage.setItem('sortPreference', sortSelect.value);
}

function loadPreferences() {
    const storedSortBy = localStorage.getItem('sortPreference');
    if (storedSortBy) {
        sortSelect.value = storedSortBy;
        sortCryptos(storedSortBy); 
    }
}

function sortCryptos(sortBy) {
    const sortedCryptos = [...allCryptos]; 

    sortedCryptos.sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
            case 'price':
                aValue = a.current_price;
                bValue = b.current_price;
                break;
            case '24h_change':
                aValue = a.price_change_percentage_24h;
                bValue = b.price_change_percentage_24h;
                break;
            case 'market_cap':
                aValue = a.market_cap;
                bValue = b.market_cap;
                break;
            case 'name':
            default:
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
        }

        return aValue < bValue ? -1 : 1;
    });

    displayCryptos(sortedCryptos); 
}

document.addEventListener('DOMContentLoaded', () => {
    loadPreferences();
    fetchCryptos();
    updateComparison();
    updateFavorites();

    sortSelect.addEventListener('change', () => {
        const sortBy = sortSelect.value;
        savePreferences();
        sortCryptos(sortBy); 
    });
});
