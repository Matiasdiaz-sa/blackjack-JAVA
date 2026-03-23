// Data Models
const suits = ["Corazones", "Picas", "Diamantes", "Tréboles"];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];

const suitSymbols = {
    "Corazones": "♥",
    "Diamantes": "♦",
    "Picas": "♠",
    "Tréboles": "♣"
};

const suitColors = {
    "Corazones": "red-suit",
    "Diamantes": "red-suit",
    "Picas": "black-suit",
    "Tréboles": "black-suit"
};

let deck = [];
let playerHand = [];
let dealerHand = [];
let isGameOver = true;

// Betting and Scoreboard Records
let balance = 100000;
let currentBet = 0;
let wins = 0;
let losses = 0;
let streak = 0;

// DOM Elements
const btnStart = document.getElementById("btn-start");
const btnClearBet = document.getElementById("btn-clear-bet");
const btnHit = document.getElementById("btn-hit");
const btnStand = document.getElementById("btn-stand");

const gameControls = document.getElementById("game-controls");
const bettingControls = document.getElementById("betting-controls");
const chips = document.querySelectorAll(".chip");

const playerSection = document.getElementById("player-section");
const dealerSection = document.getElementById("dealer-section");
const playerCardsContainer = document.getElementById("player-cards");
const dealerCardsContainer = document.getElementById("dealer-cards");
const playerScoreEl = document.getElementById("player-score");
const dealerScoreEl = document.getElementById("dealer-score");
const gameMessage = document.getElementById("game-message");

const balanceDisplay = document.getElementById("balance-display");
const currentBetDisplay = document.getElementById("current-bet-display");
const winCountEl = document.getElementById("win-count");
const lossCountEl = document.getElementById("loss-count");
const streakCountEl = document.getElementById("streak-count");
const streakBadge = document.getElementById("streak-badge");
const streakFire = document.getElementById("streak-fire");

// Formatter for currency
const formatMoney = (amount) => {
    return amount.toLocaleString('en-US');
};

function updateBalance(newBalance) {
    if (newBalance !== undefined) balance = newBalance;
    balanceDisplay.textContent = formatMoney(balance);
    
    // Check millionaire tier
    if (balance >= 1000000) {
        document.querySelectorAll('.millionaire-chip').forEach(c => c.classList.remove('hidden'));
    } else {
        document.querySelectorAll('.millionaire-chip').forEach(c => c.classList.add('hidden'));
    }
}

// Initialization
updateBalance();
updateBetButtonState();

// Event Listeners
btnStart.addEventListener("click", startGame);
btnClearBet.addEventListener("click", clearBet);
btnHit.addEventListener("click", hitCard);
btnStand.addEventListener("click", stand);

chips.forEach(chip => {
    chip.addEventListener("click", () => {
        const betValue = chip.getAttribute("data-bet");
        if (betValue === "all") {
            placeBet(balance);
        } else {
            placeBet(parseInt(betValue));
        }
    });
});

// Betting Logic
function placeBet(amount) {
    if (balance >= amount) {
        balance -= amount;
        currentBet += amount;
        updateBetDisplay();
    } else if (balance > 0 && amount > balance) {
        // If they click 50k but only have 20k left, just bet the remaining 20k
        currentBet += balance;
        balance = 0;
        updateBetDisplay();
    }
}

function clearBet() {
    balance += currentBet;
    currentBet = 0;
    updateBetDisplay();
}

function updateBetDisplay() {
    updateBalance();
    currentBetDisplay.textContent = formatMoney(currentBet);
    updateBetButtonState();
}

function updateBetButtonState() {
    if (currentBet > 0) {
        btnStart.disabled = false;
    } else {
        btnStart.disabled = true;
    }
}

// Game Functions
function createDeck() {
    deck = [];
    for (let i = 0; i < suits.length; i++) {
        for (let j = 0; j < ranks.length; j++) {
            deck.push({
                suit: suits[i],
                rank: ranks[j],
                value: values[j]
            });
        }
    }
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function calculateScore(hand) {
    let score = 0;
    let aces = 0;

    for (let card of hand) {
        score += card.value;
        if (card.value === 11) aces++;
    }

    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }

    return score;
}

