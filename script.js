document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const memoryGame = document.getElementById('memory-game');
    const restartButton = document.getElementById('restart-button');
    const timerDisplay = document.getElementById('timer');
    const moveCounter = document.getElementById('move-counter');
    const messageElement = document.getElementById('message');
    const volumeControl = document.getElementById('volume');
    
    // Configuração de áudio
    const sounds = {
        flip: document.getElementById('flip-sound'),
        match: document.getElementById('match-sound'),
        error: document.getElementById('error-sound'),
        win: document.getElementById('win-sound')
    };
    
    // Configuração do jogo
    const cardImages = [
        'Chase', 'Skye', 'Capitão', 'Rocky', 'Everest',
        'Marshall', 'Zuma', 'Ryder', 'Rubble', 'Patrulha'
    ];
    
    let cards = [];
    let hasFlippedCard = false;
    let firstCard, secondCard;
    let lockBoard = false;
    let moves = 0;
    let matches = 0;
    let timerInterval;
    let seconds = 0;
    let minutes = 0;
    let gameStarted = false;
    
    // Controle de volume
    volumeControl.addEventListener('input', (e) => {
        const volume = e.target.value;
        Object.values(sounds).forEach(sound => {
            sound.volume = volume;
        });
    });
    
    // Inicializa o jogo
    function initGame() {
        createCards();
        shuffleCards();
        preloadSounds();
        showAllCardsTemporarily();
    }

    function showAllCardsTemporarily() {
        
        lockBoard = true;
    
    // Mostra mensagem para crianças
    const previewMsg = document.getElementById('preview-message');
    const countdownEl = previewMsg.querySelector('.countdown');
    previewMsg.style.display = 'block';
    
    // Contagem regressiva
    let count = 3;
    countdownEl.textContent = count;
    
    const countdownInterval = setInterval(() => {
        count--;
        countdownEl.textContent = count;
        
        if (count <= 0) {
            clearInterval(countdownInterval);
            previewMsg.style.display = 'none';
            startPreview();
        }
    }, 1000);
    
    function startPreview() {
        // Vira todas as cartas
        cards.forEach(card => {
            card.classList.add('flipped', 'preview');
        });
        
        // Desvira após 4 segundos
        setTimeout(() => {
            cards.forEach(card => {
                card.classList.remove('flipped', 'preview');
            });
            
            setTimeout(() => {
                lockBoard = false;
            }, 500);
        }, 4000);
    }
}

    // Pré-carrega os sons
    function preloadSounds() {
        Object.values(sounds).forEach(sound => {
            sound.load();
            sound.volume = volumeControl.value;
        });
    }
    
    // Cria as cartas do jogo
    function createCards() {
        memoryGame.innerHTML = '';
        cards = [];
        
        const gameCards = [...cardImages, ...cardImages];
        
        gameCards.forEach((image, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.framework = image;
            
            card.innerHTML = `
                <img class="front-face" src="./img/${image}.jpg" alt="${image}">
                <img class="back-face" src="./img/Escudo.jpg" alt="Verso da carta">
            `;
            
            card.addEventListener('click', flipCard);
            memoryGame.appendChild(card);
            cards.push(card);
        });
    }
    
    // Embaralha as cartas
    function shuffleCards() {
        cards.forEach(card => {
            const randomPos = Math.floor(Math.random() * cards.length);
            card.style.order = randomPos;
        });
    }
    
    // Vira a carta
    function flipCard() {
        if (lockBoard) return;
        if (this.classList.contains('matched')) return;
        
        // Toca o som de virar carta
        sounds.flip.currentTime = 0;
        sounds.flip.play();
        
        this.classList.add('flipped');
        
        if (!gameStarted) {
            gameStarted = true;
            startTimer();
            hasFlippedCard = true;
            firstCard = this;
            return;
        }
        
        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }
        
        secondCard = this;
        hasFlippedCard = false;
        lockBoard = true;
        
        moves++;
        moveCounter.textContent = `Movimentos: ${moves}`;
        
        checkForMatch();
    }
    
    // Verifica se as cartas são iguais
    function checkForMatch() {
        const isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
        
        isMatch ? disableCards() : unflipCards();
    }
    
    // Desativa cartas combinadas
    function disableCards() {
        // Toca o som de acerto
        sounds.match.currentTime = 0;
        sounds.match.play();
        
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        // Animação de celebração
        firstCard.style.transform = 'rotateY(180deg) scale(1.1)';
        secondCard.style.transform = 'rotateY(180deg) scale(1.1)';
        
        setTimeout(() => {
            firstCard.style.transform = 'rotateY(180deg)';
            secondCard.style.transform = 'rotateY(180deg)';
        }, 300);
        
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        matches++;
        if (matches === cardImages.length) {
            endGame();
        }
        
        resetBoard();
    }
    
    // Desvira cartas que não combinam
    function unflipCards() {
        // Toca o som de erro
        sounds.error.currentTime = 0;
        sounds.error.play();
        
        // Adiciona classe de erro para animação
        firstCard.classList.add('error');
        secondCard.classList.add('error');
        
        setTimeout(() => {
            firstCard.classList.remove('flipped', 'error');
            secondCard.classList.remove('flipped', 'error');
            resetBoard();
        }, 1000);
    }
    
    // Reseta o tabuleiro após cada jogada
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }
    
    // Temporizador
    function startTimer() {
        clearInterval(timerInterval);
        seconds = 0;
        minutes = 0;
        timerDisplay.textContent = 'Tempo: 00:00';
        
        timerInterval = setInterval(() => {
            seconds++;
            if (seconds === 60) {
                minutes++;
                seconds = 0;
            }
            
            const formattedTime = 
                `Tempo: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            timerDisplay.textContent = formattedTime;
        }, 1000);
    }
    
    // Finaliza o jogo
    function endGame() {
        clearInterval(timerInterval);
        
        // Toca o som de vitória
        sounds.win.currentTime = 0;
        sounds.win.play();
        
        // Confetti effect (simples)
        for (let i = 0; i < 50; i++) {
            createConfetti();
        }
        
        messageElement.innerHTML = `
            <p>Parabéns! Você completou o jogo em:</p>
            <p>${timerDisplay.textContent}</p>
            <p>Com ${moves} movimentos</p>
            <button id="play-again">Jogar Novamente</button>
        `;
        
        messageElement.classList.remove('message-hidden');
        messageElement.classList.add('message');
        
        document.getElementById('play-again').addEventListener('click', restartGame);
    }
    
    // Efeito de confete simples
    function createConfetti() {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.zIndex = '1000';
        confetti.style.animation = `fall ${Math.random() * 2 + 1}s linear forwards`;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
    
    // Adiciona estilo de animação para confetti
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fall {
            to { transform: translateY(100vh) rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Reinicia o jogo
    function restartGame() {
        clearInterval(timerInterval);
        
        hasFlippedCard = false;
        [firstCard, secondCard] = [null, null];
        lockBoard = false;
        moves = 0;
        matches = 0;
        gameStarted = false;
        
        moveCounter.textContent = 'Movimentos: 0';
        messageElement.classList.add('message-hidden');
        messageElement.classList.remove('message');
        messageElement.innerHTML = '';
        
        initGame();
    }
    
    // Event listeners
    restartButton.addEventListener('click', restartGame);
    
    // Inicia o jogo
    initGame();
});

