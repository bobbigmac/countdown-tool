#!/usr/bin/env node

const words = require('an-array-of-english-words');
const { 
  COUNTDOWN_DISTRIBUTION, 
  analyzeManagedStackFrequencies,
  createLetterStack,
  shuffleArray,
  extractConsecutiveDuplicates
} = require('./countdown-simulator');

/**
 * Calculates the probability of forming a word by simulating draws from the managed stack
 * This properly accounts for the fact that duplicates are moved to the bottom
 */
function calculateWordProbability(word, vowelProbs, consonantProbs, iterations = 1000) {
  const upperWord = word.toUpperCase();
  const letterCounts = {};
  
  // Count each letter in the word
  for (const letter of upperWord) {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  }
  
  // Simulate drawing the required letters from the managed stack
  let successCount = 0;
  
  for (let i = 0; i < iterations; i++) {
    // Create a simulated managed stack for this iteration
    const vowelStack = createManagedStack('vowels', vowelProbs);
    const consonantStack = createManagedStack('consonants', consonantProbs);
    
    // Try to draw the required letters
    const requiredLetters = { ...letterCounts };
    let canFormWord = true;
    
    // Draw vowels first
    for (const [letter, count] of Object.entries(requiredLetters)) {
      if ('AEIOU'.includes(letter)) {
        const available = vowelStack.filter(l => l === letter).length;
        if (available < count) {
          canFormWord = false;
          break;
        }
        // Remove the drawn letters
        for (let j = 0; j < count; j++) {
          const index = vowelStack.indexOf(letter);
          if (index !== -1) {
            vowelStack.splice(index, 1);
          }
        }
      }
    }
    
    // Draw consonants
    if (canFormWord) {
      for (const [letter, count] of Object.entries(requiredLetters)) {
        if (!'AEIOU'.includes(letter)) {
          const available = consonantStack.filter(l => l === letter).length;
          if (available < count) {
            canFormWord = false;
            break;
          }
          // Remove the drawn letters
          for (let j = 0; j < count; j++) {
            const index = consonantStack.indexOf(letter);
            if (index !== -1) {
              consonantStack.splice(index, 1);
            }
          }
        }
      }
    }
    
    if (canFormWord) {
      successCount++;
    }
  }
  
  return successCount / iterations;
}

/**
 * Creates a simulated managed stack based on the probabilities
 */
function createManagedStack(type, probs) {
  const stack = [];
  const totalCards = type === 'vowels' ? 42 : 56;
  
  // Create a stack that matches the managed probabilities
  for (const [letter, prob] of Object.entries(probs)) {
    const count = Math.round(prob * totalCards);
    for (let i = 0; i < count; i++) {
      stack.push(letter);
    }
  }
  
  // Shuffle the stack
  for (let i = stack.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [stack[i], stack[j]] = [stack[j], stack[i]];
  }
  
  return stack;
}

/**
 * Filters words to only include valid Countdown words (≤9 letters, no special chars)
 */
function filterCountdownWords(wordList) {
  return wordList.filter(word => {
    // Must be ≤9 letters
    if (word.length > 9) return false;
    
    // Must only contain letters
    if (!/^[A-Za-z]+$/.test(word)) return false;
    
    // Must not require more letters than available in the stack
    const upperWord = word.toUpperCase();
    const letterCounts = {};
    
    for (const letter of upperWord) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }
    
    // Check against Countdown distribution
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

/**
 * Ranks words by their probability of being formable
 */
function rankWordsByProbability(wordList, vowelProbs, consonantProbs) {
  const wordScores = wordList.map(word => {
    const upperWord = word.toUpperCase();
    const probability = calculateWordProbability(word, vowelProbs, consonantProbs);
    
    // Count unique vowels and consonants for additional scoring
    const vowels = new Set();
    const consonants = new Set();
    
    for (const letter of upperWord) {
      if ('AEIOU'.includes(letter)) {
        vowels.add(letter);
      } else {
        consonants.add(letter);
      }
    }
    
    return {
      word: upperWord,
      originalWord: word,
      probability,
      uniqueVowels: vowels.size,
      uniqueConsonants: consonants.size,
      totalUnique: vowels.size + consonants.size,
      length: word.length
    };
  });
  
  // Sort by probability (descending)
  return wordScores.sort((a, b) => b.probability - a.probability);
}

/**
 * Main function to rank words
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'rank':
      const iterations = parseInt(args[1]) || 10000;
      const maxWords = parseInt(args[2]) || 100;
      
      console.log(`Analyzing stack frequencies with ${iterations} iterations...`);
      
      // Get managed stack probabilities
      const vowelAnalysis = analyzeManagedStackFrequencies('vowels', 9, iterations);
      const consonantAnalysis = analyzeManagedStackFrequencies('consonants', 9, iterations);
      
      console.log('\nVowel probabilities:');
      console.log(vowelAnalysis.probabilities);
      console.log('\nConsonant probabilities:');
      console.log(consonantAnalysis.probabilities);
      
      console.log('\nFiltering dictionary...');
      const countdownWords = filterCountdownWords(words);
      console.log(`Found ${countdownWords.length} valid Countdown words`);
      
      console.log('\nRanking words by probability...');
      const rankedWords = rankWordsByProbability(
        countdownWords, 
        vowelAnalysis.probabilities, 
        consonantAnalysis.probabilities
      );
      
      console.log(`\nTop ${maxWords} most likely words:`);
      console.log('Rank | Word | Probability | Length | Unique V/C | Original');
      console.log('-----|------|-------------|--------|------------|----------');
      
      rankedWords.slice(0, maxWords).forEach((word, index) => {
        console.log(
          `${(index + 1).toString().padStart(4)} | ${word.word.padEnd(4)} | ` +
          `${word.probability.toExponential(3).padEnd(11)} | ` +
          `${word.length.toString().padStart(6)} | ` +
          `${word.uniqueVowels}/${word.uniqueConsonants.toString().padStart(1)} | ` +
          word.originalWord
        );
      });
      break;
      
    case 'test':
      console.log('Testing word filtering...');
      
      const testWords = ['INTEGRATE', 'HELLO', 'SUPERCALIFRAGILISTIC', 'CAT', 'ZZZZZZZZZ'];
      console.log('Test words:', testWords);
      
      const filtered = filterCountdownWords(testWords);
      console.log('Filtered words:', filtered);
      
      // Test probability calculation
      const vowelProbs = { A: 0.2, E: 0.3, I: 0.2, O: 0.2, U: 0.1 };
      const consonantProbs = { T: 0.1, G: 0.05, R: 0.1, N: 0.1 };
      
      console.log('\nTesting probability calculation:');
      testWords.forEach(word => {
        const prob = calculateWordProbability(word, vowelProbs, consonantProbs);
        console.log(`${word}: ${prob.toExponential(3)}`);
      });
      break;
      
    default:
      console.log('Countdown Word Ranker');
      console.log('\nUsage:');
      console.log('  node word-ranker.js rank [iterations] [maxWords]');
      console.log('  node word-ranker.js test');
      console.log('\nExamples:');
      console.log('  node word-ranker.js rank 10000 50');
      console.log('  node word-ranker.js test');
      break;
  }
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  calculateWordProbability,
  filterCountdownWords,
  rankWordsByProbability
}; 