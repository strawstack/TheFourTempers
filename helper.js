function helper(state) {

    function numberToCoord(n) {
        return {
            x: n % state.COLS,
            y: Math.floor(n / state.COLS)
        };
    }

    function coordToNumber({x, y}) {
        return y * state.COLS + x;
    }

    function sub(a, b) {
        return {
            x: a.x - b.x,
            y: a.y - b.y
        };
    }

    function mag(a) {
        return Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
    }

    function add(a, b) {
        return {
            x: a.x + b.x,
            y: a.y + b.y
        };
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

    function keyFromMouse({ x, y }) {
        const { cellSize } = state.zoom_lookup[state.zoomLevel];
        const xx = Math.floor(x / cellSize);
        const yy = Math.floor(y / cellSize);
        return coordToNumber({x: xx, y: yy});
    }

    function mouseRelativeToDigitContainer({ clientX, clientY }) {
        const { left, top } = state.digitContainer.getBoundingClientRect();
        return {
            x: clientX - left,
            y: clientY - top
        };
    }

    function calcMagnification({ clientX, clientY }) {
        state.magnification.mouse = mouseRelativeToDigitContainer({ clientX, clientY });
        const key = keyFromMouse(state.magnification.mouse);
        state.magnification.adjDigits = getAdjecentDigits(state.allDigits, key);
    }

    function selectDigit(mouse) {
        const key = keyFromMouse( mouseRelativeToDigitContainer(mouse) );
        if (state.selected === null) state.selected = {};
        state.selected[key] = true;
    }

    return {
        numberToCoord,
        coordToNumber,
        mag,
        sub,
        add,
        calcMagnification,
        mouseRelativeToDigitContainer,
        selectDigit
    };
}