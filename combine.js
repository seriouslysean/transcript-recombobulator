#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Function to parse time from transcript line
const parseTime = (line) => {
  const timeRegex = /\[([0-9:.]+)\s-->\s([0-9:.]+)\]/;
  const match = line.match(timeRegex);
  if (!match) return null;

  const [, startTime, endTime] = match;
  return { startTime, endTime };
};

// Function to sort transcripts based on start and end time
const sortTranscripts = (lines) => {
  return lines.sort((a, b) => {
    const timeA = parseTime(a.line);
    const timeB = parseTime(b.line);

    if (!timeA || !timeB) return 0;

    // Compare start times
    if (timeA.startTime < timeB.startTime) return -1;
    if (timeA.startTime > timeB.startTime) return 1;

    // If start times are equal, compare end times
    if (timeA.endTime < timeB.endTime) return -1;
    if (timeA.endTime > timeB.endTime) return 1;

    return 0;
  });
};

// Function to combine and sort transcripts
const combineTranscripts = (transcripts, outputFilePath) => {
  const combinedLines = [];
  let summary = 'Summary:\n';

  transcripts.forEach(({ name, role, character, description, filename }) => {
    summary += `${name} - ${role} - ${character} - ${description}\n`;
    const filePath = path.join(__dirname, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.trim().split('\n');

    lines.forEach(line => {
        // Don't add the line if it's empty
      if (!line.trim()) {
        return;
      }
      combinedLines.push({ name: character, line });
    });
  });

  // Sort the lines based on time
  const sortedLines = sortTranscripts(combinedLines);

  // Combine sorted lines into a single string
  const combinedText = sortedLines.reduce((acc, { name, line }) => {
    return `${acc}${name}: ${line}\n`;
  }, `${summary}\nTranscripts:\n`);

  // Write combined text to output file
  fs.writeFileSync(outputFilePath, combinedText, 'utf8');
  console.log(`Transcripts combined and saved to ${outputFilePath}`);
};

// Parse command-line arguments
const argv = yargs(hideBin(process.argv))
  .option('output', {
    alias: 'o',
    description: 'Output file path',
    type: 'string',
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
const arrays = ['player-name', 'role', 'character-name', 'character-description', 'transcript'];
const lengths = arrays.map(array => argv[array].length);
const allEqual = lengths.every(length => length === lengths[0]);

if (!allEqual) {
  console.error('Error: All input arrays (player-name, role, character-name, character-description, transcript) must have the same length.');
  process.exit(1);
}

// Extract transcript details from arguments
const transcripts = argv['player-name'].map((_, index) => ({
  name: argv['player-name'][index],
  role: argv['role'][index],
  character: argv['character-name'][index],
  description: argv['character-description'][index],
  filename: argv['transcript'][index],
}));

// Combine the transcripts and save to file
try {
  combineTranscripts(transcripts, argv.output);
} catch (error) {
  console.error('Error combining transcripts:', error.message);
}
