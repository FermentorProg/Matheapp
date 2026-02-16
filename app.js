// Globale Variablen
let currentLevel = 1;
let smartMode = false;
let totalQuestions = 5;
let currentQuestion = 1;
let correctAnswers = 0;
let wrongAttempts = 0;
let currentAnswer = 0;
let collectedBadges = [];

// Level-Konfiguration
const levels = {
    1: { max: 10, icon: '🐌', name: 'Schnecke', tenCross: false },
    2: { max: 20, icon: '🐢', name: 'Schildkröte', tenCross: false },
    3: { max: 20, icon: '🦊', name: 'Fuchs', tenCross: true },
    4: { max: 100, icon: '🐺', name: 'Wolf', tenCross: false },
    5: { max: 100, icon: '🦎', name: 'Chamäleon', tenCross: true }
};

// DOM Elemente
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const smartModeToggle = document.getElementById('smart-mode-toggle');
const levelCards = document.querySelectorAll('.level-card');
const checkButton = document.getElementById('check-button');
const nextButton = document.getElementById('next-button');
const answerInput = document.getElementById('answer-input');
const feedback = document.getElementById('feedback');

// Event Listeners
smartModeToggle.addEventListener('change', function() {
    smartMode = this.checked;
    totalQuestions = smartMode ? 10 : 5;
});

levelCards.forEach(card => {
    card.addEventListener('click', function() {
        currentLevel = parseInt(this.dataset.level);
        startGame();
    });
});

checkButton.addEventListener('click', checkAnswer);
nextButton.addEventListener('click', nextQuestion);
document.getElementById('restart-button').addEventListener('click', restartGame);
document.getElementById('back-to-menu-button').addEventListener('click', backToMenu);

// Enter-Taste zum Prüfen
answerInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        if (!checkButton.classList.contains('hidden')) {
            checkAnswer();
        } else {
            nextQuestion();
        }
    }
});

// Spiel starten
function startGame() {
    currentQuestion = 1;
    correctAnswers = 0;
    wrongAttempts = 0;
    
    // Icon im Spielbildschirm setzen
    document.getElementById('current-level-icon').textContent = levels[currentLevel].icon;
    document.getElementById('total-questions').textContent = totalQuestions;
    
    // Schlauberger-Badge anzeigen
    const smartBadge = document.getElementById('smart-badge');
    if (smartMode) {
        smartBadge.classList.remove('hidden');
    } else {
        smartBadge.classList.add('hidden');
    }
    
    // Screens wechseln
    startScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    generateQuestion();
}

// Aufgabe generieren - VERBESSERT
function generateQuestion() {
    const level = levels[currentLevel];
    const isAddition = Math.random() < 0.5;
    
    let a, b, attempts = 0;
    const maxAttempts = 1000;
    
    if (isAddition) {
        // Addition generieren
        do {
            a = randomInt(1, level.max - 1);
            b = randomInt(1, level.max - a);
            attempts++;
        } while (!isValidAddition(a, b, level) && attempts < maxAttempts);
        
        if (attempts >= maxAttempts) {
            console.error('Konnte keine gültige Addition generieren!');
        }
        
        currentAnswer = a + b;
        document.getElementById('equation-text').textContent = `${a} + ${b} = ?`;
        
    } else {
        // Subtraktion generieren
        do {
            a = randomInt(2, level.max);
            b = randomInt(1, a);
            attempts++;
        } while (!isValidSubtraction(a, b, level) && attempts < maxAttempts);
        
        if (attempts >= maxAttempts) {
            console.error('Konnte keine gültige Subtraktion generieren!');
        }
        
        currentAnswer = a - b;
        document.getElementById('equation-text').textContent = `${a} - ${b} = ?`;
    }
    
    // UI zurücksetzen
    answerInput.value = '';
    answerInput.disabled = false;
    answerInput.focus();
    checkButton.classList.remove('hidden');
    nextButton.classList.add('hidden');
    feedback.classList.add('hidden');
    wrongAttempts = 0;
    
    // Fortschritt aktualisieren
    document.getElementById('question-number').textContent = currentQuestion;
}

