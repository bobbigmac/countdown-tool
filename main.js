import words from 'an-array-of-english-words'

// Countdown letter distribution (from countdown-simulator logic)
const COUNTDOWN_DISTRIBUTION = {
    vowels: { A: 15, E: 21, I: 13, O: 13, U: 5 },
    consonants: { 
        B: 2, C: 3, D: 6, F: 2, G: 3, H: 2, J: 1, K: 1, L: 5, M: 4, N: 8, 
        P: 4, Q: 1, R: 9, S: 9, T: 9, V: 1, W: 1, X: 1, Y: 1, Z: 1 
    }
};

// Simplified managed stack probabilities (based on letter frequency and stack behavior)
const VOWEL_PROBS = { A: 0.18, E: 0.25, I: 0.16, O: 0.16, U: 0.06 };
const CONSONANT_PROBS = {
    B: 0.02, C: 0.03, D: 0.07, F: 0.02, G: 0.03, H: 0.02, J: 0.01, K: 0.01, 
    L: 0.06, M: 0.05, N: 0.09, P: 0.05, Q: 0.01, R: 0.10, S: 0.10, T: 0.10, 
    V: 0.01, W: 0.01, X: 0.01, Y: 0.01, Z: 0.01
};

// Function to count vowels in a word
function countVowels(word) {
    return (word.match(/[aeiou]/gi) || []).length;
}

// Function to calculate word probability (adapted from word-ranker.js)
function calculateWordProbability(word) {
    const upperWord = word.toUpperCase();
    const letterCounts = {};
    
    // Count each letter in the word
    for (const letter of upperWord) {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }
    
    // Calculate probability analytically
    let probability = 1;
    
    for (const [letter, count] of Object.entries(letterCounts)) {
        let letterProb;
        
        // Get the managed probability for this letter
        if ('AEIOU'.includes(letter)) {
            letterProb = VOWEL_PROBS[letter] || 0;
        } else {
            letterProb = CONSONANT_PROBS[letter] || 0;
        }
        
        if (letterProb === 0) {
            probability = 0;
            break;
        }
        
        // For single occurrence, use the managed probability
        if (count === 1) {
            probability *= letterProb;
        } else {
            // Duplicates are heavily penalized since consecutive duplicates 
            // get moved to the bottom of the stack
            const duplicatePenalty = Math.pow(0.05, count - 1);
            probability *= letterProb * duplicatePenalty;
        }
    }
    
    return probability;
}

// Function to filter valid Countdown words
function filterCountdownWords(wordList) {
    return wordList.filter(word => {
        // Must be ≤9 letters
        if (word.length > 9) return false;
        
        // Must only contain letters
        if (!/^[A-Za-z]+$/.test(word)) return false;
        
        // Check against Countdown distribution
        const upperWord = word.toUpperCase();
        const letterCounts = {};
        
        for (const letter of upperWord) {
            letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        }
        
        for (const [letter, count] of Object.entries(letterCounts)) {
            if ('AEIOU'.includes(letter)) {
                const maxAvailable = COUNTDOWN_DISTRIBUTION.vowels[letter] || 0;
                if (count > maxAvailable) return false;
            } else {
                const maxAvailable = COUNTDOWN_DISTRIBUTION.consonants[letter] || 0;
                if (count > maxAvailable) return false;
            }
        }
        
        return true;
    });
}

// Function to sort words: prioritize vowel count (descending), then consonants alphabetically
function sortWordsForCountdown(words) {
    return words.sort((a, b) => {
        const vowelDiff = countVowels(b) - countVowels(a);
        if (vowelDiff !== 0) return vowelDiff; // Sort by vowel count (descending)
        return a.localeCompare(b); // Then alphabetically
    });
}

// Filter and sort 8-letter words, then calculate rankings
const validEightLetterWords = filterCountdownWords(
    words.filter(word => word.length === 8 && /^[a-z]{8}$/.test(word))
);

const eightLetterWords = sortWordsForCountdown(validEightLetterWords);

// Calculate word probabilities and determine top 20%
const wordProbabilities = new Map();
const wordScores = eightLetterWords.map(word => ({
    word,
    probability: calculateWordProbability(word)
})).sort((a, b) => b.probability - a.probability);

// Store probabilities and determine top 20% threshold
wordScores.forEach(({ word, probability }) => {
    wordProbabilities.set(word.toUpperCase(), probability);
});

const top20PercentCount = Math.ceil(wordScores.length * 0.2);
const top20PercentThreshold = wordScores[top20PercentCount - 1]?.probability || 0;

