# Neurosymbolic Music Generation

[![great work](https://img.shields.io/badge/great-work-gold)](https://github.com/erl-j/neurosymbolic-music-generation)
[![YouTube](https://img.shields.io/badge/YouTube-demo-red?logo=youtube)](https://www.youtube.com/watch?v=vkNX7z25aWg)
[![tests](https://img.shields.io/badge/tests-0%20failing-brightgreen)](https://github.com/erl-j/neurosymbolic-music-generation)
[![BibTeX](https://img.shields.io/badge/cite-BibTeX-blue)](#cite)

Coding large language models cooks every domain specific symbolic music generation model out there if we let them express music as code.
Why train a bespoke neural network on MIDI files when LLMS already understands rhythm, harmony, and structure through code? 
To demonstrate this, this repository contains a  browserbased system for music composition. 
Clone this repo, load it into an LLM-augmented code editor (I like cursor & claude opus 4.5), and start jamming.

[![Demo Video](https://img.youtube.com/vi/vkNX7z25aWg/maxresdefault.jpg)](https://www.youtube.com/watch?v=vkNX7z25aWg)

*Click to watch demo on YouTube*

## In This Repository

| File | Description |
|------|-------------|
| `livecoding.html` | The browser-based music environment. Open this. |
| `music.js` | Your composition. The server hot-reloads this on save. |
| `server.js` | Optional. Enables hot-reload and sample loading. |
| `pieces/` | Example compositions to learn from or remix. |

## Why JavaScript

Language models understand JavaScript deeply. MIDI is a binary protocol that appears rarely in training data. This asymmetry makes JS a superior symbolic representation:

- **Native fluency** - LLMs write and debug JS naturally
- **Abstraction creation** - helper functions, chord builders, rhythm generators
- **Controllability** - communicate intent at any level, from "make it groovier" to "add triplets on beat 3"
- **Iterative refinement** - tweak code, ask for more, repeat

| Representation | Problem |
|----------------|---------|
| **MIDI** | Binary format, rare in training data. No abstraction layer. |
| **MusicXML** | Verbose XML. LLMs generate malformed structures. |
| **ABC notation** | Obscure, limited training examples, no composability. |
| **Piano roll** | Flat structure. Can't express "repeat this up a fifth." |
| **Custom DSLs** | Zero-shot performance is garbage. |

JS wins: massive training data, Turing complete, self-documenting, composable, debuggable.

## Setup

**Standalone (no server):**
Open `livecoding.html` directly in a browser. Edit `DEFAULT_CODE` to change the music.

**With server (hot-reload + samples):**
1. Configure sample directory in `server.js`
2. `node server.js`
3. Open `livecoding.html`

The server watches `music.js` and hot-reloads on save.

## API

Your code returns a function `(t, s) => notes[]` where:
- `t` = tick count (16th notes)
- `s` = time in seconds

Note properties:

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

**Synths:** `sine`, `sawtooth`, `square`, `triangle`

**Built-in drums:** `drums` with MIDI notes: 36=kick, 38=snare, 42=hihat, 46=open hihat, 39=clap

**Samples:** `query:index` (e.g. `kick:0`, `hat:5`). Boolean search: `acoustic & snare:0`

**MIDI output:** `m:channel` (e.g. `m:1` for channel 1)

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

## Inspirations

- [DreamCoder](https://arxiv.org/abs/2006.08381) - Kevin Ellis et al. Program synthesis through wake-sleep library learning.
- [Barbarians at the Gate](https://arxiv.org/abs/2510.06189) - AI-driven research for systems. Iterative generate-evaluate-refine loops with LLMs.
- [Barbarians at the Gate](https://www.imdb.com/title/tt0106356/) (1993) - James Garner plays Ross Johnson. Unrelated but excellent.
- [Strudel](https://strudel.cc/) - Live coding music in the browser. Major inspiration for the UI and approach.

## Other related work:

- [Neuro-Symbolic Composition of Music with Talking Points](https://computationalcreativity.net/iccc23/papers/ICCC-2023_paper_45.pdf) Simon Colton et al.

## Cite

```bibtex
@software{neurosymbolic-music-generation,
  author = {Jonason, Nicolas},
  title = {Neurosymbolic Music Generation},
  url = {https://github.com/erl-j/neurosymbolic-music-generation}
}
```

## Future work. 
- Evolve better solutions. Use CLAP/Audio preference models as fitness.
- Mixing, sound design. 
- Deeper daw integration.
---

*Vibecoded: the human pointed, the LLM typed.*
