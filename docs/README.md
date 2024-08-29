# Transcript Combiner

This repository contains a Node.js script to combine multiple transcript files into a single file. The script sorts the transcript lines based on timestamps and prefixes each line with the character's name.

I built this to help make it easier when summarizing D&D campaign session audio. By putting all the players' transcripts together, it helps a large language model (LLM) understand the flow of events better and creates a more accurate summary.

## Usage

You can run the script using the following command:

```bash
npm run tool:combine -- --output ./tmp/combined-transcripts.txt \
    --player-name "DM" --role "Dungeon Master" --character-name "DM" --character-description "DM for the campaign" --transcript "./tmp/dm-transcript.txt" \
    --player-name "Player 1" --role "Player" --character-name "Player 1" --character-description "Fighter" --transcript "./tmp/player-1-transcript.txt" \
    --player-name "Player 2" --role "Player" --character-name "Player 2" --character-description "Ranger" --transcript "./tmp/player-2-transcript.txt" \
    --player-name "Player 3" --role "Player" --character-name "Player 3" --character-description "Wizard" --transcript "./tmp/player-3-transcript.txt"
```

## Examples

- [DM Transcript](../tmp/dm-transcript.txt)
- [Player 1 Transcript](../tmp/player-1-transcript.txt)
- [Player 2 Transcript](../tmp/player-2-transcript.txt)
- [Player 3 Transcript](../tmp/player-3-transcript.txt)
- [Combined Transcripts](../tmp/combined-transcripts.txt)
