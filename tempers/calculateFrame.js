function calculateFrame(state, animate, animations) {

    const {
        numberToCoord,
        mag,
        sub,
        calcMagnification,
        selectDigit,
        padLeft
    } = helper(state, animate, animations);

    const SPEED = 5;
    const FRICTION = 0.9;
    const SMALL = 0.01;

    const MID_HEIGHT = 500;
    const SCREEN_WIDTH = 1000;

    const ORIG_FONT = "#8DF4FF";

    const dir = {
        UP: {x: 0, y: -1},
        RIGHT: {x: 1, y: 0},
        DOWN: {x: 0, y: 1},
        LEFT: {x: -1, y: 0}
    };

    const dir_lookup = {
        w: 'UP',
        d: 'RIGHT',
        s: 'DOWN',
        a: 'LEFT'
    };

    state.prevFontSize = null;
    function setZoom({ cellSize, fontSize }, COLS) {

        if (state.prevFontSize !== fontSize) {

            // digit font size
            document.body.style.setProperty("--digit-font-size", `${fontSize}rem`);

            // 64 in a row
            document.body.style.setProperty("--digit-container-size", `${COLS * cellSize}px`);

            // Cell size
            document.body.style.setProperty("--digit-cell-size", `${cellSize}px`);

            const { width: spanWidth, height: spanHeight } = state.allSpans[0].getBoundingClientRect();
            state.spanSize = {
                width: spanWidth, 
                height: spanHeight
            };
        }

    }

    function valueFromRange(range, percent, base) {
        if (percent <= 0) return base;
        const [lower, upper] = range;
        const size = upper - lower;
        return lower + percent * size;
    }

    function setFontSize(adjDigits) {

        state.adjDigitLookup = {};

        // Apply font size to adjecent cells
        if (adjDigits != null) {
            adjDigits.forEach(digit => {
                if (digit === null) return;

                const { key } = digit.dataset;

                // Digit's key to coord in digit container
                const { x, y } = numberToCoord(key);

                state.adjDigitLookup[key] = true;

                // Current cell size
                const { cellSize: SIZE, fontSize: base, range } = state.zoom_lookup[state.zoomLevel];

                // Global center point of cell
                const CENTER_POINT = {x: x * SIZE + SIZE/2, y: y * SIZE + SIZE/2};

                // Max distance possible from center
                const MAX_DISTANCE = 3 * SIZE/2; // mag({x: , y: 3 * SIZE/2});

                // Vec from center to global mouse
                const vec = sub(state.magnification.mouse, CENTER_POINT);

                // Magnitude of vector
                const length = mag(vec);

                // Mouse proximity to center
                const percent = 1 - (length / MAX_DISTANCE);

                const fontSize = valueFromRange(range, percent, base);

                digit.style.fontSize = `${fontSize}rem`;

            });
        }
    }

    function calcTempersPercents(req, cur) {
        const tReq = [0, 0, 0, 0];
        const tCur = [0, 0, 0, 0];
        const numberLookup = [0, 1, 2, 0, 0, 1, 3, 2, 3, 3];
        Object.keys(req).forEach(n => tReq[numberLookup[parseInt(n, 10)]] += req[n]);
        Object.keys(cur).forEach(n => tCur[numberLookup[parseInt(n, 10)]] += cur[n]);
        return tReq.map((r, i) => tCur[i] / r);
    }

    function render(timestamp) {

        state.digitContainer.style.top = `${state.digitContainerPosition.y}px`;
        state.digitContainer.style.left = `${state.digitContainerPosition.x}px`;

        setZoom(
            state.zoom_lookup[state.zoomLevel],
            state.COLS
        );
        
        // Remove inline font-size for 'selected'
        if (state.prevSelected !== null) {
            for (let key in state.prevSelected) {
                state.allDigits[key].style.removeProperty("font-size");
            }
        }

        state.prevSelected = {};
        for (let key in state.selected) {
            state.prevSelected[key] = state.selected[key];
        }
        
        // Remove inline font-size for 'previously adjecent digits'
        if (state.prevAdj !== null) {
            for (let key in state.prevAdj) {
                state.allDigits[key].style.removeProperty("font-size");
            }
        }

        if (state.magnification.adjDigits !== null) {
            state.prevAdj = {};
            for (let digit of state.magnification.adjDigits.filter(d => d !== null)) {
                const { key } = digit.dataset;
                state.prevAdj[key] = digit;
            }
        }

        // Magnification
        setFontSize(state.magnification.adjDigits);

        // Set FontSize for Selected digits
        const UPPER = 1;
        if (state.selected !== null) {
            for (let key in state.selected) {
                state.allDigits[key].style.fontSize = `${state.zoom_lookup[state.zoomLevel].range[UPPER]}rem`;
            }
        }

        // Hide numbers if bin animation in progress
        if (state.sendBinAnimation) {
            if (state.selected !== null) {
                for (let key in state.selected) {
                    state.allDigits[key].style.opacity = 0;
                }
            }
        }

        // Hide mouse during send bin animation
        if (state.sendBinAnimation) {
            state.screen.style.cursor = "none";
        } else {
            state.screen.style.removeProperty("cursor");
        }

        // Set dialogue height
        state.popupRef.forEach((popup, i) => {
            popup.style.top = `${state.popupHeight[i]}px`;
        });

        // DEBUG: Make groups RED for debugging
        if (state.groups !== null) {
            if (state.isKeirDown) {
                state.groups.forEach(group => {
                    group.digits.forEach(({ref}) => {
                        ref.style.color = 'lightsalmon';
                    });
                    group.digits[group.main].ref.style.color = 'gold';
                });
            } else {
                state.groups.forEach(group => {
                    group.digits.forEach(({ref}) => {
                        ref.style.color = ORIG_FONT;
                    });
                    group.digits[group.main].ref.style.color = ORIG_FONT;
                });
            }
        }

        // Apply digit offsets
        const { cellSize } = state.zoom_lookup[state.zoomLevel];
        state.allDigits.forEach(d => {

            const { key } = d.dataset;

            const span = state.allSpans[key];

            if (state.selected !== null && key in state.selected) {
                span.style.left = `0px`;
                span.style.right = `0px`;
                return;
            }

            const { x: leftPercent, y: topPercent } = state.digitOffset[key];

            if (state.spanSize !== null) {
                let { height, width } = state.spanSize;

                if (key in state.adjDigitLookup) { // Only call expensive function for adjDigits
                    let bound = span.getBoundingClientRect();
                    height = bound.height;
                    width = bound.width;
                }
            
                const vSpace = (cellSize - height) / 2;
                const hSpace = (cellSize - width) / 2;
    
                const leftDelta = hSpace * leftPercent;
                const topDelta = vSpace * topPercent;
                
                span.style.left = `${leftDelta}px`;
                span.style.top = `${topDelta}px`;
            }
        });

        // Adjust UI to reflect stats
        let completion = 0; // max five
        state.stats[state.FILENAME]["bins"].forEach(({req, cur}, binIndex) => {
            const binCompletion = Object.values(cur).reduce((a, c) => a + c) / Object.values(req).reduce((a, c) => a + c);
            completion += binCompletion;
            state.binFills[binIndex].style.width = `${150 * binCompletion}px`;
            state.binPercent[binIndex].innerHTML = `${Math.floor(binCompletion * 100)}%`;
            const tempers = calcTempersPercents(req, cur);
            const startIndex = binIndex * 4;
            for (let i = startIndex; i < startIndex + 4; i++) {
                state.temperFills[i].style.width = `${94 * tempers[i - startIndex]}px`;
            }
        });

        // Global file completion bars
        const completionPercent = completion / 5;
        const showLimit = Math.floor(state.bars * completionPercent);
        state.barsRef.forEach((e, i) => {
            e.style.display = (i <= showLimit) ? 'inline-block' : 'none';
        });
        state.fileComplete.innerHTML = `${Math.floor(completionPercent * 100)}% Complete`;

        // Process animations
        for (let key in animations) {
            const { from, to, action, interpolate, duration, start, resolve } = animations[key];
            const elapsed = document.timeline.currentTime - start;
            if (elapsed >= duration) {
                action(to);
                resolve();
                delete animations[key];
            } else {
                const percent = elapsed / duration;
                action( interpolate(from, to, percent) );
            }
        }

        // Update file location
        const {x, y} = state.digitContainerPosition;
        const { x: px, y: py } = state.locationPrefix;
        state.location.innerHTML = `0x${px}${padLeft(Math.floor(Math.abs(x)).toString(16).toUpperCase(), "0", 3)} : 0x${py}${padLeft(Math.floor(Math.abs(y)).toString(16).toUpperCase(), "0", 3)}`;

    }

    function calculate(timestamp) {

        // Set Velocity
        for (let key of "wasd") {
            const isDown = state.isKeyDown[key];
            if (isDown) {
                const {x, y} = dir[dir_lookup[key]];
                state.currentVelocity.x = -1 * x * SPEED;
                state.currentVelocity.y = -1 * y * SPEED;
                break;
            }
        }

        // Apply friction
        state.currentVelocity.x *= FRICTION;
        state.currentVelocity.y *= FRICTION;
        if (Math.abs(state.currentVelocity.x) <= SMALL) state.currentVelocity.x = 0;
        if (Math.abs(state.currentVelocity.y) <= SMALL) state.currentVelocity.y = 0;

        const savePosition = {...state.digitContainerPosition};

        // Track offset
        state.digitContainerPosition.x += state.currentVelocity.x;
        state.digitContainerPosition.y += state.currentVelocity.y;

        // Bounds
        const { cellSize } = state.zoom_lookup[state.zoomLevel];
        state.digitContainerPosition.x = Math.min(0, state.digitContainerPosition.x);
        state.digitContainerPosition.y = Math.min(0, state.digitContainerPosition.y);
        state.digitContainerPosition.x = Math.max(-1 * state.COLS * cellSize + SCREEN_WIDTH, state.digitContainerPosition.x);
        state.digitContainerPosition.y = Math.max(-1 * state.ROWS * cellSize + MID_HEIGHT, state.digitContainerPosition.y);

        // Possibly Trigger mouse position update
        if (
            state.mouse !== null &&
            mag(sub(savePosition, state.digitContainerPosition)) >= SMALL
        ) {
            calcMagnification(state.mouse);
            if (state.mouseDown) selectDigit(state.mouse);
        }

        render(timestamp);
        window.requestAnimationFrame(calculate);
    }

    return {
        calculate
    };
}
