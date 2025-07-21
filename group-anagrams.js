#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Converts a word to its canonical letter signature (sorted letters)
 */
function getLetterSignature(word) {
  return word.toUpperCase().split('').sort().join('');
}

/**
 * Groups words by their letter composition and outputs anagram groups
 */
function groupWordsByAnagrams(length) {
  const inputFile = path.join(__dirname, 'word-lists', `length-${length}-words.txt`);
  const outputFile = path.join(__dirname, 'word-lists', `length-${length}-anagram-groups.txt`);
  
  if (!fs.existsSync(inputFile)) {
    console.log(`Input file not found: ${inputFile}`);
    return;
  }
  
  // Read the word list
  const content = fs.readFileSync(inputFile, 'utf8');
  const words = content.trim().split('\n');
  
  // Group words by their letter signature
  const anagramGroups = {};
  
  words.forEach(word => {
    const signature = getLetterSignature(word);
    if (!anagramGroups[signature]) {
      anagramGroups[signature] = [];
    }
    anagramGroups[signature].push(word);
  });
  
  // Convert to array and sort by the first (highest probability) word in each group
  const sortedGroups = Object.entries(anagramGroups)
    .map(([signature, groupWords]) => ({
      signature,
      words: groupWords,
      representative: groupWords[0] // First word is highest probability
    }))
    .sort((a, b) => {
      // Sort by position of representative word in original list
      const aIndex = words.indexOf(a.representative);
      const bIndex = words.indexOf(b.representative);
      return aIndex - bIndex;
    });
  
  // Generate output
  let output = '';
  let totalWords = 0;
  
  sortedGroups.forEach(group => {
    // Start line with letter signature, then representative word, followed by variants
    const line = `[${group.signature}] ${group.words.join(' ')}`;
    output += line + '\n';
    totalWords += group.words.length;
  });
  
  // Write the output file
  fs.writeFileSync(outputFile, output.trim());
  
  console.log(`Length ${length}: Created ${sortedGroups.length} anagram groups from ${totalWords} words`);
  
  // Show some examples
  console.log(`Top 5 anagram groups for length ${length}:`);
  sortedGroups.slice(0, 5).forEach((group, index) => {
    const groupSize = group.words.length;
    const preview = group.words.slice(0, 3).join(', ');
    const more = groupSize > 3 ? ` + ${groupSize - 3} more` : '';
    console.log(`  ${index + 1}. [${group.signature}] ${preview}${more} (${groupSize} total)`);
  });
}

/**
 * Process all lengths
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Process specific lengths
    args.forEach(arg => {
      const length = parseInt(arg);
      if (length >= 1 && length <= 9) {
        groupWordsByAnagrams(length);
      } else {
        console.log(`Invalid length: ${arg}`);
      }
    });
  } else {
    // Process lengths 7, 8, 9 by default
    [7, 8, 9].forEach(length => {
      groupWordsByAnagrams(length);
      console.log(''); // Empty line between lengths
    });
  }
}

// Run the script
main(); 