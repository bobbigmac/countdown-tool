# Countdown Letter Stack Simulator

A Node.js simulation of the Countdown letter stack management system, including duplicate extraction and word probability ranking.

## Overview

This project simulates the Countdown letter distribution and management system as described in the chat. It models:

1. **Letter Distribution**: Uses the official Countdown letter frequencies (42 vowels, 56 consonants)
2. **Duplicate Management**: Simulates the "extract consecutive duplicates to the end" method
3. **Word Ranking**: Ranks English words by their likelihood of being formable with the managed stack

## Features

### Countdown Simulator (`countdown-simulator.js`)

- **Stack Creation**: Creates letter stacks based on official Countdown distribution
- **Duplicate Extraction**: Efficiently removes consecutive duplicates by moving them to the end
- **Simulation**: Simulates complete letter rounds with configurable vowel/consonant counts
- **Analysis**: Analyzes managed stack frequencies through Monte Carlo simulation

### Word Ranker (`word-ranker.js`)

- **Dictionary Filtering**: Filters English dictionary to valid Countdown words (≤9 letters)
- **Probability Calculation**: Calculates word formation probability using managed stack frequencies
- **Word Ranking**: Ranks words by their likelihood of being formable

## Installation

```bash
npm install
```

## Usage

### Basic Simulation

```bash
# Test the duplicate extraction algorithm
node countdown-simulator.js test

# Simulate a letter round (4 vowels, 5 consonants)
node countdown-simulator.js simulate 4 5 true

# Analyze vowel stack frequencies
node countdown-simulator.js analyze vowels 9 10000

# Analyze consonant stack frequencies
node countdown-simulator.js analyze consonants 9 10000
```

### Word Ranking

```bash
# Rank words by probability (10,000 iterations, top 50 words)
node word-ranker.js rank 10000 50

# Test word filtering and probability calculation
node word-ranker.js test
```

## Key Findings

### Managed Stack Probabilities

After duplicate extraction, the top 9 positions show:

**Vowels:**
- E: ~28.4% (down from ~31.3% in raw distribution)
- A: ~22.7% (down from ~22.4% in raw distribution)
- O: ~20.1% (up from ~19.4% in raw distribution)
- I: ~20.0% (up from ~19.4% in raw distribution)
- U: ~8.9% (up from ~7.5% in raw distribution)

**Consonants:**
- R: ~12.0% (up from ~16.1% in raw distribution)
- S: ~11.9% (up from ~16.1% in raw distribution)
- T: ~11.5% (up from ~16.1% in raw distribution)
- N: ~10.4% (up from ~14.3% in raw distribution)

### Most Likely Words

The system identifies words that are most likely to be formable, typically:
- Short words (1-2 letters) with high-frequency letters
- Words with diverse vowel/consonant combinations
- Words avoiding duplicate letters (since duplicates are pushed to the end)

## Algorithm Details

### Duplicate Extraction

The algorithm efficiently removes consecutive duplicates by:
1. Scanning the shuffled stack from left to right
2. Keeping the first occurrence of each letter in sequence
3. Collecting all consecutive duplicates
4. Appending all duplicates to the end

This ensures no consecutive duplicates remain while preserving the total letter count.

### Word Probability Calculation

Word probability is calculated by:
1. Counting each letter in the word
2. Looking up the managed probability for each letter
3. Multiplying probabilities (simplified approach - doesn't account for drawing without replacement)
4. Ranking words by total probability

## Files

- `countdown-simulator.js`: Main simulation engine
- `word-ranker.js`: Word ranking and analysis
- `package.json`: Project dependencies
- `README.md`: This documentation

## Dependencies

- `an-array-of-english-words`: English dictionary for word analysis

## License

MIT 