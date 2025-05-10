let Config = null;
let playersCount = 0;
let maxPlayers = 64;
let bankMoney = 0;
let cashMoney = 0;
let playerId = 0;
let updateInterval = null;

// Cache DOM elements
const timeElement = document.getElementById('current-time');
const dateElement = document.getElementById('current-date');
const playersElement = document.getElementById('players-count');
const bankElement = document.getElementById('bank-money');
const cashElement = document.getElementById('cash-money');
const idElement = document.getElementById('player-id');
const bankChangeElement = document.getElementById('bank-change');
const cashChangeElement = document.getElementById('cash-change');
const headerText = document.getElementById('header-text');

// Cache HUD blocks for hiding/showing
const idBlock = document.querySelector('.hud-element.id');
const playersBlock = document.querySelector('.hud-element.players');
const timeBlock = document.querySelector('.hud-element.time');
const dateBlock = document.querySelector('.hud-element.date');
const bankBlock = document.querySelector('.hud-element.money');
const cashBlock = document.querySelector('.hud-element.cash');

// Cache dividers for all rows
const allDividers = document.querySelectorAll('.divider');

function updateHeaderText() {
    if (!Config || !Config.HeaderText) return;
    headerText.innerHTML = `<span class="yellow">${Config.HeaderText.yellow}</span> <span class="white">${Config.HeaderText.white}</span>`;
}

function updateHudVisibility() {
    if (!Config) return;
    idBlock.style.display = Config.Elements.id.enabled ? '' : 'none';
    playersBlock.style.display = Config.Elements.players.enabled ? '' : 'none';
    timeBlock.style.display = Config.Elements.time.enabled ? '' : 'none';
    dateBlock.style.display = Config.Elements.time.enabled ? '' : 'none';
    bankBlock.style.display = Config.Elements.bank.enabled ? '' : 'none';
    cashBlock.style.display = Config.Elements.cash.enabled ? '' : 'none';

    // Dividers: show only if both adjacent elements are enabled
    // Row 1: ID | PLAYERS
    allDividers[0].style.display = (Config.Elements.id.enabled && Config.Elements.players.enabled) ? '' : 'none';
    // Row 2: TIME | DATE
    allDividers[1].style.display = (Config.Elements.time.enabled && Config.Elements.time.enabled) ? '' : 'none';
    // Row 3: BANK | CASH
    allDividers[2].style.display = (Config.Elements.bank.enabled && Config.Elements.cash.enabled) ? '' : 'none';
}

function showMoneyChange(element, amount, type) {
    element.textContent = (type === 'positive' ? '+' : '-') + '$' + Math.abs(amount).toLocaleString();
    element.className = 'money-change ' + type;
    
    // Remove class after animation
    setTimeout(() => {
        element.className = 'money-change';
    }, 2000);
}

function updateTime() {
    if (!Config || !Config.Elements.time.enabled) return;
    
    const now = new Date();
    const time = now.toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('lt-LT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    timeElement.textContent = time;
    dateElement.textContent = date;
}

function updatePlayersCount(count, max) {
    if (!Config || !Config.Elements.players.enabled) return;
    
    if (playersCount !== count || maxPlayers !== max) {
        playersCount = count;
        maxPlayers = max;
        playersElement.innerHTML = `${count}<span class="separator">/</span>${max}`;
    }
}

function updateBankMoney(amount) {
    if (!Config || !Config.Elements.bank.enabled) return;
    
    if (bankMoney !== amount) {
        const difference = amount - bankMoney;
        if (difference !== 0) {
            showMoneyChange(bankChangeElement, difference, difference > 0 ? 'positive' : 'negative');
        }
        bankMoney = amount;
        bankElement.textContent = `$${amount.toLocaleString()}`;
    }
}

function updateCashMoney(amount) {
    if (!Config || !Config.Elements.cash.enabled) return;
    
    if (cashMoney !== amount) {
        const difference = amount - cashMoney;
        if (difference !== 0) {
            showMoneyChange(cashChangeElement, difference, difference > 0 ? 'positive' : 'negative');
        }
        cashMoney = amount;
        cashElement.textContent = `$${amount.toLocaleString()}`;
    }
}

function updatePlayerId(id) {
    if (!Config || !Config.Elements.id.enabled) return;
    
    if (playerId !== id) {
        playerId = id;
        idElement.textContent = `ID: ${id}`;
    }
}

// Show default values until config is received
if (!Config) {
    timeElement.textContent = '--:--';
    dateElement.textContent = '--/--/----';
    playersElement.innerHTML = `0<span class="separator">/</span>0`;
    bankElement.textContent = '$0';
    cashElement.textContent = '$0';
    idElement.textContent = 'ID: 0';
}

// Update time every second
setInterval(updateTime, 1000);
updateTime();

// Listen for messages from the game
window.addEventListener('message', function(event) {
    const data = event.data;
    
    if (data.type === 'initConfig') {
        Config = data.config;
        updateHeaderText();
        updateHudVisibility();
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(updateTime, Config.HudSettings.refreshRate);
        updateTime();
    } else if (data.type === 'updatePlayers') {
        updatePlayersCount(data.count, data.max);
    } else if (data.type === 'updateBankMoney') {
        updateBankMoney(data.amount);
    } else if (data.type === 'updateCashMoney') {
        updateCashMoney(data.amount);
    } else if (data.type === 'updatePlayerId') {
        updatePlayerId(data.id);
    }
}); 