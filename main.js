(() => {

    const { calculate } = calculateFrame();

    // State
    const state = {};
    state.zoomLevel = 2;
    state.digitContainerPosition = {x: 0, y: 0};
    state.currentVelocity = {x: 0, y: 0};
    state.isKeyDown = { w: false, a: false, s: false, d: false };
    state.zoom_lookup = [
        { cellSize: 40, fontSize: 0.75}, 
        { cellSize: 55, fontSize: 1},
        { cellSize: 70, fontSize: 1.25},
        { cellSize: 85, fontSize: 1.5},
        { cellSize: 100, fontSize: 1.75}
    ];
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
        const coordToNumber = ({x, y}) => {
            return y * state.COLS + x;
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

    function add(a, b) {
        return {
            x: a.x + b.x,
            y: a.y + b.y
        };
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
        state.allDigits.forEach(d => d.addEventListener("mousemove", e => {
            const { target, clientX, clientY } = e;
            const { left, top } = target.getBoundingClientRect();
            const key = parseInt(target.dataset.key, 10);

            state.magnification.mouse = { // relative to digit
                x: clientX - left,
                y: clientY - top
            };
            state.magnification.adjDigits = getAdjecentDigits(state.allDigits, key);
        }));

        window.requestAnimationFrame(timestamp => calculate(timestamp, state));
    }

    let once = false;
    document.fonts.onloadingdone = () => {
        if (!once) {
            once = true;
            main();
        }
    };

})();


