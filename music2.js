m = 2.5
sl = 0.01

slop = () => (Math.random() - 0.5) * sl

return (t, s) => {
    const n = []
    limbs = { lf: null, rf: null, lh: null, rh: null }
    bar = Math.floor(t / 24); part = Math.floor(t / 64) % 2; t %= 24
    snareFill = bar % 4 == 3 && t >= 20
    tomFill = bar % 8 == 7 && t >= 18

    k = '90000060804000009500005080400000'
    g = '00029010022950012902010203902050'
    toms = ['tom:0', 'tom:3', 'tom:6', 'tom:9', 'tom:12', 'tom:15']

    if (tomFill) {
        ti = Math.floor((t - 18) / 1) % toms.length
        fv = .6 + (t - 18) * .06
        h = t % 2 ? 'rh' : 'lh'
        limbs[h] = { w: `acoustic & ${toms[ti]}`, v: fv, d: 2.0, o: Math.random() * .015 * m + slop() }
        if (t == 23) limbs.rf = { w: 'acoustic & kick:2', v: .9, d: 1.0, o: slop() }
    } else if (snareFill) {
        h = t % 2 ? 'rh' : 'lh'
        sn = h == 'rh' ? 'snare:3' : 'snare:9'
        fv = .5 + (t - 20) * .12
        limbs[h] = { w: `acoustic & ${sn}`, v: fv, d: 1.5, o: Math.random() * .02 * m + slop() }
        if (t % 2 == 0) limbs.rf = { w: 'acoustic & kick:2', v: .6, d: 1.0, o: slop() }
    } else {
        if (k[t] > 0) limbs.rf = { w: 'acoustic & kick:2', v: k[t] / 9, d: 1.0, o: -.01 * m + slop() }
        if (g[t] > 0) limbs.lh = { w: 'acoustic & snare:5', v: g[t] / 9, d: 2.0, r: 1.0, o: (.02 + Math.random() * .01) * m + slop() }
        rv = t % 2 ? .1 : .5; ro = (t % 2 ? .15 : 0) * m
        limbs.rh = { w: `ride:${20}`, v: rv, d: 1.0, o: ro + slop() }
        if (t % 2 == 1) limbs.lf = { w: 'acoustic & hihat:0', v: .3, d: 0.5, o: slop() }
    }

    // add one midi note
    if (t % 2 == 0) {
        n.push({ w: 'm:10', v: 1.0, d: 1.0, p: 40 + Math.floor(Math.random() * 12), o: slop() })
    }

    return [...Object.values(limbs).filter(x => x), ...n]


}