function startGame() {
    createDeck();
    playerHand = [];
    dealerHand = [];
    isGameOver = false;
    
    // UI Transition from Betting to Playing
    bettingControls.classList.add("hidden");
    gameControls.classList.remove("hidden");
    
    // UI Reset
    playerCardsContainer.innerHTML = "";
    dealerCardsContainer.innerHTML = "";
    playerSection.classList.remove("hidden");
    dealerSection.classList.remove("hidden");
    gameMessage.classList.remove("show");
    btnHit.disabled = false;
    btnStand.disabled = false;
    
    dealerScoreEl.textContent = "?";
    playerScoreEl.textContent = "0";

    // Dynamic initial delay dealing logic for animations
    dealCardToPlayer();
    setTimeout(() => { dealCardToDealer(true); }, 300);
    setTimeout(() => { dealCardToPlayer(); }, 600);
    setTimeout(() => { 
        dealCardToDealer(false); 
        
        // Initial Check for Blackjack
        const playerInitialScore = calculateScore(playerHand);
        const dealerInitialScore = calculateScore(dealerHand);
        
        if (playerInitialScore === 21) {
            if (dealerInitialScore === 21) {
                handleEndGame("Doble Blackjack. Empate.", "tie");
            } else {
                handleEndGame("¡Blackjack! ¡Ganaste!", "blackjack");
            }
        }
    }, 900);
}

function dealCardToPlayer() {
    const card = deck.pop();
    playerHand.push(card);
    addCardToDOM(card, playerCardsContainer, false, playerHand.length);
    playerScoreEl.textContent = calculateScore(playerHand);
}

function dealCardToDealer(isHidden) {
    const card = deck.pop();
    dealerHand.push(card);
    addCardToDOM(card, dealerCardsContainer, isHidden, dealerHand.length);
    
    if (!isHidden && dealerHand.length >= 2) {
        dealerScoreEl.textContent = dealerHand[1].value;
    } else if (dealerHand.length > 2) {
        dealerScoreEl.textContent = calculateScore(dealerHand);
    }
}

function hitCard() {
    if (isGameOver) return;
    
    dealCardToPlayer();
    
    const score = calculateScore(playerHand);
    if (score > 21) {
        handleEndGame("Te pasaste de 21. ¡Perdiste!", "loss");
    } else if (score === 21) {
        stand();
    }
}

function stand() {
    if (isGameOver) return;
    
    btnHit.disabled = true;
    btnStand.disabled = true;
    
    // Reveal dealer's hidden card by flipping it
    const hiddenCardWrapper = dealerCardsContainer.firstChild;
    if (hiddenCardWrapper) {
        const cardInner = hiddenCardWrapper.querySelector('.card');
        cardInner.classList.add('flipped');
    }
    
    let dealerScore = calculateScore(dealerHand);
    const playerScore = calculateScore(playerHand);
    dealerScoreEl.textContent = dealerScore;
    
    // Play dealer's turn
    let playDealerTurn = setInterval(() => {
        dealerScore = calculateScore(dealerHand);
        
        // Dealer hits if under 17, OR if they are still losing to the player and haven't busted/reached 21
        if (dealerScore < 17 || (dealerScore < playerScore && dealerScore < 21)) {
            dealCardToDealer(false);
            dealerScoreEl.textContent = calculateScore(dealerHand);
        } else {
            clearInterval(playDealerTurn);
            determineWinner();
        }
    }, 1000); // Wait 1s between dealer drawings
}

function determineWinner() {
    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);
    
    if (dealerScore > 21) {
        handleEndGame("El dealer se pasó. ¡Ganaste!", "win");
    } else if (playerScore > dealerScore) {
        handleEndGame("¡Ganaste!", "win");
    } else if (playerScore < dealerScore) {
        handleEndGame("Perdiste.", "loss");
    } else {
        handleEndGame("Empate.", "tie");
    }
}

