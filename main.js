(() => {

    const state = {};
    const { calculate } = calculateFrame(state);
    const {
        sub,
        calcMagnification,
        selectDigit
    } = helper(state);
    const { animate } = animation();

    // State
    state.zoomLevel = 2;
    state.digitContainerPosition = {x: 0, y: 0};
    state.currentVelocity = {x: 0, y: 0};
    state.isKeyDown = { w: false, a: false, s: false, d: false };
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
    state.binAnimation = false;
    // Constants
    state.COLS = 64;
    state.ROWS = 20;
    state.MID_HEIGHT = 500;
    // Refs
    state.digitContainer = document.querySelector(".digit-container");
    state.allDigits = null; // lazy init in main

    // Helper
    function createDigit(key) {
        const n = Math.floor(Math.random() * 10);
        const d = document.createElement("div");
        d.className = "digit";
        d.dataset.key = key;
        d.innerHTML = n;
        return d;
    }

    function main() {

        Array(state.COLS * state.ROWS).fill(null).forEach((e, i) => {
            state.digitContainer.appendChild(
                createDigit(i)
            );
        });

        state.allDigits = document.querySelectorAll(".digit");

        window.addEventListener("keydown", e => {
            if (state.binAnimation) return;

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

            } else if (key === "b") {
                if (state.selected === null) return;

                // Start binAnimation (freeze inputs)
                state.binAnimation = true;

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
                            x: -1 * state.digitContainerPosition.x,
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
                            state.binAnimation = false; // after animation completes
                            state.selected = null;
                        }
                    });
                });

                // Replace numbers (if correct)

            }
        });

        window.addEventListener("keyup", e => {
            if (state.binAnimation) return;
            const {key} = e;
            if ("wasd".indexOf(key) !== -1) {
                state.isKeyDown[key] = false;

            }
        });

        state.digitContainer.addEventListener("mousedown", e => {
            if (state.binAnimation) return;
            state.mouseDown = true;
            selectDigit(state.mouse);
        });

        window.addEventListener("mouseup", e => {
            if (state.binAnimation) return;
            state.mouseDown = false;
            state.selected = null;
        });

        state.digitContainer.addEventListener("mousemove", e => {
            if (state.binAnimation) return;
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


