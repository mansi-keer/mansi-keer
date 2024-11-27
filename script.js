// Sample data for the dropdown
const cryptoList = [
    { symbol: "BTC", name: "Bitcoin", price: 96414, marketCap: 1909037968987, change: 4.8 },
    { symbol: "ETH", name: "Ethereum", price: 3661.79, marketCap: 441227125219, change: 9.95 },
    { symbol: "USDT", name: "Tether", price: 1.001, marketCap: 132814072904, change: 0.16 },
    { symbol: "SOL", name: "Solana", price: 200, marketCap: 50000000000, change: -2.5 },
    { symbol: "BNB", name: "Binance Coin", price: 646.57, marketCap: 94057703124, change: 4.90 }
];

// Populating the select dropdown
const cryptoSelect = document.getElementById('cryptoSelect');
cryptoList.forEach(crypto => {
    const option = document.createElement('option');
    option.value = crypto.symbol;
    option.textContent = `${crypto.name} (${crypto.symbol})`;
    cryptoSelect.appendChild(option);
});

// Handle the 'Compare Prices' button click
document.getElementById('compareBtn').addEventListener('click', () => {
    const selectedValues = Array.from(cryptoSelect.selectedOptions).map(option => option.value);
    const selectedCryptos = cryptoList.filter(crypto => selectedValues.includes(crypto.symbol));
    
    // Display cryptocurrency data as cards
    const cryptoInfo = document.getElementById('cryptoInfo');
    cryptoInfo.innerHTML = ''; // Clear any previous content
    
    selectedCryptos.forEach(crypto => {
        const card = document.createElement('div');
        card.classList.add('crypto-card');
        
        const priceClass = crypto.change >= 0 ? 'change-positive' : 'change-negative';
        card.innerHTML = `
            <h4>${crypto.name} (${crypto.symbol})</h4>
            <p class="price">$${crypto.price.toFixed(2)}</p>
            <p class="market-cap">Market Cap: $${crypto.marketCap.toLocaleString()}</p>
            <p class="change ${priceClass}">24h Change: ${crypto.change.toFixed(2)}%</p>
        `;
        
        cryptoInfo.appendChild(card);
    });

    // Create Chart.js graph (Ensure this part works!)
    const labels = selectedCryptos.map(crypto => crypto.name);
    const data = selectedCryptos.map(crypto => crypto.price);

    // Ensure that the chart element exists
    const ctx = document.getElementById('cryptoChart').getContext('2d');

    // Create a bar chart
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels, // Names of the selected cryptocurrencies
                datasets: [{
                    label: 'Cryptocurrency Price',
                    data: data, // Prices of the selected cryptocurrencies
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true, // Ensures responsiveness of the chart
                scales: {
                    y: {
                        beginAtZero: true // Ensures the Y-axis starts at 0
                    }
                }
            }
        });
    } else {
        console.error('Chart.js canvas not found.');
    }
});

// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});