// Validierung für Addition
function isValidAddition(a, b, level) {
    const sum = a + b;
    
    if (sum > level.max) return false;
    
    if (level.max <= 20) {
        if (level.tenCross) {
            // Level 3: Zehnerübertritt PFLICHT
            return crossesTen(a, b);
        } else {
            // Level 1, 2: Kein Zehnerübertritt
            return !crossesTen(a, b);
        }
    }
    
    if (level.max === 100 && !level.tenCross) {
        const onesA = a % 10;
        const onesB = b % 10;
        return (onesA + onesB) < 10;
    }
    
    return true;
}
    

// Validierung für Subtraktion
function isValidSubtraction(a, b, level) {
    if (a < b) return false;
    
    if (level.max <= 20) {
        if (level.tenCross) {
            // Level 3: Zehnerübertritt PFLICHT
            return crossesTen(a, -b);
        } else {
            // Level 1, 2: Kein Zehnerübertritt
            return !crossesTen(a, -b);
        }
    }
    
    if (level.max === 100 && !level.tenCross) {
        const onesA = a % 10;
        const onesB = b % 10;
        return onesA >= onesB;
    }
    

    
    return true;
}

// Zehnerübertritt prüfen
function crossesTen(a, b) {
    const sum = a + b;
    const tensA = Math.floor(a / 10);
    const tensSum = Math.floor(sum / 10);
    return tensA !== tensSum;
}

// Antwort prüfen
function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    
    if (isNaN(userAnswer)) {
        showFeedback('Lotta, bitte gib eine Zahl ein! 😊', 'error');
        return;
    }
    
    if (userAnswer === currentAnswer) {
        correctAnswers++;
        showFeedback(getRandomPraise(), 'success');
        answerInput.disabled = true;
        checkButton.classList.add('hidden');
        nextButton.classList.remove('hidden') ;
        
    } else {
        wrongAttempts++;
        
        if (wrongAttempts === 1) {
            showFeedback('Das ist noch nicht ganz richtig, Lotta. Versuch es nochmal! 🤔', 'error');
        } else if (wrongAttempts === 2) {
            showFeedback(getExplanation(), 'explanation');
        } else {
            showFeedback(`Die richtige Lösung ist ${currentAnswer}, Lotta. Das war eine schwierige Aufgabe! Weiter geht's! 💪`, 'explanation');
            answerInput.disabled = true;
            checkButton.classList.add('hidden');
            nextButton.classList.remove('hidden');
        }
    }
}

// Erklärung generieren
function getExplanation() {
    const equationText = document.getElementById('equation-text').textContent;
    const parts = equationText.split(' ');
    const a = parseInt(parts[0]);
    const operator = parts[1];
    const b = parseInt(parts[2]);
    
    if (operator === '+') {
        return `Lotta, versuch es so: Du hast ${a} und legst ${b} dazu. Zähle langsam weiter von ${a}... `;
    } else {
        return `Lotta, versuch es so: Du hast ${a} und nimmst ${b} weg. Zähle langsam zurück von ${a}... `;
    }
}

// Nächste Aufgabe
function nextQuestion() {
    if (currentQuestion < totalQuestions) {
        currentQuestion++;
        generateQuestion();
    } else {
        showResults();
    }
}

// Ergebnisse anzeigen
function showResults() {
    const levelName = levels[currentLevel].name;
    if (!collectedBadges.includes(levelName)) {
        collectedBadges.push(levelName);
    }
    
    gameScreen.classList.remove('active');
    resultScreen.classList.add('active');
    
    document.getElementById('correct-count').textContent = correctAnswers;
    document.getElementById('result-total').textContent = totalQuestions;
    document.getElementById('earned-badge').textContent = levelName;
    
    const badgeList = document.getElementById('badge-list');
    badgeList.innerHTML = '';
    collectedBadges.forEach(badgeName => {
        const badgeDiv = document.createElement('div');
        badgeDiv.className = 'collected-badge';
        badgeDiv.textContent = badgeName;
        badgeList.appendChild(badgeDiv);
    });
}

// Spiel neu starten
function restartGame() {
    resultScreen.classList.remove('active');
    startScreen.classList.add('active');
}

