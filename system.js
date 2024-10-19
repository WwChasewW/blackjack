const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let playerHand = [];
let dealerHand = [];
let playerTotal = 0;
let dealerTotal = 0;

let dealerHandElement;
let playerHandElement;
let dealerTotalElement;
let playerTotalElement;
let messageElement;
let hitButton;
let standButton;
let doubleButton;
let winLossRatioElement;
let handsPlayedElement;
let playerMoneyElement;
let betButtons;
let getFreeMoneyButton;

let gamesWon = 0;
let gamesLost = 0;
let handsPlayed = 0;
let playerMoney = 500;
let currentBet = 0;

const putCardSound = new Audio('audio/PutCard.mp3');
const bustSound = new Audio('audio/Bust.mp3');
const winSound = new Audio('audio/YouWin.mp3');
const blackjackSound = new Audio('audio/BlackJack.mp3');
;

function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealCard() {
    return deck.pop();
}

function calculateHandValue(hand) {
    let total = 0;
    let aces = 0;

    for (let card of hand) {
        if (card.value === 'A') {
            aces++;
            total += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            total += 10;
        } else {
            total += parseInt(card.value);
        }
    }

    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return total;
}

function renderCard(card, container) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.textContent = `${card.value}${card.suit}`;
    cardElement.style.color = ['♥', '♦'].includes(card.suit) ? 'red' : 'black';
    container.appendChild(cardElement);
    setTimeout(() => playSound(putCardSound), 100);
}

function updateTotals() {
    playerTotal = calculateHandValue(playerHand);
    dealerTotal = calculateHandValue(dealerHand);
    playerTotalElement.textContent = playerTotal;
    dealerTotalElement.textContent = dealerTotal;
}

function checkBlackjack() {
    if (playerTotal === 21) {
        setTimeout(() => playSound(blackjackSound), 500);
        endGame('Player wins with Blackjack!', currentBet * 2.5);
        return true;
    } else if (dealerTotal === 21) {
        setTimeout(() => playSound(blackjackSound), 500);
        endGame('Dealer wins with Blackjack!', 0);
        return true;
    }
    return false;
}

function startGame() {
    if (currentBet === 0) {
        messageElement.textContent = "Place your bet!";
        return;
    }

    createDeck();
    shuffleDeck();

    playerHand = [dealCard(), dealCard()];
    dealerHand = [dealCard(), dealCard()];

    dealerHandElement.innerHTML = '';
    renderCard(dealerHand[0], dealerHandElement);
    const hiddenCard = document.createElement('div');
    hiddenCard.classList.add('card', 'hidden');
    dealerHandElement.appendChild(hiddenCard);

    playerHandElement.innerHTML = '';
    for (let card of playerHand) {
        renderCard(card, playerHandElement);
    }

    updateTotals();
    dealerTotalElement.textContent = '?';

    if (!checkBlackjack()) {
        hitButton.disabled = false;
        standButton.disabled = false;
        doubleButton.disabled = false;
        messageElement.textContent = "Player's turn";
    }
}

function hit() {
    const card = dealCard();
    playerHand.push(card);
    renderCard(card, playerHandElement);
    updateTotals();

    if (playerTotal > 21) {
        setTimeout(() => playSound(bustSound), 500);
        endGame('Player busts! Dealer wins.', 0);
    } else if (playerTotal === 21) {
        stand();
    }
}

function stand() {
    hitButton.disabled = true;
    standButton.disabled = true;
    doubleButton.disabled = true;
    dealerPlay();
}

function double() {
    if (playerMoney >= currentBet) {
        playerMoney -= currentBet;
        currentBet *= 2;
        playerMoneyElement.textContent = playerMoney;
        hit();
        if (playerTotal <= 21) {
            stand();
        }
    } else {
        messageElement.textContent = "Not enough money to double!";
    }
}

function dealerPlay() {
    dealerHandElement.innerHTML = '';
    for (let card of dealerHand) {
        renderCard(card, dealerHandElement);
    }
    updateTotals();
    dealerTotalElement.textContent = dealerTotal;

    const dealerTurn = () => {
        if (dealerTotal < 17) {
            const card = dealCard();
            dealerHand.push(card);
            renderCard(card, dealerHandElement);
            updateTotals();
            setTimeout(dealerTurn, 1000);
        } else {
            determineWinner();
        }
    };

    setTimeout(dealerTurn, 1000);
}

