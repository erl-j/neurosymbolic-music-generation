m = 2.5
sl = 0.01

slop = () => (Math.random() - 0.5) * sl

// GM drum pitches
KICK = 36
SNARE = 38
SNARE_RIM = 37
HH_CLOSED = 42
HH_OPEN = 46
HH_PEDAL = 44
RIDE = 51
RIDE_BELL = 53
CRASH = 49
TOM_LOW = 45
TOM_MID = 47
TOM_HIGH = 50
TOM_FLOOR = 41
TOM_FLOOR_LOW = 43

toms = [TOM_FLOOR_LOW, TOM_FLOOR, TOM_LOW, TOM_MID, TOM_HIGH, TOM_HIGH]

return (t, s) => {
    const n = []
    limbs = { lf: null, rf: null, lh: null, rh: null }
    bar = Math.floor(t / 24); part = Math.floor(t / 64) % 2; t %= 24
    snareFill = bar % 4 == 3 && t >= 20
    tomFill = bar % 8 == 7 && t >= 18

    k = '90000060804000009500005080400000'
    g = '00029010022950012902010203902050'

    if (tomFill) {
        ti = Math.floor((t - 18) / 1) % toms.length
        fv = .6 + (t - 18) * .06
        h = t % 2 ? 'rh' : 'lh'
        limbs[h] = { w: 'm:10', p: toms[ti], v: fv, d: 2.0, o: Math.random() * .015 * m + slop() }
        if (t == 23) limbs.rf = { w: 'm:10', p: KICK, v: .9, d: 1.0, o: slop() }
    } else if (snareFill) {
        h = t % 2 ? 'rh' : 'lh'
        sn = h == 'rh' ? SNARE : SNARE_RIM
        fv = .5 + (t - 20) * .12
        limbs[h] = { w: 'm:10', p: sn, v: fv, d: 1.5, o: Math.random() * .02 * m + slop() }
        if (t % 2 == 0) limbs.rf = { w: 'm:10', p: KICK, v: .6, d: 1.0, o: slop() }
    } else {
        if (k[t] > 0) limbs.rf = { w: 'm:10', p: KICK, v: k[t] / 9, d: 1.0, o: -.01 * m + slop() }
        if (g[t] > 0) limbs.lh = { w: 'm:10', p: SNARE, v: g[t] / 9, d: 2.0, r: 1.0, o: (.02 + Math.random() * .01) * m + slop() }
        rv = t % 2 ? .1 : .5; ro = (t % 2 ? .15 : 0) * m
        limbs.rh = { w: 'm:10', p: RIDE, v: rv, d: 1.0, o: ro + slop() }
        if (t % 2 == 1) limbs.lf = { w: 'm:10', p: HH_PEDAL, v: .3, d: 0.5, o: slop() }
    }

    return [...Object.values(limbs).filter(x => x), ...n]
}
