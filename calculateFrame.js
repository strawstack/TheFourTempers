function calculateFrame(state) {

    const { 
        numberToCoord, 
        mag, 
        sub, 
        calcMagnification 
    } = helper(state);

    const SPEED = 5;
    const FRICTION = 0.9;
    const SMALL = 0.01;

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

    function setZoom({ cellSize, fontSize }, COLS) {
        
        // digit font size
        document.body.style.setProperty("--digit-font-size", `${fontSize}rem`);

        // 64 in a row
        document.body.style.setProperty("--digit-container-size", `${COLS * cellSize}px`);

        // Cell size
        document.body.style.setProperty("--digit-cell-size", `${cellSize}px`);
    }

    function valueFromRange(range, percent, base) {
        if (percent <= 0) return base;
        const [lower, upper] = range;
        const size = upper - lower;
        return lower + percent * size;
    }

    function setFontSize(allDigits, adjDigits) {
        // Reset inline zoom for all digits
        allDigits.forEach(e => e.style.removeProperty("font-size"));

        // Apply font size to adjecent cells
        if (adjDigits != null) {
            adjDigits.forEach(digit => {
                if (digit === null) return;

                // Digit's key to coord in digit container
                const { x, y } = numberToCoord(digit.dataset.key);
                
                // Current cell size
                const { cellSize: SIZE, fontSize: base, range } = state.zoom_lookup[state.zoomLevel];

                // Global center point of cell
                const CENTER_POINT = {x: x * SIZE + SIZE/2, y: y * SIZE + SIZE/2};
    
                // Max distance possible from center
                const MAX_DISTANCE = 3 * SIZE/2; // mag({x: , y: 3 * SIZE/2});
    
                // Vec from center to global mouse
                const vec = sub(state.magnification.mouse, CENTER_POINT);
    
                // Magnitude of vector
                const length = mag(vec);
    
                // Mouse proximity to center
                const percent = 1 - (length / MAX_DISTANCE);
    
                const fontSize = valueFromRange(range, percent, base);
                
                digit.style.fontSize = `${fontSize}rem`;

            });
        }
    }

    function render(timestamp) {

        state.digitContainer.style.top = `${state.digitContainerPosition.y}px`;
        state.digitContainer.style.left = `${state.digitContainerPosition.x}px`;

        setZoom(
            state.zoom_lookup[state.zoomLevel], 
            state.COLS
        );

        // Magnification
        setFontSize(
            state.allDigits,
            state.magnification.adjDigits
        );
    }

    function calculate(timestamp) {

        // Set Velocity
        for (let key in state.isKeyDown) {
            const isDown = state.isKeyDown[key];
            if (isDown) {
                const {x, y} = dir[dir_lookup[key]];
                state.currentVelocity.x = -1 * x * SPEED;
                state.currentVelocity.y = -1 * y * SPEED;
                break;
            }
        }

        // Apply friction
        state.currentVelocity.x *= FRICTION;
        state.currentVelocity.y *= FRICTION;
        if (Math.abs(state.currentVelocity.x) <= SMALL) state.currentVelocity.x = 0;
        if (Math.abs(state.currentVelocity.y) <= SMALL) state.currentVelocity.y = 0;

        const savePosition = {...state.digitContainerPosition};

        // Track offset
        state.digitContainerPosition.x += state.currentVelocity.x;
        state.digitContainerPosition.y += state.currentVelocity.y;

        // Bounds
        const { cellSize } = state.zoom_lookup[state.zoomLevel];
        state.digitContainerPosition.x = Math.min(0, state.digitContainerPosition.x);
        state.digitContainerPosition.y = Math.min(0, state.digitContainerPosition.y);
        state.digitContainerPosition.x = Math.max(-1 * state.COLS * cellSize + SCREEN_WIDTH, state.digitContainerPosition.x);
        state.digitContainerPosition.y = Math.max(-1 * state.ROWS * cellSize + MID_HEIGHT, state.digitContainerPosition.y);

        // Possibly Trigger mouse position update
        if (
            state.mouse !== null && 
            mag(sub(savePosition, state.digitContainerPosition)) >= SMALL
        ) {
            calcMagnification(state.mouse);
        }

        render(timestamp);
        window.requestAnimationFrame(calculate);
    }

    return {
        calculate
    };
}