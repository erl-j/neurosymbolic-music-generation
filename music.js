
return (t, s) => {
    n = []
    bar = Math.floor(t / 16)
    bt = t % 16

    // @slider octave 0.01 0 1
    octave = 0.01

    // @slider speed 0.04 0 1
    speed = 0.04

    // @slider reverb 1 0 1
    reverb = 1

    // @slider delay_mix 1 0 1
    delay_mix = 1

    // @slider delay_time 8 0.5 8
    delay_time = 8

    // @slider filter_base 2000 200 2000
    filter_base = 2000

    // @slider pan_width 0.94 0 1
    pan_width = 0.94

    // @slider bass_drone 0.8 0 0.8
    bass_drone = 0.8

    // @slider note_duration 4 0.1 4
    note_duration = 4

    // @slider cutoff_sweep 105.9 100 1800
    cutoff_sweep = 105.9

    // @slider chorus_depth 1 0 1
    chorus_depth = 1

    // @slider detune_amount 0.3 0 0.3
    detune_amount = 0.3

    // Japanese in scale (pentatonic minor with b2)
    // 0=root, 1=b2, 5=4th, 7=5th, 8=b6
    inScale = [0, 1, 5, 7, 8]

    // Root note
    root = 57  // A3

    // Octave controls range (0-2 octaves up)
    octaveShift = Math.floor(octave * 3) * 12

    // Speed controls pattern density
    arpSpeed = 1 + Math.floor(speed * 3)  // 1, 2, 3, or 4

    // Hall reverb for moody atmosphere
    n.push({ effect: 'hall', type: 'reverb', decay: 120.0, wet: reverb, life: 128 })

    // Ping pong delay for rainbow effect
    n.push({ effect: 'pingpong', type: 'pingpong', delayTime: delay_time, feedback: 0.75, wet: delay_mix, life: 128 })

    // Chorus for supersaw thickness
    n.push({ effect: 'chorus', type: 'chorus', frequency: 1.5, depth: chorus_depth, wet: 0.5, life: 128 })

    // Distortion for warmth
    n.push({ effect: 'warmth', type: 'distortion', distortion: 0.15, wet: 0.3, life: 128 })

    // Rainbow arp pattern - cycles through scale with shifting colors
    if (t % arpSpeed === 0) {
        // Pattern index shifts through the scale
        patternIdx = Math.floor(t / arpSpeed) % (inScale.length * 2)

        // Create ascending/descending rainbow pattern
        scaleIdx = patternIdx < inScale.length ? patternIdx : (inScale.length * 2 - patternIdx - 1)

        // Calculate pitch with octave from slider
        pitch = root + octaveShift + inScale[scaleIdx] + Math.floor(patternIdx / inScale.length) * 12

        // Velocity influenced by pattern position (creates wave)
        velocity = 0.4 + Math.sin(patternIdx * Math.PI / inScale.length) * 0.3

        // Pan creates stereo rainbow effect
        pan = Math.sin(patternIdx * Math.PI / 3) * pan_width

        // Dynamic cutoff based on pattern position and slider
        cutoff = filter_base + Math.sin(patternIdx * Math.PI / 2) * cutoff_sweep

        // Supersaw - layer multiple detuned sawtooths
        detuneValues = [-0.20, -0.10, 0, 0.10, 0.20]

        detuneValues.forEach((detune, i) => {
            // Calculate detuned pitch (detune in semitones)
            detunedPitch = pitch + (detune * detune_amount * 2)

            // Slight volume variation for each voice
            voiceVol = velocity * (0.18 + i * 0.02)

            // Slight pan spread for width
            voicePan = pan + (detune * 0.3)

            n.push({
                p: detunedPitch,
                d: note_duration,
                w: 'piano:3',
                v: voiceVol,
                x: voicePan,
                c: cutoff,
                a: 0.015,
                sends: {
                    "chorus": 0.8,
                    "pingpong": 0.6,
                    "hall": 0.5,
                    "warmth": 0.4
                },
            })
        })
    }

    // Bass drone every 4 bars for atmosphere
    if (bt === 0 && bar % 4 === 0) {
        n.push({
            p: root - 12,
            d: 3.0,
            w: 'sine',
            v: bass_drone,
            x: 0,
            c: 300,
            sends: { "hall": 0.9, "warmth": 0.2 }
        })
    }

    // Sub bass pulse for weight
    if (bt % 4 === 0 && bass_drone > 0.1) {
        n.push({
            p: root - 24,
            d: 0.5,
            w: 'sine',
            v: bass_drone * 0.8,
            x: 0,
            a: 0.005,
            sends: { "warmth": 0.3 }
        })
    }

    return n
}
