(() => {

    // Init state
    const state = {};
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
    state.POPUP_WIDTH = 156;
    state.POPUP_HEIGHT = 254;
    state.BIN_GAP_AND_BORDER = 7;
    // Calcualted Constants
    state.POPUP_TOP_OFFSET = state.TOP_BOT_HEIGHT + 2 * state.DIVIDER_HEIGHT + state.MID_HEIGHT + state.BIN_GAP_AND_BORDER - state.POPUP_HEIGHT;
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
    state.sendBinKeyState = true; // State of active bin key during opening animation
    state.popupHeight = [
        state.POPUP_TOP_OFFSET + state.POPUP_HEIGHT, // popups start in the down position 
        state.POPUP_TOP_OFFSET + state.POPUP_HEIGHT,
        state.POPUP_TOP_OFFSET + state.POPUP_HEIGHT,
        state.POPUP_TOP_OFFSET + state.POPUP_HEIGHT,
        state.POPUP_TOP_OFFSET + state.POPUP_HEIGHT
    ];

    // Refs
    state.screen = document.querySelector(".screen");
    state.digitContainer = document.querySelector(".digit-container");
    state.allDigits = null; // lazy init in main
    state.popupRef = document.querySelectorAll(".popup");
    state.canvasRef = document.querySelectorAll("canvas");
    state.ctxRef = Array.from(state.canvasRef).map(c => c.getContext("2d"));

    // Imports
    const { animate, animations } = animation();
    const { calculate } = calculateFrame(state, animations);
    const {
        sub,
        mag,
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

    async function wait(ms) {
        return new Promise((res, rej) => {
            setTimeout(res, ms);
        });
    }

    async function sendBinAnimation(activeBin) {

        const activeBinNumber = parseInt(activeBin, 10); 

        // Start binAnimation (freeze inputs)
        state.sendBinAnimation = true;

        // Save selected digits to re-show later
        const selectedDigits = Object.keys(state.selected).map(k => state.allDigits[k]);

        // Wipe specified state
        state.mouseDown = false;
        state.currentVelocity = {x: 0, y: 0};
        "wasd".split("").forEach(c => state.isKeyDown[c] = false);
        
        // Check correctness
        const isCorrect = () => {
            // TODO - debug correctness implementation
            return true;
        };
        const correct = isCorrect();

        // Clone numbers
        const clones = [];
        for (let digit of selectedDigits) {
            const digitRect = digit.getBoundingClientRect();
            const screenRect = state.screen.getBoundingClientRect();
            const { x: left, y: top } = sub(
                {x: digitRect.left, y: digitRect.top},
                {x: screenRect.left, y: screenRect.top}
            );
            const cloneDigit = digit.cloneNode(true);
            cloneDigit.style.position = 'absolute';
            cloneDigit.style.top = `${top}px`;
            cloneDigit.style.left = `${left}px`;
            cloneDigit.style.zIndex = `5`;
            state.screen.appendChild(cloneDigit);
            clones.push(cloneDigit);
        }

        function floatFromPixels(pxs) {
            return parseFloat(pxs.slice(0, pxs.length - 2));
        }

        const { cellSize } = state.zoom_lookup[state.zoomLevel];

        // Animate numbers
        await Promise.all(clones.map(clone => {

            const fromX = floatFromPixels(clone.style.left);
            const fromY = floatFromPixels(clone.style.top);
            const toX = state.BIN_GAP_OUTER + state.BIN_WIDTH/2 + (activeBin - 1) * (state.BIN_GAP_INNER + state.BIN_WIDTH) - cellSize/2;
            const toY = state.TOP_BOT_HEIGHT + state.DIVIDER_HEIGHT + state.MID_HEIGHT + cellSize;
            
            return animate(clone.dataset.key, {
                from: {
                    x: fromX,
                    y: fromY
                },
                to: {
                    x: toX,
                    y: toY
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

                    function easeOutQuart(p, delta) {
                        return delta * (1 - Math.pow(1 - p, 4));   
                    }

                    return {
                        x: fx + easeOutQuart(percent, intervalX),
                        y: fy + percent * intervalY,
                    };
                },
                duration: mag(sub({x: toX, y: toY}, {x: fromX, y: fromY})) / 240 * 1000 // px per sec
            });
        }));

        clones.forEach(e => e.remove());

        // Wipe selection
        state.selected = null;

        await wait(500);

        // Pop dialogue
        await animate("dialogue", {
            from: state.POPUP_TOP_OFFSET + state.POPUP_HEIGHT,
            to: state.POPUP_TOP_OFFSET,
            action: n => {
                state.popupHeight[activeBinNumber - 1] = n;
            },
            duration: 500
        });

        await wait(1000);

        // Re-display numbers
        selectedDigits.map(d => {
            return animate(d.dataset.key, {
                from: 0,
                to: 1,
                action: n => {
                    d.style.opacity = n;
                },
                duration: 1000
            });
        });

        // Close dialogue
        await animate("dialogue", {
            from: state.POPUP_TOP_OFFSET,
            to: state.POPUP_TOP_OFFSET + state.POPUP_HEIGHT,
            action: n => {
                state.popupHeight[activeBinNumber - 1] = n;
            },
            duration: 500
        });

        state.sendBinAnimation = false; // all animations complete

        // Update mouse position
        calcMagnification(state.mouse);
 
        await wait(500);

        // close bin
        if (!state.sendBinKeyState) {
            state.isKeyDown[activeBin] = false;
            toggleBin(activeBin, false);
        }
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
            const left = state.BIN_GAP_OUTER + i * (state.BIN_WIDTH + state.BIN_GAP_INNER) + state.BIN_WIDTH/2 - state.CANVAS_WIDTH/2;
            const top  = state.TOP_BOT_HEIGHT + 2 * state.DIVIDER_HEIGHT + state.MID_HEIGHT + state.BIN_GAP_AND_BORDER - state.CANVAS_HEIGHT;
            canvas.style.left = `${left}px`;
            canvas.style.top  = `${top}px`;
        });

        // Align popup
        state.popupRef.forEach((popup, i) => {
            const left = state.BIN_GAP_OUTER + i * (state.BIN_WIDTH + state.BIN_GAP_INNER) + state.BIN_WIDTH/2 - state.POPUP_WIDTH/2;
            const top = state.POPUP_TOP_OFFSET + state.POPUP_HEIGHT;
            popup.style.left = `${left}px`;
            popup.style.top  = `${top}px`;
        });

        window.addEventListener("keydown", e => {
            const {key} = e;

            if (state.sendBinAnimation) {
                // Bin key was re-pressed during send bin animation
                if ("12345".indexOf(key) !== -1) {
                    // If this is the active key...
                    if (state.isKeyDown[key]) {
                        state.sendBinKeyState = true;

                    }
                }
                return;
            }

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
            const {key} = e;
            if ("wasd".indexOf(key) !== -1) {
                if (state.sendBinAnimation) return;
                state.isKeyDown[key] = false;

            } else if ("12345".indexOf(key) !== -1) {
                if (state.isKeyDown[key]) {
                    if (state.sendBinAnimation) {
                        state.sendBinKeyState = false;

                    } else {
                        state.isKeyDown[key] = false;
                        toggleBin(parseInt(key, 10), false);
                    }
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
            const { clientX, clientY } = e;
            state.mouse = { clientX, clientY };
            if (state.sendBinAnimation) return;
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