function handleEndGame(message, result) {
    if (isGameOver) return;
    isGameOver = true;
    btnHit.disabled = true;
    btnStand.disabled = true;
    
    // Handle Betting and Streaks
    if (result === "win") {
        wins++;
        streak++;
        balance += (currentBet * 2); // Return original bet + 1x profit
    } else if (result === "blackjack") {
        wins++;
        streak++;
        balance += currentBet + (currentBet * 1.5); // Return original bet + 1.5x profit
    } else if (result === "loss") {
        losses++;
        streak = 0;
        // Balance already deducted when bet was placed
    } else if (result === "tie") {
        balance += currentBet; // Return original bet
    }
    
    // Update Score UI
    winCountEl.textContent = wins;
    lossCountEl.textContent = losses;
    streakCountEl.textContent = streak;
    
    // Handle Streak Animation
    const casinoContainer = document.querySelector(".casino-container");
    if (streak >= 3) {
        streakBadge.classList.add("racha-active");
        streakFire.classList.remove("hidden");
        
        // Activate VIP High Roller Theme
        document.body.classList.add("streak-theme");
        casinoContainer.classList.add("streak-table");
    } else {
        streakBadge.classList.remove("racha-active");
        streakFire.classList.add("hidden");
        
        // Deactivate VIP Theme
        document.body.classList.remove("streak-theme");
        casinoContainer.classList.remove("streak-table");
    }
    
    // Handle Bankruptcy
    if (balance === 0 && result === "loss") {
        message += " ¡BANCARROTA!";
        // Reset balance optionally or let them stare at 0
        setTimeout(() => {
            if(confirm("Te quedaste sin fondos. ¿Quieres 100k extra de cortesía del casino?")) {
                balance = 100000;
                updateBetDisplay();
            }
        }, 3000);
    }
    
    currentBet = 0; // Reset active bet so they bet again next round
    updateBetDisplay();
    
    // Make sure Dealer's hidden card is revealed
    const hiddenCardWrapper = dealerCardsContainer.firstChild;
    if (hiddenCardWrapper) {
        const cardInner = hiddenCardWrapper.querySelector('.card');
        if(!cardInner.classList.contains('flipped')) {
            cardInner.classList.add('flipped');
            dealerScoreEl.textContent = calculateScore(dealerHand);
        }
    }
    
    // Display result message popup
    setTimeout(() => {
        gameMessage.textContent = message;
        gameMessage.classList.add("show");
        
        // Transition back to betting phase
        setTimeout(() => {
             // We don't hide the cards, let them fade out naturally on next round start
            bettingControls.classList.remove("hidden");
            gameControls.classList.add("hidden");
        }, 1800);
    }, 600);
}

function addCardToDOM(card, container, isHidden, zIndex) {
    const wrapper = document.createElement("div");
    wrapper.className = "card-wrapper";
    wrapper.style.zIndex = zIndex;
    
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    
    // If it's not hidden, add the flipped class so it shows face-up
    if (!isHidden) {
        cardEl.classList.add("flipped");
    }
    
    const front = document.createElement("div");
    front.className = `card-face card-front ${suitColors[card.suit]}`;
    
    const symbol = suitSymbols[card.suit];
    const topDiv = document.createElement("div");
    topDiv.className = "card-top";
    topDiv.innerHTML = `${card.rank}<br>${symbol}`;
    
    const centerDiv = document.createElement("div");
    centerDiv.className = "card-center";
    centerDiv.innerHTML = symbol;
    
    const bottomDiv = document.createElement("div");
    bottomDiv.className = "card-bottom";
    bottomDiv.innerHTML = `${card.rank}<br>${symbol}`;
    
    front.appendChild(topDiv);
    front.appendChild(centerDiv);
    front.appendChild(bottomDiv);
    
    const back = document.createElement("div");
    back.className = "card-face card-back";
    
    cardEl.appendChild(back);
    cardEl.appendChild(front);
    wrapper.appendChild(cardEl);
    container.appendChild(wrapper);
}
