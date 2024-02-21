function calculateFrame() {

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

    function render(timestamp, state) {

        state.digitContainer.style.top = `${state.digitContainerPosition.y}px`;
        state.digitContainer.style.left = `${state.digitContainerPosition.x}px`;

    }

    function calculate(timestamp, state) {

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

        // Track offset
        state.digitContainerPosition.x += state.currentVelocity.x;
        state.digitContainerPosition.y += state.currentVelocity.y;

        // Bounds
        const { cellSize } = state.zoom_lookup[state.zoomLevel];
        state.digitContainerPosition.x = Math.min(0, state.digitContainerPosition.x);
        state.digitContainerPosition.y = Math.min(0, state.digitContainerPosition.y);
        state.digitContainerPosition.x = Math.max(-1 * state.COLS * cellSize + SCREEN_WIDTH, state.digitContainerPosition.x);
        state.digitContainerPosition.y = Math.max(-1 * state.ROWS * cellSize + MID_HEIGHT, state.digitContainerPosition.y);

        render(timestamp, state);
        window.requestAnimationFrame(timestamp => calculate(timestamp, state));
    }

    return {
        calculate
    };
}