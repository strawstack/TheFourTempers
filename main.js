let tracker = {};

(() => {
    
    // Refs
    const digitContainer = document.querySelector(".digit-container");
    let allDigits = null; // lazy init
    let curDigitSize = {width: null, height: null};

    // Variables
    let zoomLevel = 2;
    let curVelocity = {x: 0, y: 0};
    const digitContainerOffset = {x: 0, y: 0};
    const isKeyDown = {
        w: false,
        a: false,
        s: false,
        d: false
    };

    // Constants
    const COLS = 64;
    const ROWS = 20;
    
    const SPEED = 5;
    const FRICTION = 0.9;
    const SMALL = 0.1;

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

    const zoom_lookup = [
        { cellSize: 40, fontSize: 0.75}, 
        { cellSize: 55, fontSize: 1},
        { cellSize: 70, fontSize: 1.25},
        { cellSize: 85, fontSize: 1.5},
        { cellSize: 100, fontSize: 1.75}
    ];

    const uid = (() => {
        let id = -1;
        return () => {
            id += 1;
            return id;
        };
    })();

    function createDigit(n) {
        if (n === undefined) n = Math.floor(Math.random() * 10);
        const d = document.createElement("div");
        d.className = "digit";
        d.innerHTML = n;
        return d;
    }
    
    function render(timestamp) {
        
        for (let key in isKeyDown) {
            const isDown = isKeyDown[key];
            if (isDown) {
                const {x, y} = dir[dir_lookup[key]];
                curVelocity.x = -1 * x * SPEED;
                curVelocity.y = -1 * y * SPEED;
                break;
            }
        }

        // Apply friction
        curVelocity.x *= FRICTION;
        curVelocity.y *= FRICTION;
        if (Math.abs(curVelocity.x) <= SMALL) curVelocity.x = 0;
        if (Math.abs(curVelocity.y) <= SMALL) curVelocity.y = 0;

        // Track offset
        digitContainerOffset.x += curVelocity.x;
        digitContainerOffset.y += curVelocity.y;

        // Bounds
        const { cellSize } = zoom_lookup[zoomLevel];
        digitContainerOffset.x = Math.min(-1 * cellSize/2, digitContainerOffset.x);
        digitContainerOffset.y = Math.min(-1 * cellSize/2, digitContainerOffset.y);
        digitContainerOffset.x = Math.max(-1 * COLS * cellSize + SCREEN_WIDTH, digitContainerOffset.x);
        digitContainerOffset.y = Math.max(-1 * ROWS * cellSize + MID_HEIGHT, digitContainerOffset.y);

        // Apply to dom
        digitContainer.style.top = `${digitContainerOffset.y}px`;
        digitContainer.style.left = `${digitContainerOffset.x}px`;

        window.requestAnimationFrame(render);
    }

    function main() {
        
        Array(COLS * ROWS).fill(null).forEach(e => {
            digitContainer.appendChild(
                createDigit()
            );
        });
        allDigits = document.querySelectorAll(".digit");
        
        window.requestAnimationFrame(render);
    }

    let once = false;
    document.fonts.onloadingdone = () => {
        if (!once) {
            once = true;
            main();
        }
    };

    function setZoom(level) {
        const { cellSize, fontSize } = zoom_lookup[level];
        
        // digit font size
        document.body.style.setProperty("--digit-font-size", `${fontSize}rem`);

        // 64 in a row
        document.body.style.setProperty("--digit-container-size", `${COLS * cellSize}px`);

        // Cell size
        document.body.style.setProperty("--digit-cell-size", `${cellSize}px`);
    }

    function add(a, b) {
        return {
            x: a.x + b.x,
            y: a.y + b.y
        };
    }

    function mult(v, scalar) {
        return {
            x: v.x * scalar,
            y: v.y * scalar
        };
    }

    window.addEventListener("keydown", e => {
        const {key} = e;
        if (key === "ArrowUp") {
            zoomLevel += 1;
            zoomLevel = Math.min(4, zoomLevel);
            setZoom(zoomLevel);


        } else if (key === "ArrowDown") {
            zoomLevel -= 1;
            zoomLevel = Math.max(0, zoomLevel);
            setZoom(zoomLevel);

        } else if ("wasd".indexOf(key) !== -1) {
            isKeyDown[key] = true;

        }
    });

    window.addEventListener("keyup", e => {
        const {key} = e;
        if ("wasd".indexOf(key) !== -1) {
            isKeyDown[key] = false;

        }
    });

})();


