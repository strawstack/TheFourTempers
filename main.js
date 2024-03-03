(() => {

    // Init state
    const state = {};
    // Constants
    state.COLS = 40;
    state.ROWS = 25;
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
    // Variables
    state.zoomLevel = 1;
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
    state.FILENAME = null;
    state.getRandom = null;
    state.groups = null;
    state.groupSpans = null; // 2D rects to contain each behaviour group
    state.getRandom = null; // lazy init
    state.digitOffset = null;

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
    
    const help = helper(state);
    const { calcMagnification, selectDigit, wait, randBetween, add, sub, mult } = help;

    const { toggleBin } = binToggle(state, animate, animations);
    const { sendBin } = sendBinAnimation(state, help, animate, toggleBin);
    const { calcBehaviour } = behaviour(state, help, animate);

    // Helper
    function createDigit(key) {
        const n = Math.floor(Math.random() * 10);
        const d = document.createElement("div");
        d.className = "digit";
        d.dataset.key = key;
        const span = document.createElement("span");
        d.appendChild(span);
        span.innerHTML = n;
        return d;
    }

    function randomFactory(hash) {
        let index = 0;
        function getRandom() {
            index = (index + 1) % hash.length;
            const index2 = (index + 2) % hash.length;
            return parseInt(`${hash[index]}${hash[index2]}`, 16) / 256; // Returns [0 to 1) (precision 1/255)
        }
        return getRandom;
    }

    async function animationChain(key) {

        // 50% chance to wait in place
        if (state.getRandom() < 0.5) {
            await wait( randBetween(5000, 8000) );
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
        });

        // Continue chain
        animationChain(key);
    }

    function main() {

        state.FILENAME = "Filename";
        const hash = Array(10).fill(null).map((e, i) => CryptoJS.SHA256(`${state.FILENAME}${i}`).toString()).join("");
        state.getRandom = randomFactory(hash);
        
        Array(state.COLS * state.ROWS).fill(null).forEach((e, i) => {
            state.digitContainer.appendChild(
                createDigit(i)
            );
        });

        state.allDigits = document.querySelectorAll(".digit");

        state.allSpans = {};
        state.allDigits.forEach(d => {
            const { key } = d.dataset;
            state.allSpans[key] = d.querySelector("span");
        });

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

        calcBehaviour(state);

        state.digitOffset = {};
        state.allDigits.forEach(e => {
            state.digitOffset[e.dataset.key] = {
                x: 0,
                y: 0
            };
        });

        state.allDigits.forEach(d => {
            const { key } = d.dataset;
            animationChain(key);
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
                sendBin(parseInt(activeBin, 10));

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


