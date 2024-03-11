function tempers() {

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
    state.controllers = {};
    state.binToGroupKey = {};
    state.FILENAME = null;
    state.getRandom = null;
    state.groups = null;
    state.groupSpans = null; // 2D rects to contain each behaviour group
    state.getRandom = null; // lazy init
    state.mainDigits = null;
    state.digitOffset = null;
    state.stats = null; // lazy load in main, pulls from local storage
    state.locationPrefix = { x: null, y: null };
    state.bars = null;

    // Refs
    state.screen = document.querySelector(".macrodata-screen");
    state.digitContainer = document.querySelector(".macrodata-screen .digit-container");
    state.allDigits = null; // lazy init in main
    state.allSpans = null;
    state.binFills = document.querySelectorAll(".macrodata-screen .percent>.fill");
    state.binPercent = document.querySelectorAll(".macrodata-screen .percent>span");
    state.temperFills = document.querySelectorAll(".macrodata-screen .popup .bar .fill");
    state.popupRef = document.querySelectorAll(".macrodata-screen .popup");
    state.canvasRef = document.querySelectorAll(".macrodata-screen .mdcanvas");
    state.ctxRef = Array.from(state.canvasRef).map(c => c.getContext("2d"));
    state.location = document.querySelector(".macrodata-screen .location-container .location");
    state.filenameRef = document.querySelector(".macrodata-screen .top .rect .filename");
    state.fileComplete = document.querySelector(".macrodata-screen .top .rect .complete");
    state.globalFill = document.querySelector(".macrodata-screen .top .rect .fill");
    state.barsRef = null; // lazy inside main

    // Imports
    const { animate, animations } = animation();
    const { calculate } = calculateFrame(state, animate, animations);
    
    const help = helper(state, animate, animations);
    const { 
        calcMagnification, selectDigit, animationChain, 
        specialAnimationChain, assignBins, initStats, randBetween, 
        wait, padLeft 
    } = help;

    const { toggleBin } = binToggle(state, animate, animations);
    const { sendBin } = sendBinAnimation(state, help, animate, toggleBin);
    const { calcBehaviour } = behaviour(state, help, animate);

    // Helper
    async function createDigit(key, hash) {
        const d = document.createElement("div");
        d.className = "digit";
        d.dataset.key = key;
        const span = document.createElement("span");
        d.appendChild(span);
        span.innerHTML = parseInt(hash[key], 16) % 10;
        d.style.opacity = "0";
        state.digitContainer.appendChild(d);
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

    function createBar(opacity) {
        const d = document.createElement("div");
        d.className = "bar";
        d.style.opacity = opacity;
        d.style.display = "none";
        return d;
    }

    async function start(filename) {

        state.FILENAME = filename;
        const hash = Array(16).fill(null).map((e, i) => CryptoJS.SHA256(`${state.FILENAME}${i}`).toString()).join(""); // 16 *  64 is over 1000
        state.getRandom = randomFactory(hash);

        state.filenameRef.innerHTML = state.FILENAME;

        state.bars = Math.floor((1000 - 2 * 70 - 2 * 3) / 6); // 70 for margin, 3 for border
        Array(state.bars).fill(null).forEach((e, i) => {
            state.globalFill.appendChild(
                createBar(i / state.bars)
            );
        });

        state.barsRef = document.querySelectorAll(".top .bar");

        state.locationPrefix = {
            x: padLeft(randBetween(0, parseInt("FFF", 16)).toString(16).toUpperCase(), "0", 3),
            y: padLeft(randBetween(0, parseInt("FFF", 16)).toString(16).toUpperCase(), "0", 3),
        };

        state.stats = window.localStorage.getItem("stats");
        if (state.stats === null) state.stats = {};
        state.stats[state.FILENAME] = {
            "collected": {},
            "bins": [{req: {}, cur: {}}, {req: {}, cur: {}}, {req: {}, cur: {}}, {req: {}, cur: {}}, {req: {}, cur: {}}] // init by initStats below
        };
        
        Array(state.COLS * state.ROWS).fill(null).forEach((e, i) => {
            createDigit(i, hash);
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
            popup.style.removeProperty("display");
        });

        calcBehaviour();

        state.mainDigits = {};
        state.groups.forEach(g => {
            const { key } = g.digits[g.main].ref.dataset;
            state.mainDigits[key] = g;
        });

        assignBins();

        initStats();

        state.digitOffset = {};
        state.allDigits.forEach(e => {
            state.digitOffset[e.dataset.key] = {
                x: 0,
                y: 0
            };
        });

        state.allDigits.forEach(d => {
            const { key } = d.dataset;
            if (key in state.mainDigits) {
                specialAnimationChain(key);

            } else {
                animationChain(key);

            }
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

            // Switch non-special digits back to normal animation pattern
            for (let key in state.selected) {
                if (key in state.mainDigits) {
                    const { digits } = state.mainDigits[key];
                    for (let { ref } of digits) {
                        
                        const dkey = ref.dataset.key;
                        if (dkey in state.mainDigits) continue;
                        
                        // Cancel animation and promise
                        delete animations[`base_${dkey}`]; 
                        if (`base_${dkey}` in state.controllers) {
                            state.controllers[`base_${dkey}`].abort();
                            delete state.controllers[`base_${dkey}`];
                        };

                        animationChain(dkey);
                    }
                }
            }

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

        await animate("fadeInUI", {
            from: 0,
            to: 1,
            action: n => {
                state.screen.style.opacity = n;
            },
            duration: 1000
        });

        state.allDigits.forEach(async d => {
            await wait(randBetween(500, 1500));
        
            await animate(`opacity_${d.dataset.key}`, {
                from: 0,
                to: 1,
                action: n => {
                    d.style.opacity = n;
                },
                duration: 800
            });
            
            d.style.removeProperty("opacity");
        });
    }

    return {
        start
    };
}