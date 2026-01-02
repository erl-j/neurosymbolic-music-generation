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

    // // DRUMS
    if (t % 2 == 0) {
        n.push({ w: `block || hat:${t % 32 % 14}`, v: 1.0 });
    }

    start = 0.5

    // if (t % 2 == 1) {
    //     n.push({ w: `acoustic & tom:${t % 32 % 7}`, v: t % 2 == 0 ? 3.0 : 1.5, d: 2.0, x: -1, start: start });
    // }

    // if (t % 2 == 0) {
    //     n.push({ w: `acoustic & tom:${t % 32 % 6}`, v: t % 2 == 0 ? 4.0 : 2.0, d: 2.0, x: 1, start: start });
    // }

    p = 42

    if (t % 16 % 2 == 0) {
        n.push({ w: `water:${t % 3}`, v: t % 2 == 0 ? 4.0 : 2.0, d: 1.2, x: 0, r: 0.0, start: start, p: p });
    }

    if (t % 32 % 4 == 0) {
        n.push({ w: `scratch:${t % 32 % 5}`, v: t % 2 == 0 ? 4.0 : 2.0, d: 0.1, x: 0, r: 0.0, start: start, p: p });
    }

    if (t % 32 % 5 % 3 == 0) {
        n.push({ w: `grain:${t % 32 % 5}`, v: t % 2 == 0 ? 4.0 : 2.0, d: 1.2, x: 0, r: 0.0, start: start, p: p });
    }


    if (t % 2 == 0) {
        n.push({ w: `taiko:${t % 32 % 6}`, v: t % 2 == 0 ? 4.0 : 2.0, d: 2.0, x: 0, p: 36, start: start });
    }

    if (t % 2 == 0) {
        n.push({ w: `tabla:${t % 32 % 6}`, v: t % 2 == 0 ? 4.0 : 2.0, d: 2.0, x: Math.sin(s), start: start });
    }


    const fmaj = [41, 48, 53, 55];    // F major chord
    const gmaj = [43, 50, 55, 52];    // G major chord
    const amin = [45, 52, 57, 60];    // A minor chord
    const gmaj2 = [43, 50, 55, 52];    // G major chord

    let chord;
    switch (Math.floor(t / 16) % 4) {
        case 0:
            chord = fmaj;
            break;
        case 1:
            chord = gmaj;
            break;
        case 2:
            chord = amin;
            break;
        case 3:
            chord = gmaj2;
            break;
    }

    p = chord[(t * 12) % chord.length];

    pattern = [0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];

    // add taiko to pattern
    if (pattern[t % pattern.length]) {
        n.push({ w: `kick:${5}`, v: 1.5, d: 2.0, x: 0 });
    }

    // Add microtiming variation to tabla start timing
    if (!(t % 1)) {
        // small random offset for microtiming swing (between -0.025 and 0.025)
        let micro = (Math.random() - 0.5) * 0.05;
        n.push({
            w: `tabla:${t % 16 % 7}`,
            v: 2.8,
            // d: t % 2 == 0 ? 0.8 : 0.5,
            x: 0,
            start: (typeof start !== 'undefined' ? start : 0) + micro
        });
    }

    start = [0.0, 0.7, 0.4, 0.1, 0.8, 0.5, 0.2, 0.9, 0.6, 0.3, 0.0, 0.7, 0.4, 0.1, 0.8, 0.5];
    start = start[t % start.length] * 0.3
    duration = 0.2
    // start = 0.1
    // add sine arp
    if (pattern[t % pattern.length] == 1) {
        // add 3 sines with random x and detune and attack 
        voices = 2
        for (let i = 0; i < voices; i++) {
            // adjust volume based on voice index, account for phase and such
            volume = 2.0 / voices
            off = 13.0

            sound = `pan & flute:${10}`
            // sound = `sawtooth`

            n.push({
                w: sound, v: volume + 1.0, d: duration, x: Math.random() * 2 - 1, r: (Math.random()) ^ 2 + 0.0, start: start,
                p: off + chord[(i + t * 2 % 8) % chord.length] + (Math.random() - 0.5) * 0.2,
                o: i * 0.05,
                a: Math.random() * 0.0 + 0.0,
                id: { i: i }
            });

            n.push({
                w: sound, v: volume + 1.0, d: duration, x: Math.random() * 2 - 1, r: (Math.random()) ^ 2 + 0.0, start: start,
                p: -12 + off + chord[i % chord.length] + (Math.random() - 0.5) * 0.2,
                o: i * 0.02,
                a: Math.random() * 0.0 + 0.0,
            });

            n.push({
                w: sound, v: volume + 1.0, d: duration, x: Math.random() * 2 - 1, r: (Math.random()) ^ 2 + 0.0, start: start,
                p: -24 + off + chord[0] + (Math.random() - 0.5) * 0.2,
                o: i * 0.01,
                a: Math.random() * 0.0 + 0.0,
            });

            // n.push({
            //     w: "sine", v: 2.0, d: 3.0, x: Math.random() * 2 - 1, r: (Math.random()) ^ 2 + 0.0, start: start,
            //     p: -24 + off + chord[0] + (Math.random() - 0.5) * 0.2,
            //     o: i * 0.01,
            //     a: Math.random() * 0.0 + 0.0,
            // });
        }
    }

    majorScale = [0, 3, 5, 7, 10, 12, 15, 17];

    // // sound = "flute:10"
    if (!((t + 0) % 7 % 4 % 2)) {
        n.push({ w: sound, c: 200, v: 1.0, d: duration * 0.5, x: t % 2 == 0 ? -1 : 1, p: 45 - 12 + off + majorScale[Math.floor(t * 2) % majorScale.length], start: start, id: t % 4 });
    }
    // crash in half time

    if (t % 32 % 3 == 0) {
        n.push({ w: `hat:${t % 16}`, v: t % 2 == 0 ? 1.0 : 0.5, d: 0.01 });
    }

    if ((t / 2) % 4 == 2) {
        n.push({ w: `clap:${1}`, v: 1.0, d: 0.8, r: (t % 32 > 20) ? 5.0 : 0.0 });
    }

    // add some syncopated rim shots
    if (t % 16 % 3 == 0) {
        n.push({ w: `rim:${t % 7}`, v: 2.0, d: 0.8 });
    }

    return n;
};