#!/usr/bin/env node

// Countdown Letter Stack Simulator
// Simulates the letter distribution and duplicate management described in the chat

const COUNTDOWN_DISTRIBUTION = {
  vowels: {
    A: 15,
    E: 21,
    I: 13,
    O: 13,
    U: 5
  },
  consonants: {
    B: 2, C: 3, D: 6, F: 2, G: 3, H: 2, J: 1, K: 1, L: 5, M: 4,
    N: 8, P: 4, Q: 1, R: 9, S: 9, T: 9, V: 1, W: 1, X: 1, Y: 1, Z: 1
  }
};

/**
 * Creates a stack of letters based on the Countdown distribution
 */
function createLetterStack(type) {
  const distribution = COUNTDOWN_DISTRIBUTION[type];
  const stack = [];
  
  for (const [letter, count] of Object.entries(distribution)) {
    for (let i = 0; i < count; i++) {
      stack.push(letter);
    }
  }
  
  return stack;
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Extracts consecutive duplicates and moves them to the end
 * Uses a more efficient algorithm to avoid infinite loops
 */
function extractConsecutiveDuplicates(stack) {
  const result = [];
  const duplicates = [];
  
  // First pass: collect non-consecutive letters
  for (let i = 0; i < stack.length; i++) {
    if (i === 0 || stack[i] !== stack[i - 1]) {
      result.push(stack[i]);
    } else {
      duplicates.push(stack[i]);
    }
  }
  
  // Append all duplicates to the end
  result.push(...duplicates);
  
  return result;
}

/**
 * Simulates drawing n letters from a stack
 */
function drawFromStack(stack, count) {
  if (count > stack.length) {
    throw new Error(`Cannot draw ${count} letters from stack of size ${stack.length}`);
  }
  
  return stack.slice(0, count);
}

/**
 * Simulates a complete Countdown letter round
 */
function simulateLetterRound(vowelCount, consonantCount, useSimulation = false) {
  if (vowelCount + consonantCount !== 9) {
    throw new Error('Total letter count must be 9');
  }
  
  if (useSimulation) {
    // Simulation approach
    const vowelStack = createLetterStack('vowels');
    const consonantStack = createLetterStack('consonants');
    
    // Shuffle both stacks
    const shuffledVowels = shuffleArray(vowelStack);
    const shuffledConsonants = shuffleArray(consonantStack);
    
    // Extract consecutive duplicates
    const managedVowels = extractConsecutiveDuplicates(shuffledVowels);
    const managedConsonants = extractConsecutiveDuplicates(shuffledConsonants);
    
    // Draw letters
    const drawnVowels = drawFromStack(managedVowels, vowelCount);
    const drawnConsonants = drawFromStack(managedConsonants, consonantCount);
    
    return {
      vowels: drawnVowels,
      consonants: drawnConsonants,
      allLetters: [...drawnVowels, ...drawnConsonants].sort(),
      method: 'simulation'
    };
  } else {
    // Probabilistic approach (placeholder for now)
    // This would calculate expected probabilities based on the managed distribution
    return {
      vowels: [],
      consonants: [],
      allLetters: [],
      method: 'probabilistic',
      note: 'Probabilistic calculation not yet implemented'
    };
  }
}

/**
 * Analyzes the frequency of letters in the top N positions after duplicate extraction
 */
function analyzeManagedStackFrequencies(type, topN = 9, iterations = 10000) {
  const letterCounts = {};
  const totalLetters = Object.values(COUNTDOWN_DISTRIBUTION[type]).reduce((a, b) => a + b, 0);
  
  // Initialize counts
  for (const letter of Object.keys(COUNTDOWN_DISTRIBUTION[type])) {
    letterCounts[letter] = 0;
  }
  
  // Run simulations
  for (let i = 0; i < iterations; i++) {
    const stack = createLetterStack(type);
    const shuffled = shuffleArray(stack);
    const managed = extractConsecutiveDuplicates(shuffled);
    const topLetters = managed.slice(0, topN);
    
    for (const letter of topLetters) {
      letterCounts[letter]++;
    }
  }
  
  // Calculate probabilities
  const probabilities = {};
  for (const [letter, count] of Object.entries(letterCounts)) {
    probabilities[letter] = count / (iterations * topN);
  }
  
  return {
    letterCounts,
    probabilities,
    iterations,
    topN
  };
}

/**
 * Main function to run the simulation
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'simulate':
      const vowelCount = parseInt(args[1]) || 4;
      const consonantCount = parseInt(args[2]) || 5;
      const useSim = args[3] === 'true';
      
      console.log(`Simulating Countdown round with ${vowelCount} vowels, ${consonantCount} consonants`);
      console.log(`Method: ${useSim ? 'Simulation' : 'Probabilistic'}`);
      
      try {
        const result = simulateLetterRound(vowelCount, consonantCount, useSim);
        console.log('Result:', result);
      } catch (error) {
        console.error('Error:', error.message);
      }
      break;
      
    case 'analyze':
      const type = args[1] || 'vowels';
      const topN = parseInt(args[2]) || 9;
      const iterations = parseInt(args[3]) || 10000;
      
      console.log(`Analyzing ${type} stack frequencies (top ${topN}, ${iterations} iterations)`);
      
      const analysis = analyzeManagedStackFrequencies(type, topN, iterations);
      console.log('Letter counts in top positions:');
      console.log(analysis.letterCounts);
      console.log('\nProbabilities:');
      console.log(analysis.probabilities);
      break;
      
    case 'test':
      console.log('Testing duplicate extraction...');
      
      // Test with a simple case
      const testStack = ['A', 'A', 'B', 'C', 'A', 'D', 'E', 'E'];
      console.log('Original stack:', testStack);
      
      const extracted = extractConsecutiveDuplicates([...testStack]);
      console.log('After extraction:', extracted);
      
      // Test with Countdown vowels
      const vowelStack = createLetterStack('vowels');
      console.log(`\nVowel stack size: ${vowelStack.length}`);
      
      const shuffledVowels = shuffleArray(vowelStack);
      const managedVowels = extractConsecutiveDuplicates(shuffledVowels);
      
      console.log('First 20 letters after shuffle:', shuffledVowels.slice(0, 20));
      console.log('First 20 letters after extraction:', managedVowels.slice(0, 20));
      break;
      
    default:
      console.log('Countdown Letter Stack Simulator');
      console.log('\nUsage:');
      console.log('  node countdown-simulator.js simulate [vowels] [consonants] [useSimulation]');
      console.log('  node countdown-simulator.js analyze [type] [topN] [iterations]');
      console.log('  node countdown-simulator.js test');
      console.log('\nExamples:');
      console.log('  node countdown-simulator.js simulate 4 5 true');
      console.log('  node countdown-simulator.js analyze vowels 9 10000');
      console.log('  node countdown-simulator.js test');
      break;
  }
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  COUNTDOWN_DISTRIBUTION,
  createLetterStack,
  shuffleArray,
  extractConsecutiveDuplicates,
  drawFromStack,
  simulateLetterRound,
  analyzeManagedStackFrequencies
}; 