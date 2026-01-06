# Music Composition Guide for LLM

Use music theoretical abstractions to create coherent, interesting compositions. This guide covers harmony, rhythm, and dynamics.

---

## Global Settings & Structure

Define reusable constants at the top:

```js
BAR = 16                    // 16 sixteenths = one 4/4 bar
BPM = 90                    // conceptual reference
ROOT = 48                   // C3 as tonal center
slop = () => (Math.random() - 0.5) * 0.015  // humanization
swing = (bt) => (bt % 2 === 1) ? 0.06 : 0   // swing 
bass= "m:2" // sent to midi channel 2.
lead = "sawtooth" // sawtooth waveform
rain = "rain & storm:5" // loads 5th sample with rain and storm in filename  
```

Use structural variables to track musical form:

```js
bar = Math.floor(t / BAR)
bt = t % BAR                // beat within bar
phrase = Math.floor(bar / 8) // 8-bar phrase
section = phrase % 4        // AABA or similar form
```

---

## HARMONY

### Chord Construction

Use the `Ch()` function to build chords from symbols:

```js
// Chord symbol parser - paste this at the top of your composition
Ch = (symbol, octave = 4) => {
  const notes = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
  const qualities = {
    'maj':    [0, 4, 7],
    'min':    [0, 3, 7],      'm':      [0, 3, 7],
    'dim':    [0, 3, 6],      'o':      [0, 3, 6],
    'aug':    [0, 4, 8],      '+':      [0, 4, 8],
    'sus2':   [0, 2, 7],
    'sus4':   [0, 5, 7],
    '7':      [0, 4, 7, 10],
    'maj7':   [0, 4, 7, 11],  'M7':     [0, 4, 7, 11],
    'min7':   [0, 3, 7, 10],  'm7':     [0, 3, 7, 10],
    'dim7':   [0, 3, 6, 9],   'o7':     [0, 3, 6, 9],
    'm7b5':   [0, 3, 6, 10],  'ø7':     [0, 3, 6, 10],  // half-dim
    'aug7':   [0, 4, 8, 10],  '+7':     [0, 4, 8, 10],
    '9':      [0, 4, 7, 10, 14],
    'maj9':   [0, 4, 7, 11, 14], 'M9':  [0, 4, 7, 11, 14],
    'min9':   [0, 3, 7, 10, 14], 'm9':  [0, 3, 7, 10, 14],
    '11':     [0, 4, 7, 10, 14, 17],
    'min11':  [0, 3, 7, 10, 14, 17], 'm11': [0, 3, 7, 10, 14, 17],
    '13':     [0, 4, 7, 10, 14, 21],
    'maj13':  [0, 4, 7, 11, 14, 21],
    '7#9':    [0, 4, 7, 10, 15],       // Hendrix chord
    '7b9':    [0, 4, 7, 10, 13],
    '7#5':    [0, 4, 8, 10],
    '7b5':    [0, 4, 6, 10],
    'add9':   [0, 4, 7, 14],
    '6':      [0, 4, 7, 9],
    'm6':     [0, 3, 7, 9],
    '69':     [0, 4, 7, 9, 14],
  }
  
  let i = 0, root = notes[symbol[i++]] ?? 0
  if (symbol[i] === '#') { root++; i++ }
  else if (symbol[i] === 'b') { root--; i++ }
  const quality = symbol.slice(i) || 'maj'
  const intervals = qualities[quality] || qualities['maj']
  const base = 12 * (octave + 1) + root
  return intervals.map(interval => base + interval)
}

// Usage examples:
Ch('Cmaj7')     // [60, 64, 67, 71] - C4 maj7
Ch('Dm7', 3)   // [50, 53, 57, 60] - D3 min7
Ch('F#m9')     // [66, 69, 73, 76, 80]
Ch('Bb7')      // [58, 62, 65, 68]
Ch('Ebmaj13')  // [51, 55, 58, 62, 65, 72]
Ch('G7#9')     // [55, 59, 62, 65, 70] - Hendrix chord
Ch('Am7b5')    // half-diminished
Ch('Bdim7')    // fully diminished
```

Build progressions cleanly:

```js
// ii-V-I in C
progression = [Ch('Dm7'), Ch('G7'), Ch('Cmaj7')]

// Gospel in Db
progression = [Ch('Dbmaj7'), Ch('Bbm7'), Ch('Ebm7'), Ch('Ab7')]

// Jazz turnaround
progression = [Ch('Cmaj7'), Ch('Am7'), Ch('Dm7'), Ch('G7')]

// Get root from chord symbol for bass
root = (symbol, octave = 2) => Ch(symbol, octave)[0]
```

For manual construction or custom voicings, use intervals:

```js
// Build from root + intervals
chord = (root, intervals) => intervals.map(i => root + i)

// Common intervals reference
maj7 = [0, 4, 7, 11]
min7 = [0, 3, 7, 10]
dom7 = [0, 4, 7, 10]
```

### Voice Leading Principles

**Minimize motion**: Voices should move by small intervals (steps or half-steps). Common tones between chords should stay in the same voice.

