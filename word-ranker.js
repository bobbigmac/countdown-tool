#!/usr/bin/env node

const words = require('an-array-of-english-words');
const { 
  COUNTDOWN_DISTRIBUTION, 
  analyzeManagedStackFrequencies
} = require('./countdown-simulator');

/**
 * Calculates the probability of forming a word using the managed stack probabilities
 * Uses analytical calculation instead of simulation for speed
 */
function calculateWordProbability(word, vowelProbs, consonantProbs) {
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
      letterProb = vowelProbs[letter] || 0;
    } else {
      letterProb = consonantProbs[letter] || 0;
    }
    
    if (letterProb === 0) {
      probability = 0;
      break;
    }
    
    // For single occurrence, use the managed probability
    if (count === 1) {
      probability *= letterProb;
    } else {
      // ALL duplicates are heavily penalized since consecutive duplicates 
      // (vowel or consonant) get moved to the bottom of the stack
      const duplicatePenalty = Math.pow(0.05, count - 1); // Very aggressive penalty for ANY duplicates
      probability *= letterProb * duplicatePenalty;
    }
  }
  
  return probability;
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
      
      // Get actual managed stack probabilities
      console.log('\nCalculating managed stack probabilities...');
      const testVowelAnalysis = analyzeManagedStackFrequencies('vowels', 9, 1000);
      const testConsonantAnalysis = analyzeManagedStackFrequencies('consonants', 9, 1000);
      
      console.log('\nTesting probability calculation with actual managed probabilities:');
      testWords.forEach(word => {
        const prob = calculateWordProbability(word, testVowelAnalysis.probabilities, testConsonantAnalysis.probabilities);
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