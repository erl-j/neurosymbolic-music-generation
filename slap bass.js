// Live Coding Music Environment
// Returns array of note objects.
// t: tick (16th notes), s: time (seconds)
// p: pitch (MIDI), d: duration (sec), v: vol, x: pan (-1 to 1)
// o: offset (in ticks), start: sample position (0-1)
// id: exclusive id (only one note per id plays at a time)
// w: wave ('sine','sawtooth','square','drums' OR 'm:1')

const arange = (start, end) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

const rand = () => Math.random();

return (t, s) => {
    const n = [];

    // major scale across all octaves
    let majorNotes = [0, 2, 4, 5, 7, 9, 11];

    c = 0
    // simple arp
    // if (t % 16 % 5 % 3 === 0) {
    //     n.push({ w: 'serum:30', v: 5.0, d: 0.9, start: 0.05, r: 1.0, p: 12 * 5 + majorNotes[(c + (t * 2) % 16) % majorNotes.length] + Math.sin(s) * 0.1 });
    // }

    // play a chord progression. every 4th bar change the chord
    let chordProgression = [
        [0, 2, 4, 6],
        [0, 2, 5],
        [2, 4, 7],
        [2, 5, 9],
        [4, 6, 9],
        [4, 7, 11],
        [6, 8, 11],
        [6, 9, 13],
        [8, 10, 13],
        [8, 11, 15],
    ];

    chord = chordProgression[Math.floor(t / 8) % 8]
    // if (t % 8 === 0) {
    //     for (let i = 0; i < chord.length; i++) {
    //         n.push({
    //             w: 'serum:33', v: 5.0, d: 0.9, start: 0.00, r: 1.0, p: 12 * 5 + majorNotes[chord[i] % majorNotes.length] + Math.sin(s) * 0.1,
    //             o: i * 0.3
    //         });
    //     }
    // }

    // add bass line with chord tones
    if (t % 4 === 0) {
        n.push({
            w: 'bass:2', v: 11.0, d: 0.3, start: 0.00, r: 1.0, p: 12 * 4 + majorNotes[chord[0] % majorNotes.length] + Math.sin(s) * 0.1,
            o: 0.00
        });
    }
    if (t % 16 === 7 || t % 16 === 10) {
        n.push({
            w: 'bass:2', v: 10.0, d: 0.8, start: 0.00, r: 0.0, p: 12 * 5 + majorNotes[chord[0] % majorNotes.length] + Math.sin(s) * 0.1,
            o: 0.0
        });
    }

    // if (t % 2 === 0) {
    //     n.push({ w: 'serum:17', v: 5.0, d: 1.0, start: 0.0, r: 1.0, p: 12 * 5 + majorNotes[(t * 3) % 16 % 6] + Math.sin(s) * 0.1 });
    // }


    // if (t % 8 % 3 === 0) {
    //     n.push({ w: 'ahh:2', v: 2.0, d: 0.5, start: 0.5, r: 1.0, p: 12 * 3 + 12 });
    // }

    // if (t % 16 % 11 % 5 % 3 === 0) {
    //     // add sine bass
    //     n.push({ w: '808:33', v: 2.0, p: 12 * 8 - 9, d: 1.0 });
    // }

    // 4 on the floor
    if (t % 16 % 5 % 3 === 0) {
        n.push({ w: `hi-hat:${t % 8 % 3}`, v: 1.0, d: 0.8, r: 1.0 });
    }

    if (t % 4 === 0) {
        n.push({ w: `kick:${t % 2}`, v: 6.0, d: 0.8, r: 0.0 });
    }

    // if (t % 1 === 0) {
    //     n.push({
    //         w: 'crash:0', v: 1.0, d: 1.0, start: t % 16 / 16
    //     });
    // }

    // // DRUMS
    if (t % 8 === 4) {
        n.push({ w: 'snare:9', v: 10.9 });
    }

    // if (t % 16 % 4 === 0) {
    //     n.push({ p: 38, w: 'drums', v: 0.8, r: 1.0 });
    // }

    // if (t % 16 % 3 === 0) {
    //     // Swing the hi-hat slightly
    //     const isOff = t % 4 === 2;
    //     n.push({
    //         p: 42, w: 'drums', v: isOff ? 0.5 : 0.2,
    //         o: isOff ? 0.01 : 0 // Swing offset
    //     });
    // }


    return n;
};