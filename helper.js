function helper(state, animate, animations) {

    function numberToCoord(n) {
        return {
            x: n % state.COLS,
            y: Math.floor(n / state.COLS)
        };
    }

    function coordToNumber({x, y}) {
        return y * state.COLS + x;
    }

    function sub(a, b) {
        return {
            x: a.x - b.x,
            y: a.y - b.y
        };
    }

    function mag(a) {
        return Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
    }

    function add(a, b) {
        return {
            x: a.x + b.x,
            y: a.y + b.y
        };
    }

    function mult(v, s) { // vector by scalar
        return {
            x: v.x * s,
            y: v.y * s,
        };
    }

    function getAdjecentDigits(allDigits, key) {
        const adj = [
            {x: -1, y: -1},
            {x: 0, y: -1},
            {x: 1, y: -1},

            {x: -1, y: 0},
            {x: 0, y: 0},
            {x: 1, y: 0},

            {x: -1, y: 1},
            {x: 0, y: 1},
            {x: 1, y: 1}
        ];
        const numberToCoord = n => {
            return {
                x: n % state.COLS,
                y: Math.floor(n / state.COLS)
            };
        };
        const bounds = ({x, y}, func) => {
            if (x < 0 || x >= state.COLS || y < 0 || y >= state.ROWS) return null;
            return func();
        };
        const coord = numberToCoord(key);
        return adj.map(a => {
            const tCoord = add(a, coord);
            return bounds(tCoord, () => allDigits[coordToNumber(tCoord)]);
        });
    }

    async function wait(ms, signal) {
        return new Promise((res, rej) => {

            if (signal !== undefined && signal.aborted) {
                return Promise.reject(new DOMException('Aborted', 'AbortError'));
            }

            const timeout = setTimeout(res, ms);
    
            // Listen for abort event on signal
            if (signal !== undefined) {
                signal.addEventListener('abort', () => {
                    window.clearTimeout(timeout);
                    rej(new DOMException('Aborted', 'AbortError'));
                });
            }
            
        });
    }

    function keyFromMouse({ x, y }) {
        const { cellSize } = state.zoom_lookup[state.zoomLevel];
        const xx = Math.floor(x / cellSize);
        const yy = Math.floor(y / cellSize);
        return coordToNumber({x: xx, y: yy});
    }

    function mouseRelativeToDigitContainer({ clientX, clientY }) {
        const { left, top } = state.digitContainer.getBoundingClientRect();
        return {
            x: clientX - left,
            y: clientY - top
        };
    }

    function calcMagnification({ clientX, clientY }) {
        state.magnification.mouse = mouseRelativeToDigitContainer({ clientX, clientY });
        const key = keyFromMouse(state.magnification.mouse);
        state.magnification.adjDigits = getAdjecentDigits(state.allDigits, key);
    }

    function selectDigit(mouse) {
        const key = keyFromMouse( mouseRelativeToDigitContainer(mouse) );
        if (state.selected === null) state.selected = {};
        state.selected[key] = true;

        // One main digit is selected, switch animation style of others in group
        if (key in state.mainDigits && Object.keys(state.selected).length === 1) {
            const { digits } = state.mainDigits[key];
            digits.forEach(({ref}) => {

                const { key } = ref.dataset;
                
                // Cancel animation and promise
                delete animations[`base_${key}`];
                if (`base_${key}` in state.controllers) {
                    state.controllers[`base_${key}`].abort();
                    delete state.controllers[`base_${key}`];
                };

                specialAnimationChain(key);
            });
        }
    }

    function randBetween(a, b) { // [a, b) exclusive
        return a + Math.floor(state.getRandom() * (b - a));
    }

    async function animationChain(key) {

        let signal = null;
        if (!(`base_${key}` in state.controllers)) {
            const controller = new AbortController();
            signal = controller.signal;
            state.controllers[`base_${key}`] = controller;
        
        } else {
            signal = state.controllers[`base_${key}`].signal;

        }

        // 50% chance to wait in place
        if (state.getRandom() < 0.5) {
            try {
                await wait( randBetween(5000, 8000), signal );
            } catch(e) { return; }
            
        }

        const oldPos = state.digitOffset[key];
        
        let newPos = {
            x: state.getRandom() * 2 - 1,
            y: state.getRandom() * 2 - 1
        };

        // 50% chance to return to center
        if (state.getRandom() < 0.5) newPos = {x: 0, y: 0};

        const delta = sub(newPos, oldPos);
        const duration = randBetween(3000, 7000);
        try {
            await animate(`base_${key}`, {
                from: oldPos, 
                to: newPos,
                action: pos => {
                    state.digitOffset[key] = pos;
                },
                interpolate: (from, to, percent) => {
                    const pos = add(
                        oldPos,
                        mult(delta, percent)
                    );
                    return pos;
                },
                duration
            }, signal);
        } catch(e) { return; }

        // Continue chain
        animationChain(key);
    }

    async function specialAnimationChain(key) {
        
        let signal = null;
        if (!(`base_${key}` in state.controllers)) {
            const controller = new AbortController();
            signal = controller.signal;
            state.controllers[`base_${key}`] = controller;

        } else {
            signal = state.controllers[`base_${key}`].signal;

        }

        // Chance to wait in place
        if (state.getRandom() < 0.7) {
            try {
                await wait( randBetween(10000, 12000), signal );
            } catch(e) { return; }
        }

        const move = async () => {

            const oldPos = state.digitOffset[key];
        
            // Always vist an extreme
            let newPos = {
                x: (state.getRandom() < 0.5) ? -1 : 1,
                y: (state.getRandom() < 0.5) ? -1 : 1
            };
    
            // Chance to return to center
            if (state.getRandom() < 0.2) newPos = {x: 0, y: 0};
    
            const delta = sub(newPos, oldPos);
            const duration = randBetween(1000, 1500); // Move relatively faster
    
            await animate(`base_${key}`, {
                from: oldPos, 
                to: newPos,
                action: pos => {
                    state.digitOffset[key] = pos;
                },
                interpolate: (from, to, percent) => {
                    const pos = add(
                        oldPos,
                        mult(delta, percent)
                    );
                    return pos;
                },
                duration
            }, signal);
        };

        // Move twice quickly
        try {
            await move();
            await move();
        } catch(e) { return; }

        // Continue chain
        specialAnimationChain(key);
    }

    function mostFreq(lst) {
        let count = Array(10).fill(0);
        lst.forEach(e => count[parseInt(e, 10)] += 1);
        count = count.map((c, i) => [c, i]);
        count.sort((a, b) => b[0] - a[0]);
        return count; // Ordered pairs [count, number]
    }

    function prepareForBin(index, bin) {

        if (index === 0) debugger;

        const counts = mostFreq(state.groups[index].digits.map(d => state.allSpans[d.ref.dataset.key].innerHTML));

        const existingBinCount = counts.reduce((a, c) => a + ((c[1] === bin) ? c[0] : 0), 0);

        // You need to total the highest frequency, and if second is tied then add one
        let needed = counts[0][0] - existingBinCount + ((counts.length > 1 && counts[0][0] === counts[1][0]) ? 1 : 0);
        
        for (let { ref } of state.groups[index].digits) {
            
            if (needed === 0) break;

            const span = state.allSpans[ref.dataset.key];
            const value = parseInt(span.innerHTML, 10);
            
            if (value !== bin) {
                span.innerHTML = bin;
                needed -= 1;
            }
        }

        // Mark with bin number as a hint
        state.groups[index].digits.forEach(d => {
            const { key } = d.ref.dataset;
            const span = state.allSpans[key];
            span.dataset.bin = bin;
        });
    }

    function assignBins() {
        
        const indexList = Array(state.groups.length).fill(0).map((e, i) => i);

        // Five times, take two random groups out, and assign to bin, for ten total
        Array(5).fill(null).forEach((e, b) => {
            const bin = b + 1;
            const length = indexList.length;
            const r1 = randBetween(0, length);
            const r2 = randBetween(0, length);
            const i1 = indexList.splice(r1 % length, 1)[0];
            const i2 = indexList.splice(r2 % (length - 1), 1)[0];

            prepareForBin(i1, bin);
            prepareForBin(i2, bin);
            
        });

        // Assign the last two groups to a bin
        prepareForBin(indexList[0], randBetween(1, 5 + 1));
        prepareForBin(indexList[1], randBetween(1, 5 + 1));

    }

    return {
        numberToCoord,
        coordToNumber,
        mag,
        sub,
        add,
        mult,
        calcMagnification,
        mouseRelativeToDigitContainer,
        selectDigit,
        wait,
        randBetween,
        animationChain,
        specialAnimationChain,
        assignBins
    };
}