function determineWinner() {
    if (dealerTotal > 21) {
        setTimeout(() => playSound(winSound), 500);
        endGame('Dealer busts! Player wins.', currentBet * 2);
    } else if (dealerTotal > playerTotal) {
        setTimeout(() => playSound(bustSound), 500);
        endGame('Dealer wins!', 0);
    } else if (dealerTotal < playerTotal) {
        setTimeout(() => playSound(winSound), 500);
        endGame('Player wins!', currentBet * 2);
    } else {
        
        endGame('It\'s a tie!', currentBet);
    }
}

function endGame(message, betResult) {
    messageElement.textContent = message;
    hitButton.disabled = true;
    standButton.disabled = true;
    doubleButton.disabled = true;

    playerMoney += betResult;
    playerMoneyElement.textContent = playerMoney;

    handsPlayed++;
    if (message.includes('Player wins')) {
        gamesWon++;
    } else if (message.includes('Dealer wins')) {
        gamesLost++;
    }

    updateStatistics();
    currentBet = 0;
    checkPlayerMoney();
    setTimeout(() => {
        messageElement.textContent = "Place your bet!";
    }, 3000);
}

function updateStatistics() {
    const winRatio = gamesWon / (gamesWon + gamesLost) * 100 || 0;
    winLossRatioElement.textContent = `Win/Loss Ratio: ${winRatio.toFixed(2)}%`;
    handsPlayedElement.textContent = `Hands Played: ${handsPlayed}`;
}

function placeBet(amount) {
    if (amount <= playerMoney) {
        currentBet = amount;
        playerMoney -= amount;
        playerMoneyElement.textContent = playerMoney;
        disableBetButtons();
        startGame();
    } else {
        messageElement.textContent = "Not enough money!";
    }
}

function enableBetButtons() {
    for (let button of betButtons) {
        button.disabled = false;
    }
    getFreeMoneyButton.style.display = 'none';
}

function disableBetButtons() {
    for (let button of betButtons) {
        button.disabled = true;
    }
}

function checkPlayerMoney() {
    if (playerMoney === 0) {
        disableBetButtons();
        getFreeMoneyButton.style.display = 'block';
        messageElement.textContent = "You're out of money! Get free $500 to continue playing.";
    } else {
        enableBetButtons();
    }
}

function getFreeMoney() {
    playerMoney += 500;
    playerMoneyElement.textContent = playerMoney;
    checkPlayerMoney();
    messageElement.textContent = "You received $500! Place your bet to start playing.";
}

document.addEventListener('DOMContentLoaded', () => {
    dealerHandElement = document.querySelector('#dealer-hand .cards');
    playerHandElement = document.querySelector('#player-hand .cards');
    dealerTotalElement = document.getElementById('dealer-total');
    playerTotalElement = document.getElementById('player-total');
    messageElement = document.getElementById('message');
    hitButton = document.getElementById('hit-btn');
    standButton = document.getElementById('stand-btn');
    doubleButton = document.getElementById('double-btn');
    winLossRatioElement = document.getElementById('win-loss-ratio');
    handsPlayedElement = document.getElementById('hands-played');
    playerMoneyElement = document.getElementById('player-money');
    betButtons = document.querySelectorAll('.bet-btn');

    getFreeMoneyButton = document.createElement('button');
    getFreeMoneyButton.textContent = 'Get free $500';
    getFreeMoneyButton.style.display = 'none';
    getFreeMoneyButton.addEventListener('click', getFreeMoney);
    document.body.appendChild(getFreeMoneyButton);

    hitButton.addEventListener('click', hit);
    standButton.addEventListener('click', stand);
    doubleButton.addEventListener('click', double);

    betButtons.forEach(button => {
        button.addEventListener('click', () => {
            placeBet(parseInt(button.dataset.amount));
        });
    });

    messageElement.textContent = "Place your bet!";
    updateStatistics();
    checkPlayerMoney();
});
