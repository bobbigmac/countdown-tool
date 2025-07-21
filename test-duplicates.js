#!/usr/bin/env node

const { calculateWordProbability } = require('./word-ranker');
const { analyzeManagedStackFrequencies } = require('./countdown-simulator');

console.log('Getting managed probabilities...');
const vowelAnalysis = analyzeManagedStackFrequencies('vowels', 9, 1000);
const consonantAnalysis = analyzeManagedStackFrequencies('consonants', 9, 1000);

console.log('\nTesting words with different duplicate patterns:');

const testWords = [
  'LETTERS',   // Double T, E, R
  'TREATER',   // Double T, E, R  
  'ASSISTS',   // Double S
  'ARREARS',   // Double R, A
  'NONSENSE',  // Double N, S, E
  'SENORITA',  // No duplicates
  'ASTEROID',  // No duplicates
  'EATERIES',  // Double E
  'ASSASSIN'   // Multiple duplicates
];

testWords.forEach(word => {
  const prob = calculateWordProbability(word, vowelAnalysis.probabilities, consonantAnalysis.probabilities);
  
  // Count duplicates
  const letterCounts = {};
  for (const letter of word.toUpperCase()) {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  }
  
  const duplicates = Object.entries(letterCounts)
    .filter(([letter, count]) => count > 1)
    .map(([letter, count]) => `${letter}×${count}`)
    .join(', ');
  
  console.log(`${word.padEnd(10)} | ${prob.toExponential(3)} | duplicates: ${duplicates || 'none'}`);
});

// Test the difference between vowel and consonant duplicates
console.log('\n=== Duplicate Penalty Comparison ===');
console.log('Single letters vs doubles:');

const singleLetterWords = ['A', 'E', 'T', 'R', 'S'];
const doubleLetterWords = ['AA', 'EE', 'TT', 'RR', 'SS'];

for (let i = 0; i < singleLetterWords.length; i++) {
  const single = calculateWordProbability(singleLetterWords[i], vowelAnalysis.probabilities, consonantAnalysis.probabilities);
  const double = calculateWordProbability(doubleLetterWords[i], vowelAnalysis.probabilities, consonantAnalysis.probabilities);
  const penalty = single / double;
  
  console.log(`${singleLetterWords[i]} vs ${doubleLetterWords[i]}: penalty factor = ${penalty.toFixed(1)}x`);
} 