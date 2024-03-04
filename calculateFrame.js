function calculateFrame(state, animate, animations) {

    const {
        numberToCoord,
        mag,
        sub,
        calcMagnification,
        selectDigit
    } = helper(state, animate, animations);

    const SPEED = 5;
    const FRICTION = 0.9;
    const SMALL = 0.01;

    const MID_HEIGHT = 500;
    const SCREEN_WIDTH = 1000;

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

    function setZoom({ cellSize, fontSize }, COLS) {

        // digit font size
        document.body.style.setProperty("--digit-font-size", `${fontSize}rem`);

        // 64 in a row
        document.body.style.setProperty("--digit-container-size", `${COLS * cellSize}px`);

        // Cell size
        document.body.style.setProperty("--digit-cell-size", `${cellSize}px`);
    }

    function valueFromRange(range, percent, base) {
        if (percent <= 0) return base;
        const [lower, upper] = range;
        const size = upper - lower;
        return lower + percent * size;
    }

    function setFontSize(adjDigits) {

        // Apply font size to adjecent cells
        if (adjDigits != null) {
            adjDigits.forEach(digit => {
                if (digit === null) return;

                // Digit's key to coord in digit container
                const { x, y } = numberToCoord(digit.dataset.key);

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

        // Reset inline zoom for all digits
        state.allDigits.forEach(e => e.style.removeProperty("font-size"));

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
            state.groups.forEach(group => {
                group.digits.forEach(({ref}) => {
                    ref.style.color = 'lightsalmon';
                });
                group.digits[group.main].ref.style.color = 'gold';
            });
        }

        // Apply digit offsets
        const { cellSize } = state.zoom_lookup[state.zoomLevel];
        state.allDigits.forEach(d => {
            const { key } = d.dataset;

            const span = state.allSpans[key];

            const { x: leftPercent, y: topPercent } = state.digitOffset[key];

            const { height, width } = span.getBoundingClientRect();
            
            const vSpace = (cellSize - height) / 2;
            const hSpace = (cellSize - width) / 2;

            const leftDelta = hSpace * leftPercent;
            const topDelta = vSpace * topPercent;
            
            span.style.left = `${leftDelta}px`;
            span.style.top = `${topDelta}px`;
        });

        // Adjust UI to reflect stats
        state.stats[state.FILENAME]["bins"].forEach(({req, cur}, binIndex) => {
            const binCompletion = Object.values(cur).reduce((a, c) => a + c) / Object.values(req).reduce((a, c) => a + c);
            state.binFills[binIndex].style.width = `${150 * binCompletion}px`;
            state.binPercent[binIndex].innerHTML = `${Math.floor(binCompletion * 100)}%`;
            const tempers = calcTempersPercents(req, cur);
            const startIndex = binIndex * 4;
            for (let i = startIndex; i < startIndex + 4; i++) {
                state.temperFills[i].style.width = `${94 * tempers[i - startIndex]}px`;
            }
        });

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
