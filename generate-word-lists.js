#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const words = require('an-array-of-english-words');
const { 
  COUNTDOWN_DISTRIBUTION, 
  analyzeManagedStackFrequencies 
} = require('./countdown-simulator');
const { 
  filterCountdownWords, 
  rankWordsByProbability 
} = require('./word-ranker');

/**
 * Creates the word-lists directory if it doesn't exist
 */
function ensureWordListsDirectory() {
  const dir = path.join(__dirname, 'word-lists');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return dir;
}

/**
 * Groups words by length
 */
function groupWordsByLength(wordList) {
  const grouped = {};
  for (let i = 1; i <= 9; i++) {
    grouped[i] = [];
  }
  
  wordList.forEach(word => {
    if (word.length >= 1 && word.length <= 9) {
      grouped[word.length].push(word);
    }
  });
  
  return grouped;
}

/**
 * Saves a word list to a file
 */
function saveWordList(words, filename, dir) {
  const filepath = path.join(dir, filename);
  const content = words.map(word => word.word).join('\n');
  fs.writeFileSync(filepath, content);
  console.log(`Saved ${words.length} words to ${filename}`);
}

/**
 * Saves detailed word data to a JSON file
 */
function saveDetailedWordList(words, filename, dir) {
  const filepath = path.join(dir, filename);
  const content = JSON.stringify(words, null, 2);
  fs.writeFileSync(filepath, content);
  console.log(`Saved detailed data to ${filename}`);
}

/**
 * Main function to generate word lists
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'generate':
      const iterations = parseInt(args[1]) || 10000;
      const minLength = parseInt(args[2]) || 1;
      const maxLength = parseInt(args[3]) || 9;
      
      console.log(`Generating word lists for lengths ${minLength}-${maxLength}...`);
      console.log(`Using ${iterations} iterations for probability calculation...`);
      
      // Ensure directory exists
      const dir = ensureWordListsDirectory();
      
      // Get managed stack probabilities
      console.log('\nCalculating managed stack probabilities...');
      const vowelAnalysis = analyzeManagedStackFrequencies('vowels', 9, iterations);
      const consonantAnalysis = analyzeManagedStackFrequencies('consonants', 9, iterations);
      
      console.log('\nFiltering dictionary...');
      const countdownWords = filterCountdownWords(words);
      console.log(`Found ${countdownWords.length} valid Countdown words`);
      
      // Group words by length
      console.log('\nGrouping words by length...');
      const groupedWords = groupWordsByLength(countdownWords);
      
      // Generate ranked lists for each length
      for (let length = minLength; length <= maxLength; length++) {
        const wordsOfLength = groupedWords[length];
        console.log(`\nProcessing ${wordsOfLength.length} words of length ${length}...`);
        
        if (wordsOfLength.length === 0) {
          console.log(`No words of length ${length} found.`);
          continue;
        }
        
        // Rank words by probability
        const rankedWords = rankWordsByProbability(
          wordsOfLength,
          vowelAnalysis.probabilities,
          consonantAnalysis.probabilities
        );
        
        // Save simple word list
        const simpleFilename = `length-${length}-words.txt`;
        saveWordList(rankedWords, simpleFilename, dir);
        
        // Save detailed data
        const detailedFilename = `length-${length}-detailed.json`;
        saveDetailedWordList(rankedWords, detailedFilename, dir);
        
        // Show top 10
        console.log(`Top 10 words of length ${length}:`);
        rankedWords.slice(0, 10).forEach((word, index) => {
          console.log(`  ${index + 1}. ${word.word} (prob: ${word.probability.toExponential(3)})`);
        });
      }
      
      // Save probability data for reference
      const probFilename = 'managed-probabilities.json';
      const probData = {
        vowels: vowelAnalysis.probabilities,
        consonants: consonantAnalysis.probabilities,
        iterations,
        timestamp: new Date().toISOString()
      };
      fs.writeFileSync(path.join(dir, probFilename), JSON.stringify(probData, null, 2));
      console.log(`\nSaved probability data to ${probFilename}`);
      
      console.log('\nWord list generation complete!');
      break;
      
    case 'length':
      const targetLength = parseInt(args[1]);
      if (!targetLength || targetLength < 1 || targetLength > 9) {
        console.error('Please specify a valid length (1-9)');
        process.exit(1);
      }
      
      console.log(`Generating word list for length ${targetLength} only...`);
      
      const lengthDir = ensureWordListsDirectory();
      
      // Get probabilities
      const lengthVowelAnalysis = analyzeManagedStackFrequencies('vowels', 9, 5000);
      const lengthConsonantAnalysis = analyzeManagedStackFrequencies('consonants', 9, 5000);
      
      // Filter and group
      const lengthCountdownWords = filterCountdownWords(words);
      const lengthGroupedWords = groupWordsByLength(lengthCountdownWords);
      const targetWords = lengthGroupedWords[targetLength];
      
      if (targetWords.length === 0) {
        console.log(`No words of length ${targetLength} found.`);
        break;
      }
      
      console.log(`Found ${targetWords.length} words of length ${targetLength}`);
      
      // Rank and save
      const lengthRankedWords = rankWordsByProbability(
        targetWords,
        lengthVowelAnalysis.probabilities,
        lengthConsonantAnalysis.probabilities
      );
      
      const lengthSimpleFilename = `length-${targetLength}-words.txt`;
      const lengthDetailedFilename = `length-${targetLength}-detailed.json`;
      
      saveWordList(lengthRankedWords, lengthSimpleFilename, lengthDir);
      saveDetailedWordList(lengthRankedWords, lengthDetailedFilename, lengthDir);
      
      console.log(`\nTop 20 words of length ${targetLength}:`);
      lengthRankedWords.slice(0, 20).forEach((word, index) => {
        console.log(`  ${index + 1}. ${word.word} (prob: ${word.probability.toExponential(3)})`);
      });
      break;
      
    default:
      console.log('Countdown Word List Generator');
      console.log('\nUsage:');
      console.log('  node generate-word-lists.js generate [iterations] [minLength] [maxLength]');
      console.log('  node generate-word-lists.js length [length]');
      console.log('\nExamples:');
      console.log('  node generate-word-lists.js generate 10000 1 9');
      console.log('  node generate-word-lists.js generate 5000 8 9');
      console.log('  node generate-word-lists.js length 8');
      break;
  }
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  ensureWordListsDirectory,
  groupWordsByLength,
  saveWordList,
  saveDetailedWordList
}; 