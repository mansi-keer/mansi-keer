const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd';

// Elements
const cryptoCards = document.getElementById('crypto-cards');
const selectedCryptos = document.getElementById('selected-cryptos');
const sortSelect = document.getElementById('sort-select');

// Store selected cryptocurrencies in localStorage
let selectedIds = JSON.parse(localStorage.getItem('selectedCryptos')) || [];

// Fetch and display cryptocurrencies
async function fetchCryptos() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        displayCryptos(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Display cryptocurrencies
function displayCryptos(cryptos) {
    cryptoCards.innerHTML = '';  // Clear previous cards
    cryptos.forEach(crypto => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${crypto.image}" alt="${crypto.name} Logo">
            <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
            <p data-price="$${crypto.current_price.toFixed(2)}">${crypto.current_price}</p>
            <p data-24h-change="${crypto.price_change_percentage_24h.toFixed(2)}%">${crypto.price_change_percentage_24h.toFixed(2)}%</p>
            <p data-market-cap="$${crypto.market_cap.toLocaleString()}">${crypto.market_cap.toLocaleString()}</p>
            <button onclick="selectCrypto('${crypto.id}', '${crypto.name}', '${crypto.symbol.toUpperCase()}')">Select for Comparison</button>
        `;
        cryptoCards.appendChild(card);
    });
}

// Select cryptocurrency for comparison
function selectCrypto(id, name, symbol) {
    if (selectedIds.length >= 5) {
        alert("You can only select up to 5 cryptocurrencies for comparison.");
        return;
    }

    // Prevent selecting the same cryptocurrency more than once
    if (!selectedIds.some(crypto => crypto.id === id)) {
        selectedIds.push({ id, name, symbol });
        updateComparison();
        localStorage.setItem('selectedCryptos', JSON.stringify(selectedIds));
    }
}

// Update comparison section
async function updateComparison() {
    selectedCryptos.innerHTML = '';  // Clear previous selection

    if (selectedIds.length === 0) {
        return;  // Do nothing if no cryptocurrencies are selected
    }

    // Build a comma-separated list of crypto IDs for the comparison URL
    const ids = selectedIds.map(crypto => crypto.id).join(',');

    // Build the URL with the selected cryptocurrency IDs
    const comparisonUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`;

    try {
        const response = await fetch(comparisonUrl);

        // Check if the response is OK (status 200)
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

// Display selected cryptocurrencies in a comparison table
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

// Remove cryptocurrency from comparison
function removeFromComparison(id) {
    selectedIds = selectedIds.filter(crypto => crypto.id !== id);
    updateComparison();
    localStorage.setItem('selectedCryptos', JSON.stringify(selectedIds));
}

// Sort cryptocurrencies
function sortCryptos(sortBy) {
    const cards = Array.from(cryptoCards.getElementsByClassName('card'));

    cards.sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
            case 'price':
                aValue = parseFloat(a.querySelector('[data-price]').textContent.replace('$', '').replace(',', ''));
                bValue = parseFloat(b.querySelector('[data-price]').textContent.replace('$', '').replace(',', ''));
                break;
            case '24h_change':
                aValue = parseFloat(a.querySelector('[data-24h-change]').textContent.replace('%', '').replace(',', ''));
                bValue = parseFloat(b.querySelector('[data-24h-change]').textContent.replace('%', '').replace(',', ''));
                break;
            case 'market_cap':
                aValue = parseFloat(a.querySelector('[data-market-cap]').textContent.replace('$', '').replace(',', ''));
                bValue = parseFloat(b.querySelector('[data-market-cap]').textContent.replace('$', '').replace(',', ''));
                break;
            case 'name':
            default:
                aValue = a.querySelector('h3').textContent;
                bValue = b.querySelector('h3').textContent;
                break;
        }

        if (sortBy === 'name') {
            return aValue.localeCompare(bValue);
        } else {
            return aValue - bValue;
        }
    });

    // Re-append the sorted cards to the DOM
    cards.forEach(card => cryptoCards.appendChild(card));
}

// Save preferences to localStorage
function savePreferences() {
    const sortBy = sortSelect.value;
    localStorage.setItem('sortBy', sortBy);
    sortCryptos(sortBy);
}

// Load preferences from localStorage
function loadPreferences() {
    const storedSortBy = localStorage.getItem('sortBy');
    if (storedSortBy) {
        sortSelect.value = storedSortBy;
        sortCryptos(storedSortBy);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadPreferences();
    fetchCryptos();
    sortSelect.addEventListener('change', () => savePreferences());
});