console.log(`Top 20% threshold: ${top20PercentThreshold.toExponential(3)} (${top20PercentCount} words)`);

let gridCells = [];
let animationInterval;
let progressSteps = 0; // Track how many animation steps have occurred
let totalWords = eightLetterWords.length;

// Calculate optimal grid dimensions based on viewport
function calculateGridDimensions() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 30; // Account for progress bar
    
    // Estimate word dimensions (rough calculation based on font size)
    const estimatedWordWidth = 120; // pixels for 8-letter word
    const estimatedWordHeight = 40; // pixels for word height
    
    const cols = Math.floor((viewportWidth - 20) / estimatedWordWidth); // account for padding
    const rows = Math.floor((viewportHeight - 20) / estimatedWordHeight);
    
    return { cols: Math.max(1, cols), rows: Math.max(1, rows) };
}

// Calculate starting index for a grid position
function calculateStartingIndex(row, col, totalRows, totalCols) {
    // Normalize position to 0-1 range
    const normalizedX = col / Math.max(1, totalCols - 1);
    const normalizedY = row / Math.max(1, totalRows - 1);
    
    // Combine x and y to create a unique distribution
    // This creates a diagonal-like distribution from top-left to bottom-right
    const combinedPosition = (normalizedX + normalizedY) / 2;
    
    // Map to word array index
    const startIndex = Math.floor(combinedPosition * eightLetterWords.length);
    return startIndex % eightLetterWords.length;
}

// Update progress bar
function updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    const wordsPerStep = gridCells.length; // Number of words shown simultaneously
    const totalWordsShown = progressSteps * wordsPerStep;
    const progressPercentage = ((totalWordsShown % totalWords) / totalWords) * 100;
    const currentCyclePosition = totalWordsShown % totalWords;
    
    progressFill.style.width = `${progressPercentage}%`;
    progressText.textContent = `${currentCyclePosition} / ${totalWords} words shown`;
}

// Check if a word is in the top 20%
function isHighValueWord(word) {
    const probability = wordProbabilities.get(word.toUpperCase());
    return probability && probability >= top20PercentThreshold;
}

// Create grid cells
function createGrid() {
    const { cols, rows } = calculateGridDimensions();
    const wordGrid = document.getElementById('wordGrid');
    
    // Set CSS grid template
    wordGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    wordGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    // Clear existing cells
    wordGrid.innerHTML = '';
    gridCells = [];
    
    console.log(`Creating ${rows} x ${cols} grid (${rows * cols} cells) with ${eightLetterWords.length} words`);
    
    // Create cells
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement('div');
            cell.className = 'word-cell';
            
            const startingIndex = calculateStartingIndex(row, col, rows, cols);
            
            const cellData = {
                element: cell,
                currentIndex: startingIndex,
                startingIndex: startingIndex
            };
            
            // Set initial word and styling
            const initialWord = eightLetterWords[cellData.currentIndex];
            cell.textContent = initialWord.toUpperCase();
            
            // Apply highlighting for high-value words
            if (isHighValueWord(initialWord)) {
                cell.classList.add('high-value-word');
            }
            
            gridCells.push(cellData);
            wordGrid.appendChild(cell);
        }
    }
}

// Update all words in the grid
function updateAllWords() {
    gridCells.forEach(cellData => {
        cellData.currentIndex = (cellData.currentIndex + 1) % eightLetterWords.length;
        const currentWord = eightLetterWords[cellData.currentIndex];
        cellData.element.textContent = currentWord.toUpperCase();
        
        // Update highlighting based on word value
        if (isHighValueWord(currentWord)) {
            cellData.element.classList.add('high-value-word');
        } else {
            cellData.element.classList.remove('high-value-word');
        }
    });
    
    // Update progress tracking
    progressSteps++;
    updateProgressBar();
}

// Handle window resize
function handleResize() {
    clearInterval(animationInterval);
    createGrid();
    startAnimation();
}

// Start the animation
function startAnimation() {
    // Reset progress when starting
    progressSteps = 0;
    updateProgressBar();
    
    // Update every 100ms as specified
    animationInterval = setInterval(updateAllWords, 500);
}

// Initialize the application
function init() {
    console.log(`Loaded ${eightLetterWords.length} eight-letter words`);
    console.log(`${top20PercentCount} words in top 20% (threshold: ${top20PercentThreshold.toExponential(3)})`);
    
    // Hide loading message
    document.getElementById('loading').style.display = 'none';
    
    // Initialize progress bar
    updateProgressBar();
    
    // Create initial grid
    createGrid();
    
    // Start animation
    startAnimation();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
} 