(() => {

    const state = {};
    const { calculate } = calculateFrame(state);
    const { coordToNumber, calcMagnification } = helper(state);

    // State
    state.zoomLevel = 2;
    state.digitContainerPosition = {x: 0, y: 0};
    state.currentVelocity = {x: 0, y: 0};
    state.isKeyDown = { w: false, a: false, s: false, d: false };
    state.zoom_lookup = [
        { cellSize: 40, fontSize: 0.75, range: [0.75, 3.75]}, 
        { cellSize: 55, fontSize: 1, range: [1, 5]},
        { cellSize: 70, fontSize: 1.25, range: [1.25, 5.25]},
        { cellSize: 85, fontSize: 1.5, range: [1.5, 6.5]},
        { cellSize: 100, fontSize: 1.75, range: [1.75, 6.75]}
    ];
    state.mouse = null; // global mouse (cached for when container moves, but mouse is static)
    state.magnification = {
        adjDigits: null,
        mouse: null
    };
    // Constants
    state.COLS = 64;
    state.ROWS = 20;
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
    
    window.addEventListener("keydown", e => {
        const {key} = e;
        if (key === "ArrowUp") {
            state.zoomLevel += 1;
            state.zoomLevel = Math.min(4, state.zoomLevel);

        } else if (key === "ArrowDown") {
            state.zoomLevel -= 1;
            state.zoomLevel = Math.max(0, state.zoomLevel);

        } else if ("wasd".indexOf(key) !== -1) {
            state.isKeyDown[key] = true;

        }
    });

    window.addEventListener("keyup", e => {
        const {key} = e;
        if ("wasd".indexOf(key) !== -1) {
            state.isKeyDown[key] = false;

        }
    });

    function main() {
        
        Array(state.COLS * state.ROWS).fill(null).forEach((e, i) => {
            state.digitContainer.appendChild(
                createDigit(i)
            );
        });

        state.allDigits = document.querySelectorAll(".digit");
        
        state.digitContainer.addEventListener("mousemove", e => {
            const { clientX, clientY } = e;
            state.mouse = { clientX, clientY };
            calcMagnification({ clientX, clientY });
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


