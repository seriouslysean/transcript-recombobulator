#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

/**
 * Normalizes content by trimming and removing excessive spaces and newlines.
 * @param {string} text - The content text to normalize.
 * @returns {string} - Normalized content.
 */
const normalizeContent = (text) => {
  return text.trim().replace(/\s+/g, ' ');
};

/**
 * Checks if the content matches any of the skip filters.
 * @param {string} content - The content to check.
 * @param {Array} filters - The array of filters (strings or regex patterns).
 * @returns {boolean} - True if the content matches any filter, false otherwise.
 */
const shouldSkipContent = (content, filters) => {
  return filters.some(filter => {
    if (typeof filter === 'string') {
      return content.includes(filter);
    } else if (filter instanceof RegExp) {
      return filter.test(content);
    }
    return false;
  });
};

/**
 * Parses VTT file content and returns an array of timestamped content.
 * Logs deduplication and filter information based on options.
 * @param {string} fileContent - The content of the VTT file.
 * @param {string} dedupe - The deduplication strategy ("false", "consecutive", "unique").
 * @param {Array} skipFilters - Array of strings or regex patterns to filter out content.
 * @param {string} filename - The name of the VTT file being parsed.
 * @returns {Array} Parsed VTT content as an array of arrays.
 */
const parseVTT = (fileContent, dedupe, skipFilters, filename) => {
  const timeRegex = /(\d{2}:\d{2}:\d{2}\.\d{3})\s-->\s(\d{2}:\d{2}:\d{2}\.\d{3})/;
  const result = [];
  const entries = fileContent.split(timeRegex).slice(1); // Split on timestamps and remove the first empty element

  let lastContent = null;
  let uniqueContents = new Set();
  let skippedCount = 0;
  let duplicateCount = 0;
  let initialEntries = 0;

  console.log(`\nProcessing ${filename} with the following options:`);
  if (dedupe !== "false") console.log(`    - Deduplication strategy: ${dedupe}`);
  if (skipFilters.length > 0) console.log(`    - Skip filters applied: ${skipFilters}`);

  for (let i = 0; i < entries.length; i += 3) {
    const startTime = entries[i];
    const endTime = entries[i + 1];
    const content = normalizeContent(entries[i + 2]);

    initialEntries++;

    // Skip content if it matches any of the skip filters
    if (shouldSkipContent(content, skipFilters)) {
      skippedCount++;
      continue;
    }

    // Deduplication logic
    if (dedupe === "consecutive" && lastContent !== null && content === lastContent) {
      duplicateCount++;
      continue;
    } else if (dedupe === "unique" && uniqueContents.has(content)) {
      duplicateCount++;
      continue;
    }

    if (content) {
      result.push([`${startTime} --> ${endTime}`, content]);
      lastContent = content;
      uniqueContents.add(content);
    }
  }

  console.log(`    - ${initialEntries} entries processed`);
  if (dedupe !== "false") console.log(`    - ${duplicateCount} duplicates removed`);
  if (skipFilters.length > 0) console.log(`    - ${skippedCount} skipped due to filters`);
  console.log(`    - ${result.length} final messages detected`);

  return result;
};

/**
 * Combines transcripts from multiple VTT files and saves to an output file.
 * Logs details of the combination process.
 * @param {Array} transcripts - Array of transcript details.
 * @param {string} outputFilePath - Path to the output file.
 * @param {boolean} timestamped - Whether to include timestamps in the output.
 */
const combineTranscripts = (transcripts, outputFilePath, timestamped) => {
  const combinedLines = [];
  let summary = 'Summary:\n';

  transcripts.forEach(({ name, role, character, description, filename }) => {
    summary += `${name} - ${role} - ${character} - ${description}\n`;
    const filePath = path.join(__dirname, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsedVTT = parseVTT(fileContent, argv.dedupe, skipFilters, filename);

    parsedVTT.forEach(([timestamp, content]) => {
      combinedLines.push({ timestamp, character, content });
    });
  });

  // Sort the lines based on timestamp
  combinedLines.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  // Combine sorted lines into a single string
  const combinedText = combinedLines.reduce((acc, { timestamp, character, content }) => {
    if (timestamped) {
      return `${acc}[${timestamp}] ${character}: ${content}\n`;
    } else {
      return `${acc}${character}: ${content}\n`;
    }
  }, `${summary}\nTranscripts:\n`);

  fs.writeFileSync(outputFilePath, combinedText, 'utf8');
  console.log(`Transcripts combined and saved to ${outputFilePath}`);
};

// Parse command-line arguments
const argv = yargs(hideBin(process.argv))
  .option('dedupe', {
    type: 'string',
    description: 'Deduplication strategy ("false", "consecutive", "unique")',
    default: 'false',
    choices: ['false', 'consecutive', 'unique'],
  })
  .option('skip-filter', {
    type: 'array',
    description: 'Skip messages containing these strings or matching these regex patterns',
    default: [],
    coerce: (arg) => {
      return arg.map(filter => {
        if (filter.startsWith('/') && filter.endsWith('/')) {
          return new RegExp(filter.slice(1, -1));
        }
        return filter;
      });
    }
  })
  .option('timestamped', {
    type: 'boolean',
    description: 'Include timestamps in the output',
    default: true,
  })
  .option('output', {
    type: 'string',
    description: 'Path to the output file',
    demandOption: true,
  })
  .array('player-name')
  .array('role')
  .array('character-name')
  .array('character-description')
  .array('transcript')
  .demandOption(['player-name', 'role', 'character-name', 'character-description', 'transcript'])
  .argv;

// Validate that all arrays have the same length
const { 'player-name': playerNames, role, 'character-name': characterNames, 'character-description': characterDescriptions, transcript, dedupe, 'skip-filter': skipFilters, timestamped } = argv;

if (![playerNames, role, characterNames, characterDescriptions, transcript].every(arr => arr.length === playerNames.length)) {
  console.error('Error: All input arrays (player-name, role, character-name, character-description, transcript) must have the same length.');
  process.exit(1);
}

// Extract transcript details from arguments
const transcripts = playerNames.map((_, index) => ({
  name: playerNames[index],
  role: role[index],
  character: characterNames[index],
  description: characterDescriptions[index],
  filename: transcript[index],
}));

// Combine the transcripts and save to file
try {
  combineTranscripts(transcripts, argv.output, timestamped);
} catch (error) {
  console.error(`Error combining transcripts: ${error.message}`);
}
