let tracker = {};

(() => {
    
    // Refs
    const digitContainer = document.querySelector(".digit-container");
    let allDigits = null; // lazy init
    let curDigitSize = {width: null, height: null};

    // Variables
    let fSize = 1.5;
    let zoomLevel = 0;
    let digitContainer_Offset_Target = {x: 0, y: 0};
    let digitContainer_Offset = {x: 0, y: 0};
    let activeAnim = {};

    // Constants
    const dir = {
        'UP': {x: 0, y: -1},
        'RIGHT': {x: 1, y: 0},
        'DOWN': {x: 0, y: 1},
        'LEFT': {x: -1, y: 0}
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
        
        for (let key in activeAnim) {
            const {from, to, start, end} = activeAnim[key];

        }

    }

    function main() {
        
        Array(64 * 40).fill(null).forEach(e => {
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
        document.body.style.setProperty("--digit-container-size", `${64 * cellSize}px`);

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

    // debug font size
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
            const wasd_lookup = {
                w: dir.UP,
                d: dir.RIGHT,
                s: dir.DOWN,
                a: dir.LEFT
            };
            const {width, height} = curDigitSize;
            const size_lookup = {
                w: height,
                d: width,
                s: height,
                a: width
            };            
            digitContainer_Offset_Target = add(
                digitContainer_Offset_Target,
                mult(wasd_lookup[key], size_lookup[key])
            );
        }
    })

})();


