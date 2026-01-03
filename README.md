# Neurosymbolic Music Generation

"Neurosymbolic" in this case is a fancy way of saying: have an LLM write code that represents music. The neural part is the language model. The symbolic part is JavaScript.

*"Just clone this repo and load it into some llm augmented code editor and you will have the time of your life." Ä

[Demo video](https://www.youtube.com/watch?v=vkNX7z25aWg)

Browser-based system for AI-assisted music composition. LLMs write JavaScript that generates notes in real-time.





## Why JavaScript for Music Generation

Language models are trained on massive amounts of code. They understand JavaScript deeply - its patterns, abstractions, and idioms. MIDI, by contrast, is a binary protocol that appears rarely in training data.

This asymmetry makes JS a superior symbolic representation for LLM-driven music generation:

1. **Native fluency** - LLMs can write, debug, and reason about JS code naturally. They struggle with raw MIDI bytes or piano roll coordinates.

2. **Abstraction creation** - The model can define helper functions, chord builders, rhythm generators, scales - whatever abstractions fit the musical idea. These abstractions are readable and editable by humans.

3. **Controllability** - Want a funkier hi-hat pattern? Ask for it. Want the bass to follow the chord roots? Describe it. The code-as-music paradigm lets you communicate intent at any level of abstraction, from "make it groovier" to "add a triplet fill on beat 3."

4. **Iterative refinement** - You can take LLM-generated code, tweak a few lines, and ask for more. The conversation happens in a shared language both parties understand.

This approach outperforms other symbolic music generation systems in terms of control and expressiveness. The model isn't predicting the next MIDI event - it's writing a program that generates music, with all the compositional structure that implies.

### Why JS beats other representations

| Representation | Problem |
|----------------|---------|
| **MIDI** | Binary format, rare in training data. LLMs hallucinate bytes. No abstraction layer. |
| **MusicXML** | Verbose XML with music-specific semantics. LLMs can parse it but generate malformed structures. |
| **ABC notation** | Compact but obscure. Limited training examples. No composability. |
| **Piano roll / token sequences** | Flat structure. "Next token" prediction can't express "repeat this but up a fifth" or "add fills every 4 bars." |
| **Custom DSLs** | Model has never seen them. Zero-shot performance is garbage. |

JS wins because:

- **Massive training data** - every model has seen millions of JS files
- **Turing complete** - loops, conditionals, functions, closures. You can express any musical structure
- **Self-documenting** - variable names and comments carry intent
- **Composable** - build small pieces, combine them. The model understands function composition
- **Debuggable** - syntax errors have line numbers. Logic errors are readable code

Other AI music systems force the model to learn a new representation or predict tokens in a domain it barely understands. This system meets the model where it already lives: in code.

## Setup

**Standalone (no server):**
Open `livecoding.html` directly in a browser. Edit the `DEFAULT_CODE` constant in the file to change the music. Works with synths and built-in drums only.

**With server (hot-reload + samples):**
1. Configure sample directory in `server.js`:
```js
const SAMPLES_DIR = '/path/to/your/samples';
```

2. Start the server:
```bash
node server.js
```

3. Open `livecoding.html` in a browser

The server watches `music.js` for changes and hot-reloads automatically. Also enables sample search/playback.

## API

Your code must return a function `(t, s) => notes[]` where:
- `t` = tick count (16th notes)
- `s` = time in seconds

Each note object can have:

| Key | Description | Default |
|-----|-------------|---------|
| `p` | MIDI pitch (0-127) | 60 |
| `d` | duration in seconds | 0.1 |
| `v` | volume (0-1+) | 0.5 |
| `x` | pan (-1 to 1) | 0 |
| `r` | reverb amount | 0 |
| `o` | offset in ticks | 0 |
| `a` | attack time | 0.01 |
| `c` | filter cutoff | 2000 |
| `w` | waveform/instrument | sine |
| `id` | exclusive note id | - |
| `start` | sample start position (0-1) | 0 |

## Instruments (`w` parameter)

**Synthesizers:**
- `sine`, `sawtooth`, `square`, `triangle`

**Built-in drums:**
- `drums` with MIDI notes: 36=kick, 38=snare, 42=hihat, 46=open hihat, 39=clap

**Samples:**
- `query:index` - search samples and pick by index (e.g. `kick:0`, `hat:5`)
- Boolean search: `acoustic & snare:0`, `hat || cymbal:3`

**MIDI output:**
- `m:channel` - send to external MIDI (e.g. `m:1` for channel 1)

## Example

```js
return (t, s) => {
    const n = [];
    
    // kick on 1 and 3
    if (t % 8 === 0 || t % 8 === 6) {
        n.push({ p: 36, w: 'drums', v: 0.9 });
    }
    
    // snare on 2 and 4
    if (t % 8 === 4) {
        n.push({ p: 38, w: 'drums', v: 0.8 });
    }
    
    // hi-hat 16ths
    n.push({ p: 42, w: 'drums', v: t % 2 ? 0.2 : 0.4 });
    
    // bass line using samples
    if (t % 4 === 0) {
        n.push({ w: `bass:${t % 8}`, p: 36, v: 0.7, d: 0.3 });
    }
    
    return n;
};
```

## Features

- Hot reload on file save
- Piano roll visualization
- BPM and volume controls
- MIDI output support
- Sample search with boolean operators
- Per-note exclusive IDs (retrigger/cut behavior)
