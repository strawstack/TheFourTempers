(() => {

    // Init state
    const state = {};
    state.zoomLevel = 2;
    state.digitContainerPosition = {x: 0, y: 0};
    state.currentVelocity = {x: 0, y: 0};
    state.isKeyDown = { w: false, a: false, s: false, d: false, 1: false, 2: false, 3: false, 4: false, 5: false };
    state.zoom_lookup = [
        { cellSize: 40, fontSize: 0.75, range: [0.75, 3]},
        { cellSize: 55, fontSize: 1, range: [1, 4.25]},
        { cellSize: 70, fontSize: 1.25, range: [1.25, 5.25]},
        { cellSize: 85, fontSize: 1.5, range: [1.5, 6.5]},
        { cellSize: 100, fontSize: 1.75, range: [1.75, 6.75]}
    ];
    state.mouse = null; // global mouse (cached for when container moves, but mouse is static)
    state.magnification = {
        adjDigits: null,
        mouse: null
    };
    state.mouseDown = false;
    state.selected = null;
    state.sendBinAnimation = false;
    // Constants
    state.COLS = 64;
    state.ROWS = 20;
    state.TOP_BOT_HEIGHT = 115; // Note: Some of these could be auto-set in main from css variables
    state.DIVIDER_HEIGHT = 10;
    state.MID_HEIGHT = 500;
    state.BIN_GAP_INNER = 20;
    state.BIN_GAP_OUTER = 70;
    state.BIN_WIDTH = 156;
    state.CANVAS_WIDTH = 332;
    state.CANVAS_HEIGHT = 92;
    // Refs
    state.digitContainer = document.querySelector(".digit-container");
    state.allDigits = null; // lazy init in main
    state.canvasRef = document.querySelectorAll("canvas");
    state.ctxRef = Array.from(state.canvasRef).map(c => c.getContext("2d"));

    // Imports
    const { animate, animations } = animation();
    const { calculate } = calculateFrame(state, animations);
    const {
        sub,
        calcMagnification,
        selectDigit
    } = helper(state);
    const { toggleBin } = binToggle(state, animate, animations);

    // Helper
    function createDigit(key) {
        const n = Math.floor(Math.random() * 10);
        const d = document.createElement("div");
        d.className = "digit";
        d.dataset.key = key;
        d.innerHTML = n;
        return d;
    }

    function sendBinAnimation(activeBin) {
        // Start binAnimation (freeze inputs)
        state.sendBinAnimation = true;

        // Wipe specified state
        state.currentVelocity = {x: 0, y: 0};
        state.isKeyDown = { w: false, a: false, s: false, d: false };
        state.mouseDown = false;

        // Check correctness
        const correct = true;

        // Clone numbers
        const clones = [];
        for (let key in state.selected) {
            const digit = state.allDigits[key];
            const digitRect = digit.getBoundingClientRect();
            const containerRect = state.digitContainer.getBoundingClientRect();
            const { x: left, y: top } = sub(
                {x: digitRect.left, y: digitRect.top},
                {x: containerRect.left, y: containerRect.top}
            );
            const cloneDigit = digit.cloneNode(true);
            cloneDigit.style.position = 'absolute';
            cloneDigit.style.top = `${top}px`;
            cloneDigit.style.left = `${left}px`;
            state.digitContainer.appendChild(cloneDigit);
            clones.push(cloneDigit);
        }

        function floatFromPixels(pxs) {
            return parseFloat(pxs.slice(0, pxs.length - 2));
        }

        // Animate numbers
        const { cellSize } = state.zoom_lookup[state.zoomLevel];
        clones.forEach(clone => {
            animate(clone.dataset.key, {
                from: {
                    x: floatFromPixels(clone.style.left),
                    y: floatFromPixels(clone.style.top)
                },
                to: {
                    x: -1 * state.digitContainerPosition.x + state.BIN_GAP_OUTER + state.BIN_WIDTH/2 + (activeBin - 1) * (state.BIN_GAP_INNER + state.BIN_WIDTH) - cellSize/2,
                    y: -1 * state.digitContainerPosition.y + state.MID_HEIGHT + cellSize
                },
                action: ({x: left, y: top}) => { // modify state from animation value
                    clone.style.top = `${top}px`;
                    clone.style.left = `${left}px`;
                },
                interpolate: (from, to, percent) => { // interpolate between start and end values
                    const { x: fx, y: fy } = from;
                    const { x: tx, y: ty } = to;
                    const intervalX = tx - fx;
                    const intervalY = ty - fy;
                    return {
                        x: fx + Math.min(1, 1.3 * percent) * intervalX,
                        y: fy + percent * intervalY,
                    };
                },
                duration: 1500,
                done: () => {
                    state.sendBinAnimation = false; // after animation completes
                    state.selected = null;
                }
            });
        });

        // Replace numbers (if correct) or re-display existing numbers

    }

    function main() {

        Array(state.COLS * state.ROWS).fill(null).forEach((e, i) => {
            state.digitContainer.appendChild(
                createDigit(i)
            );
        });

        state.allDigits = document.querySelectorAll(".digit");

        // Align canvases
        state.canvasRef.forEach((canvas, i) => {
            canvas.height = state.CANVAS_HEIGHT;
            canvas.width = state.CANVAS_WIDTH;

            const binGapAndBorder = 7;
            const left = state.BIN_GAP_OUTER + i * (state.BIN_WIDTH + state.BIN_GAP_INNER) + state.BIN_WIDTH/2 - state.CANVAS_WIDTH/2;
            const top  = state.TOP_BOT_HEIGHT + 2 * state.DIVIDER_HEIGHT + state.MID_HEIGHT + binGapAndBorder - state.CANVAS_HEIGHT;
            canvas.style.left = `${left}px`;
            canvas.style.top  = `${top}px`;
        });

        window.addEventListener("keydown", e => {
            if (state.sendBinAnimation) return;

            const {key} = e;
            if (key === "ArrowUp") {
                if (state.mouseDown) return;
                state.zoomLevel += 1;
                state.zoomLevel = Math.min(4, state.zoomLevel);

            } else if (key === "ArrowDown") {
                if (state.mouseDown) return;
                state.zoomLevel -= 1;
                state.zoomLevel = Math.max(0, state.zoomLevel);

            } else if ("wasd".indexOf(key) !== -1) {
                state.isKeyDown[key] = true;

            } else if ("12345".indexOf(key) !== -1) {
                // Only one bin at a time
                if ("12345".split("").every(n => !state.isKeyDown[n])) {
                    state.isKeyDown[key] = true;
                    toggleBin(parseInt(key, 10), true);
                }

            } else if (key === "b") {
                if (state.selected === null) return;
                const activeBin = "12345".split("").find(n => state.isKeyDown[n]);
                if (activeBin === undefined) return;
                sendBinAnimation(parseInt(activeBin, 10));

            }
        });

        window.addEventListener("keyup", e => {
            if (state.sendBinAnimation) return;
            const {key} = e;
            if ("wasd".indexOf(key) !== -1) {
                state.isKeyDown[key] = false;

            } else if ("12345".indexOf(key) !== -1) {
                if (state.isKeyDown[key]) {
                    state.isKeyDown[key] = false;
                    toggleBin(parseInt(key, 10), false);
                }
            }
        });

        state.digitContainer.addEventListener("mousedown", e => {
            if (state.sendBinAnimation) return;
            state.mouseDown = true;
            selectDigit(state.mouse);
        });

        window.addEventListener("mouseup", e => {
            if (state.sendBinAnimation) return;
            state.mouseDown = false;
            state.selected = null;
        });

        state.digitContainer.addEventListener("mousemove", e => {
            if (state.sendBinAnimation) return;
            const { clientX, clientY } = e;
            state.mouse = { clientX, clientY };
            calcMagnification({ clientX, clientY });
            if (state.mouseDown) selectDigit(state.mouse);
        });

        window.requestAnimationFrame(calculate);
    }

    let once = false;
    document.fonts.onloadingdone = () => {
        if (!once) {
            once = true;
            main();
        }
    };

})();


