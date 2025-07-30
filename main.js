import words from 'an-array-of-english-words'

// Function to count vowels in a word
function countVowels(word) {
    return (word.match(/[aeiou]/gi) || []).length;
}

// Function to sort words: prioritize vowel count (descending), then consonants alphabetically
function sortWordsForCountdown(words) {
    return words.sort((a, b) => {
        const vowelDiff = countVowels(b) - countVowels(a);
        if (vowelDiff !== 0) return vowelDiff; // Sort by vowel count (descending)
        return a.localeCompare(b); // Then alphabetically
    });
}

// Filter and sort 8-letter words
const eightLetterWords = sortWordsForCountdown(
    words.filter(word => word.length === 8 && /^[a-z]{8}$/.test(word))
);

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
            
            // Set initial word
            cell.textContent = eightLetterWords[cellData.currentIndex].toUpperCase();
            
            gridCells.push(cellData);
            wordGrid.appendChild(cell);
        }
    }
}

// Update all words in the grid
function updateAllWords() {
    gridCells.forEach(cellData => {
        cellData.currentIndex = (cellData.currentIndex + 1) % eightLetterWords.length;
        cellData.element.textContent = eightLetterWords[cellData.currentIndex].toUpperCase();
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
    animationInterval = setInterval(updateAllWords, 150);
}

// Initialize the application
function init() {
    console.log(`Loaded ${eightLetterWords.length} eight-letter words`);
    
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