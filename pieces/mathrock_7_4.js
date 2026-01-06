// Mathrock 7/4 Drum Beat - Complex tom fills, syncopated rhythms

sl = 0.015
slop = () => (Math.random() - 0.5) * sl
R = () => Math.random()

// GM drums
K = 36, S = 38, SR = 37, HHC = 42, HHO = 46, HHP = 44
RIDE = 51, BELL = 53, CRASH = 49, SPLASH = 55
TF = 43, TL = 45, TM = 47, TH = 50

drums = 'm:1'

// 7/4 = 14 eighth-note subdivisions per bar
BAR = 14

// Humanize velocities
V = (base) => base * (0.85 + R() * 0.3)

// Tom fill patterns - mathrock style
tomFills = [
    // Fill 1: Descending cascade
    [TH, TM, TL, TF, TL, TM],
    // Fill 2: Alternating high-low
    [TH, TF, TM, TL, TH, TF],
    // Fill 3: Syncopated bursts
    [TM, TH, TF, TM, TL, TF],
    // Fill 4: Chromatic-like
    [TF, TL, TM, TH, TM, TL],
    // Fill 5: Polyrhythmic feel
    [TH, TM, TH, TL, TM, TL]
]

// Hi-hat patterns - complex subdivisions
hatPatterns = [
    [0, 2, 4, 6, 8, 10, 12],     // Straight eighths
    [0, 3, 6, 9, 12],             // Triplet feel
    [0, 2, 5, 7, 9, 11, 13],     // Syncopated
    [0, 1, 4, 6, 8, 10, 12],     // Dense start
    [0, 3, 4, 7, 9, 11, 13]      // Mixed groupings
]

return (t, s) => {
    n = []

    bar = Math.floor(t / BAR)
    bt = t % BAR
    phrase = Math.floor(bar / 8)
    localBar = bar % 8

    // Fill every 4 bars (bars 3, 7, 11, etc.)
    isFill = localBar === 3 && bt >= 8

    h = slop()

    // === MAIN GROOVE ===
    if (!isFill) {
        // Hi-hat - cycling through complex patterns
        hatPattern = hatPatterns[phrase % hatPatterns.length]
        if (hatPattern.includes(bt)) {
            open = (bt === 0 || bt === 6 || bt === 12)
            accent = (bt === 0 || bt === 8)
            n.push({ w: drums, p: open ? HHO : HHC,
                    v: V(accent ? 0.6 : 0.25), d: open ? 0.8 : 0.3, o: h })
        }

        // Hi-hat foot - sporadic, on off-beats
        if ((bt % 4 === 2 || bt === 7) && R() > 0.4) {
            n.push({ w: drums, p: HHP, v: V(0.3), d: 0.25, o: h })
        }

        // Kick - syncopated, displaced from downbeats
        kickHits = [0, 5, 9, 12]
        if (kickHits.includes(bt)) {
            n.push({ w: drums, p: K, v: V(0.75 + R() * 0.15),
                    d: bt === 0 ? 0.8 : 0.6, o: h })
        }

        // Snare - cross-stick and rimshots, off-grid
        snareHits = [4, 7, 11, 13]
        if (snareHits.includes(bt)) {
            isRim = (bt === 7 || bt === 13)
            n.push({ w: drums, p: isRim ? SR : S,
                    v: V(isRim ? 0.65 : 0.7 + R() * 0.2),
                    d: isRim ? 0.25 : 0.5, o: h })
        }

        // Ghost notes - subtle, syncopated
        ghostBeats = [1, 3, 6, 8, 10]
        if (ghostBeats.includes(bt) && R() > 0.6) {
            n.push({ w: drums, p: SR, v: V(0.15 + R() * 0.1),
                    d: 0.2, o: h })
        }

        // Ride - sparse, melodic accents
        rideBeats = [2, 6, 10]
        if (rideBeats.includes(bt) && R() > 0.3) {
            bell = (bt === 6)
            n.push({ w: drums, p: bell ? BELL : RIDE,
                    v: V(bell ? 0.5 : 0.35), d: 1.2, o: h })
        }

        // Tom accents - occasional melodic hits
        tomAccents = [3, 8]
        if (tomAccents.includes(bt) && R() > 0.7) {
            toms = [TH, TM, TL, TF]
            tom = toms[Math.floor(R() * toms.length)]
            n.push({ w: drums, p: tom, v: V(0.4 + R() * 0.2),
                    d: 0.8, o: h })
        }
    }

    // === TOM FILLS - Complex, mathrock style ===
    if (isFill) {
        fillType = phrase % tomFills.length
        fillPattern = tomFills[fillType]

        // Build intensity through the fill
        fillBeat = bt - 8  // 0-5 for 6-note fills
        if (fillBeat >= 0 && fillBeat < fillPattern.length) {
            tomPitch = fillPattern[fillBeat]

            // Velocity builds then drops
            intensity = fillBeat < 3 ? (fillBeat + 1) * 0.15 : (6 - fillBeat) * 0.12
            velocity = V(0.45 + intensity + R() * 0.2)

            // Duration varies for rhythmic interest
            duration = fillBeat % 2 === 0 ? 0.6 : 0.4

            // Slight timing variations for groove
            offset = h + (R() - 0.5) * 0.008

            n.push({ w: drums, p: tomPitch, v: velocity,
                    d: duration, o: offset })

            // Add snare/rimshot punctuations in some fills
            if (fillType === 2 && (fillBeat === 2 || fillBeat === 5)) {
                n.push({ w: drums, p: SR, v: V(0.5), d: 0.3, o: h + 0.01 })
            }
        }

        // Crash on fill entry
        if (bt === 8) {
            n.push({ w: drums, p: CRASH, v: V(0.8), d: 2.0, o: h })
        }

        // Kick punctuations during fill
        if ((bt === 10 || bt === 12) && R() > 0.3) {
            n.push({ w: drums, p: K, v: V(0.6), d: 0.5, o: h })
        }
    }

    // === SECTION CRASHES ===
    // Big crash every 8 bars
    if (bt === 0 && bar > 0 && bar % 8 === 0) {
        n.push({ w: drums, p: CRASH, v: V(0.9), d: 3.0, o: h })
    }

    // Splash accents occasionally
    if (bt === 0 && localBar === 0 && phrase > 0 && R() > 0.7) {
        n.push({ w: drums, p: SPLASH, v: V(0.4), d: 1.5, o: h })
    }

    return n
}



