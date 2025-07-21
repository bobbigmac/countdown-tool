#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Creates formatted word lists with line breaks every 10 entries
 */
function createFormattedLists() {
  const lengths = [7, 8, 9];
  
  lengths.forEach(length => {
    const inputFile = path.join(__dirname, 'word-lists', `length-${length}-words.txt`);
    const outputFile = path.join(__dirname, 'word-lists', `length-${length}-formatted.txt`);
    
    if (!fs.existsSync(inputFile)) {
      console.log(`Input file not found: ${inputFile}`);
      return;
    }
    
    // Read the word list
    const content = fs.readFileSync(inputFile, 'utf8');
    const words = content.trim().split('\n');
    
    // Take top 20%
    const top20Percent = Math.ceil(words.length * 0.2);
    const topWords = words.slice(0, top20Percent);
    
    // Format with line breaks every 10 entries
    let formattedContent = '';
    for (let i = 0; i < topWords.length; i++) {
      formattedContent += topWords[i];
      
      // Add line break after every 10th word (except the last one)
      if ((i + 1) % 10 === 0 && i < topWords.length - 1) {
        formattedContent += '\n';
      } else if (i < topWords.length - 1) {
        formattedContent += ' ';
      }
    }
    
    // Write the formatted file
    fs.writeFileSync(outputFile, formattedContent);
    
    console.log(`Created ${outputFile} with ${topWords.length} words (top 20% of ${words.length})`);
  });
}

// Run the function
createFormattedLists(); 