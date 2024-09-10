# Transcript Recombobulator

This repository contains a Node.js script to combine multiple transcript files into a single file. The script sorts the transcript lines based on timestamps and prefixes each line with the character's name.

I built this to help make it easier when summarizing D&D campaign session audio. By putting all the players' transcripts together, it helps a large language model (LLM) understand the flow of events better and creates a more accurate summary.

## Usage

You can run the script using the following command:

```bash
npm run tool:combine -- --output ./tmp/combined-transcripts.txt \
    --dedupe "consecutive" \
    --skip-filter "/\[AUDIO OUT\]|\[BLANK_AUDIO\]/" \
    --timestamped false \
    --player-name "DM" --role "Dungeon Master" --character-name "DM" --character-description "DM for the campaign" --transcript "./tmp/dm-transcript.vtt" \
    --player-name "Player 1" --role "Player" --character-name "Player 1" --character-description "Fighter" --transcript "./tmp/player-1-transcript.vtt" \
    --player-name "Player 2" --role "Player" --character-name "Player 2" --character-description "Ranger" --transcript "./tmp/player-2-transcript.vtt" \
    --player-name "Player 3" --role "Player" --character-name "Player 3" --character-description "Wizard" --transcript "./tmp/player-3-transcript.vtt"
```

## Options

### `--dedupe`

The `--dedupe` option specifies the deduplication strategy to be used when processing VTT files. It accepts the following values:

- `"false"`: No deduplication is performed. All content is included as-is.
- `"consecutive"`: Removes consecutive duplicate content. This is useful for cleaning up transcripts where the same message might be repeated multiple times in a row.
- `"unique"`: Ensures only the first occurrence of each unique message is included. This is useful for eliminating repeated content that may occur due to AI hallucinations.

### `--skip-filter`

The `--skip-filter` option allows you to specify a series of content strings or regex patterns to filter out messages from the parsed VTT files. If a message matches any of the specified filters, it will be excluded from the output. This is useful for removing unwanted content such as `[AUDIO OUT]` or `[BLANK_AUDIO]`.

You can pass multiple filters as strings:

```bash
--skip-filter "[AUDIO OUT]" "[BLANK_AUDIO]"
```

Or as a single regex pattern:

```bash
--skip-filter "/\[AUDIO OUT\]|\[BLANK_AUDIO\]/"
```

### `--timestamped`

The `--timestamped` option is a boolean flag that controls whether timestamps are included in the output. When enabled (default), timestamps are included. When disabled, timestamps are omitted from the output.

### `--chunks`

The `--chunks` option specifies the number of parts to split the combined transcript into. When set to `1` (default), no splitting occurs. When set to a value greater than `1`, the combined transcript is divided into the specified number of parts, with each part saved as a separate file.

## Examples

- [DM Transcript](../tmp/dm-transcript.vtt)
- [Player 1 Transcript](../tmp/player-1-transcript.vtt)
- [Player 2 Transcript](../tmp/player-2-transcript.vtt)
- [Player 3 Transcript](../tmp/player-3-transcript.vtt)
- [Combined Transcripts](../tmp/combined-transcripts.txt)