```js
// Smooth voice leading: Cmaj7 -> Fmaj7
// C stays, E->F, G->A, B->C (all move by step or stay)
chords = [Ch('Cmaj7', 3), Ch('Fmaj7', 3)]

// For custom voicings with better voice leading:
voicedChords = [
  [48, 52, 55, 59],  // Cmaj7: C E G B
  [48, 53, 57, 60],  // Fmaj7: C F A C (C is common tone)
]
```

**Avoid parallel fifths/octaves** in classical contexts; embrace them for power chords or specific effects.

### Functional Harmony

Use chord functions to create tension and resolution:

- **Tonic (I)**: Home, resolution, stability
- **Subdominant (IV, ii)**: Departure, mild tension  
- **Dominant (V, vii°)**: Strong tension, wants to resolve to I

Common progressions:

```js
// ii-V-I (jazz standard)
progression = [Ch('Dm7'), Ch('G7'), Ch('Cmaj7')]

// I-vi-IV-V (pop/rock)
progression = [Ch('C'), Ch('Am'), Ch('F'), Ch('G')]

// Coltrane changes
progression = [Ch('Cmaj7'), Ch('Eb7'), Ch('Abmaj7'), Ch('B7'), Ch('Emaj7'), Ch('G7')]

// Gospel in Db
progression = [Ch('Dbmaj7'), Ch('Bbm9'), Ch('Ebm7'), Ch('Ab13')]

// Funk: One-chord vamps with extensions
progression = [Ch('E9'), Ch('E9'), Ch('E9'), Ch('E9')]  // but vary rhythm/voicing

// Modal: Stay on one chord, explore scales
progression = [Ch('Dm7'), Ch('Dm7'), Ch('Dm7'), Ch('Dm7')]  // Dorian vamp
```

### Modal Thinking

For melodies and solos, think in modes relative to the chord:

```js
scales = {
  ionian:     [0, 2, 4, 5, 7, 9, 11],  // major
  dorian:     [0, 2, 3, 5, 7, 9, 10],  // minor with bright 6th
  phrygian:   [0, 1, 3, 5, 7, 8, 10],  // dark, Spanish
  lydian:     [0, 2, 4, 6, 7, 9, 11],  // major with #4, dreamy
  mixolydian: [0, 2, 4, 5, 7, 9, 10],  // dominant, bluesy
  aeolian:    [0, 2, 3, 5, 7, 8, 10],  // natural minor
  locrian:    [0, 1, 3, 5, 6, 8, 10],  // diminished feel
}

// Pentatonics for safer melodic choices
pentatonicMaj = [0, 2, 4, 7, 9]
pentatonicMin = [0, 3, 5, 7, 10]
blues = [0, 3, 5, 6, 7, 10]  // minor pentatonic + blue note
```

### Melody Principles

1. **Stepwise motion** with occasional leaps (steps = 1-2 semitones, leaps = 3+)
2. **Leap resolution**: Large intervals should resolve by step in opposite direction
3. **Chord tones on strong beats**: Land on chord tones (1, 3, 5, 7) on beats 1 and 3
4. **Passing tones on weak beats**: Scale tones between chord tones
5. **Neighbor tones**: Step away and back for ornamentation
6. **Tension/release**: Create arc - build tension, then resolve

```js
// Melodic contour: arch shape
// Start low, rise to climax around 2/3, fall to resolution
melodyContour = (bt, barInPhrase) => {
  progress = (barInPhrase * 16 + bt) / 128  // 0 to 1 over phrase
  return Math.sin(progress * Math.PI)        // peaks in middle
}
```

---

## RHYTHM

### Grid & Subdivision

Think in subdivisions of the bar:

```js
// bt % 4 === 0  -> quarter notes (1, 2, 3, 4)
// bt % 2 === 0  -> eighth notes
// bt % 1 === 0  -> sixteenth notes (every tick)
// bt % 8 === 0  -> half notes
// bt % 16 === 0 -> whole notes (downbeat)
```

### Rhythmic Patterns

**Kick patterns** (common placements):

```js
// Four on floor: [0, 4, 8, 12]
// Hip-hop/half-time: [0, 10] or [0, 6]
// Funk syncopated: [0, 3, 7, 10, 14]
// Breakbeat: [0, 10, 12] with variation
```

**Snare patterns**:

```js
// Backbeat: [4, 12] (beats 2 and 4)
// Half-time: [8] (beat 3 only)
// Funk ghost notes: soft hits on [2, 6, 10, 14]
```

**Hi-hat textures**:

```js
// 8ths: bt % 2 === 0
// 16ths: every tick
// Offbeat: bt % 2 === 1
// Complex: [0, 3, 6, 10, 13] (shifting accents)
```

### Swing & Groove

Swing delays offbeats. Apply via offset:

```js
swing = (bt, amount = 0.06) => (bt % 2 === 1) ? amount : 0
// Use: o: swing(bt) + slop()
```

**Humanization** is essential:

```js
// Timing slop (small random offset)
slop = () => (Math.random() - 0.5) * 0.015

// Velocity variation  
V = (base) => base * (0.85 + Math.random() * 0.3)

// Apply both
n.push({ p: K, v: V(0.8), o: swing(bt) + slop() })
```

