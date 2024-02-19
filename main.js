let tracker = {};

(() => {
    
    // Refs
    const digitContainer = document.querySelector(".digit-container");
    let allDigits = null; // lazy init
    let curDigitSize = {width: null, height: null};

    // Variables
    let fSize = 1.5;
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

    function fontSize(rem) {
        allDigits.forEach(e => {
            e.style.fontSize = `${rem}rem`;
        });

        // Maintain 64 in a row
        curDigitSize = allDigits[0].getBoundingClientRect();
        const { width } = curDigitSize;
        const pad = 0;
        digitContainer.style.width = `${64 * width + pad}px`;
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
            fSize += 0.25;
            fSize = Math.min(8, fSize);
            fontSize(fSize);

        } else if (key === "ArrowDown") {
            fSize -= 0.25;
            fSize = Math.max(1.5, fSize);
            fontSize(fSize);

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