// Zurück zum Hauptmenü
function backToMenu() {
    gameScreen.classList.remove('active');
    startScreen.classList.add('active');
    // Spielzustand zurücksetzen
    currentQuestion = 1;
    correctAnswers = 0;
    wrongAttempts = 0;
}

// Zufällige Zahl
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Zufälliges Lob
function getRandomPraise() {
    const praises = [
        'Super gemacht, Lotta! 🌟',
        'Genau richtig, Lotta! 🎉',
        'Toll gerechnet, Lotta! 👏',
        'Perfekt, Lotta! Du bist super! 🚀',
        'Richtig, Lotta! Du bist eine Mathe-Heldin! 💫'
    ];
    return praises[Math.floor(Math.random() * praises.length)];
}

// Feedback anzeigen
function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    feedback.classList.remove('hidden');
}

// Debug-Funktionen
function debugTestLevel(levelNum, samples = 50) {
    console.log(`\n========== DEBUG: Level ${levelNum} (${levels[levelNum].name}) ==========`);
    const level = levels[levelNum];
    let errors = [];
    
    for (let i = 0; i < samples; i++) {
        const isAddition = i % 2 === 0;
        let a, b, attempts = 0;
        
        if (isAddition) {
            do {
                a = randomInt(1, level.max - 1);
                b = randomInt(1, level.max - a);
                attempts++;
            } while (!isValidAddition(a, b, level) && attempts < 1000);
            
            const sum = a + b;
            const onesA = a % 10;
            const onesB = b % 10;
            const onesSum = (onesA + onesB);
            
            if (sum > level.max) {
                errors.push(`Addition ${a}+${b}=${sum} > max (${level.max})`);
            }
            
            if (!level.tenCross && level.max <= 20 && crossesTen(a, b)) {
                errors.push(`Addition ${a}+${b} hat Zehnerübertritt (nicht erlaubt)`);
            }
            
            if (level.max === 100 && !level.tenCross && onesSum >= 10) {
                errors.push(`Addition ${a}+${b}: Einerstellen ${onesA}+${onesB}=${onesSum} >= 10 (nicht erlaubt)`);
            }
            
            console.log(`✓ ${a} + ${b} = ${sum}`);
            
        } else {
            do {
                a = randomInt(2, level.max);
                b = randomInt(1, a);
                attempts++;
            } while (!isValidSubtraction(a, b, level) && attempts < 1000);
            
            const diff = a - b;
            const onesA = a % 10;
            const onesB = b % 10;
            
            if (a < b) {
                errors.push(`Subtraktion ${a}-${b}: a < b (negatives Ergebnis)`);
            }
            
            if (!level.tenCross && level.max <= 20 && crossesTen(a, -b)) {
                errors.push(`Subtraktion ${a}-${b} hat Zehnerübertritt (nicht erlaubt)`);
            }
            
            if (level.max === 100 && !level.tenCross && onesA < onesB) {
                errors.push(`Subtraktion ${a}-${b}: Einerstelle ${onesA} < ${onesB} (nicht erlaubt)`);
            }
            
            console.log(`✓ ${a} - ${b} = ${diff}`);
        }
    }
    
    if (errors.length > 0) {
        console.error(`\n❌ ${errors.length} FEHLER gefunden:`);
        errors.forEach(err => console.error(`  - ${err}`));
    } else {
        console.log(`\n✅ Alle ${samples} Aufgaben korrekt!`);
    }
    
    console.log(`========== Ende Level ${levelNum} ==========\n`);
}

function debugTestAllLevels() {
    console.log('🔍 STARTE DEBUG-TEST FÜR ALLE LEVELS...\n');
    for (let i = 1; i <= 5; i++) {
        debugTestLevel(i, 50);
    }
    console.log('✅ DEBUG-TEST ABGESCHLOSSEN!');
}

window.debugTestLevel = debugTestLevel;
window.debugTestAllLevels = debugTestAllLevels;

console.log('💡 Debug-Funktionen verfügbar:');
console.log('  - debugTestLevel(1-5, anzahl)');
console.log('  - debugTestAllLevels()');