### Polyrhythms

Layer rhythms that don't align with 4:

```js
// 3 against 4 (every 5.33 ticks in 16-tick bar)
if (Math.floor(t * 3 / 16) !== Math.floor((t - 1) * 3 / 16)) { ... }

// 5 against 4
poly5 = Math.floor(bt * 5 / 16) % 5
if (poly5 === 0) { ... }

// Dotted rhythms (every 6 sixteenths = dotted quarter)
if (bt % 6 === 0) { ... }
```

### Odd Time Signatures

Change BAR constant:

```js
BAR = 14   // 7/8 (seven 8th notes = 14 sixteenths)
BAR = 22   // 11/8
BAR = 12   // 6/8 or 3/4
BAR = 20   // 5/4
```

Design patterns around the meter:

```js
// 7/8 as 4+3 or 3+4
BAR = 14
// Kick on: [0, 8] (grouping: 1-and-2-and | 1-and-2)
// Snare on: [4, 10]
```

---

## DYNAMICS

### Velocity Architecture

Create shape through velocity:

```js
// Accent pattern (strong/weak)
accent = (bt) => (bt % 4 === 0) ? 0.9 : (bt % 2 === 0) ? 0.6 : 0.4

// Build over phrase
build = (bar, localBar) => 0.5 + (localBar / 8) * 0.3

// Wave/breath shape
wave = (bt) => 0.5 + Math.sin(bt * Math.PI / 8) * 0.3
```

### Section Dynamics

Use section plans with intensity curves:

```js
sections = [
  { name: 'intro',  hype: 0.3, drums: false, bass: true },
  { name: 'verse',  hype: 0.5, drums: true,  bass: true },
  { name: 'build',  hype: 0.7, drums: true,  bass: true },
  { name: 'drop',   hype: 1.0, drums: true,  bass: true },
  { name: 'break',  hype: 0.4, drums: false, bass: false },
]

cfg = sections[section % sections.length]
if (cfg.drums) { /* play drums */ }
```

### Fills & Transitions

Mark phrase boundaries:

```js
isFill = (localBar === 7 && bt >= 12)  // last bar of phrase, last beat

if (isFill) {
  // Tom cascade, snare roll, etc.
  fillNotes = [TH, TM, TL, TF]
  n.push({ p: fillNotes[bt - 12], v: 0.6 + (bt - 12) * 0.1 })
}

// Crash on section downbeats
if (bt === 0 && localBar === 0) {
  n.push({ p: CRASH, v: 0.9, d: 3.0 })
}
```

### Articulation

Control note character via duration and attack:

```js
// Staccato: short duration
{ p: 60, d: 0.05, a: 0.01 }

// Legato: long duration, soft attack  
{ p: 60, d: 0.8, a: 0.1 }

// Accent: high velocity, short attack
{ p: 60, v: 0.95, a: 0.005 }

// Ghost note: low velocity, medium duration
{ p: 60, v: 0.15, d: 0.1 }
```

---

## ARRANGEMENT PRINCIPLES

### Layering

Add instruments gradually:

```js
// Phrase 0: just bass
// Phrase 1: add drums
// Phrase 2: add keys
// Phrase 3: add melody
if (phrase >= 1) { /* drums */ }
if (phrase >= 2) { /* keys */ }
```

### Call & Response

Alternate between instruments or patterns:

```js
// Even bars: instrument A leads
// Odd bars: instrument B responds
if (bar % 2 === 0) { /* lead */ }
else { /* response */ }
```

### Space & Silence

Don't fill every tick. Use `R() > threshold` for probabilistic hits:

```js
// 60% chance to play ghost note
if (bt === 6 && R() > 0.4) {
  n.push({ p: SR, v: 0.2 })
}
```

### Breakdowns & Drops

Create contrast by removing elements:

```js
drop = (section === 2 && localBar < 2)
if (!drop) { /* play full groove */ }
else { /* sparse elements only */ }
```

---

## TIPS FOR INTERESTING MUSIC

1. **Constraints breed creativity**: Odd time signatures, limited note choices, specific rules
2. **Repetition with variation**: Same pattern but change one element each time
3. **Surprise on beat expectations**: Anticipations (early), delays (late), syncopation
4. **Tension/release cycles**: Build up, then release. Don't resolve too quickly.
5. **Timbre contrast**: Vary instruments, use samples vs synths
6. **Frequency spectrum balance**: Bass in low, leads in mid/high, percussion across
7. **Stereo field**: Use `x` parameter to place sounds left/right
8. **Reverb for depth**: Use `r` parameter for far/near placement
9. **Motivic development**: Take a short idea (motif) and transform it
10. **Listen to references**: Study grooves and progressions from real tracks

---

## FEEDBACK LOG

### 2026-01-06: Slider float handling
- Changed sliders to handle float values instead of just integers
- Updated HTML slider step to be dynamic: 0.1 for ranges > 10, 0.01 for smaller ranges
- Display shows 2 decimal places for floats, no decimals for integers
