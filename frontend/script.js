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
let isGameOver = false;

// Scoreboard Records
let wins = 0;
let losses = 0;

// DOM Elements
const btnStart = document.getElementById("btn-start");
const btnHit = document.getElementById("btn-hit");
const btnStand = document.getElementById("btn-stand");
const gameControls = document.getElementById("game-controls");
const playerSection = document.getElementById("player-section");
const dealerSection = document.getElementById("dealer-section");
const playerCardsContainer = document.getElementById("player-cards");
const dealerCardsContainer = document.getElementById("dealer-cards");
const playerScoreEl = document.getElementById("player-score");
const dealerScoreEl = document.getElementById("dealer-score");
const gameMessage = document.getElementById("game-message");
const winCountEl = document.getElementById("win-count");
const lossCountEl = document.getElementById("loss-count");
const tieCountEl = document.getElementById("tie-count");

// Event Listeners
btnStart.addEventListener("click", startGame);
btnHit.addEventListener("click", hitCard);
btnStand.addEventListener("click", stand);

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
    
    // UI Reset
    playerCardsContainer.innerHTML = "";
    dealerCardsContainer.innerHTML = "";
    playerSection.classList.remove("hidden");
    dealerSection.classList.remove("hidden");
    btnStart.classList.add("hidden");
    gameControls.classList.remove("hidden");
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
        if (playerInitialScore === 21) {
            handleEndGame("¡Blackjack! ¡Ganaste!", "win");
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
    
    // We only update the dealer score if it's the second card dealt.
    // If it's the first card, it's hidden and score says '?'
    if (!isHidden && dealerHand.length >= 2) {
        // Just show value of the visible card initially
        dealerScoreEl.textContent = dealerHand[1].value;
    } else if (dealerHand.length > 2) {
        // For cards drawn sequentially during stand
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
    dealerScoreEl.textContent = dealerScore;
    
    // Play dealer's turn
    let playDealerTurn = setInterval(() => {
        dealerScore = calculateScore(dealerHand);
        const playerScore = calculateScore(playerHand);
        
        // Dealer hits if under 17, OR if they are still losing to the player and haven't busted/reached 21
        if (dealerScore < 17 || (dealerScore < playerScore && dealerScore < 21)) {
            dealCardToDealer(false); // false means face up
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
    
    // Update Scoreboard records
    if (result === "win") wins++;
    else if (result === "loss") losses++;
    else if (result === "tie") ties++;
    
    winCountEl.textContent = wins;
    lossCountEl.textContent = losses;
    tieCountEl.textContent = ties;
    
    // Always Make sure Dealer's hidden card is revealed
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
        
        setTimeout(() => {
            btnStart.classList.remove("hidden");
            gameControls.classList.add("hidden");
        }, 1500);
    }, 600);
}

function addCardToDOM(card, container, isHidden, zIndex) {
    const wrapper = document.createElement("div");
    wrapper.className = "card-wrapper";
    wrapper.style.zIndex = zIndex;
    
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    
    // If it's not hidden, add the flipped class so it shows face-up!
    if (!isHidden) {
        cardEl.classList.add("flipped");
    }
    
    // Front side (Visible Face)
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
    
    // Back side (Concealed Pattern)
    const back = document.createElement("div");
    back.className = "card-face card-back";
    
    cardEl.appendChild(back);
    cardEl.appendChild(front);
    wrapper.appendChild(cardEl);
    container.appendChild(wrapper);
}
