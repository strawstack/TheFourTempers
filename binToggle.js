function binToggle(state, animate) {

    const { add, sub } = helper(state);

    const LINE_WIDTH = 3;
    const TILT_HEIGHT = 17;
    const MAX_ANGLE = 3 * Math.PI/4;
    const MAX_ANGLE_RIGHT_SIZE = Math.PI/4;

    const leftPivotPoint = {
        x: state.CANVAS_WIDTH/2 - state.BIN_WIDTH/2 + LINE_WIDTH/2,
        y: state.CANVAS_HEIGHT - LINE_WIDTH/2
    };

    const rightPivotPoint = {
        x: state.CANVAS_WIDTH/2 + state.BIN_WIDTH/2 - LINE_WIDTH/2,
        y: state.CANVAS_HEIGHT - LINE_WIDTH/2
    };

    const startPoints = [
        leftPivotPoint,
        rightPivotPoint,
        pointOnCircle(leftPivotPoint, state.BIN_WIDTH/2, MAX_ANGLE),
        pointOnCircle(rightPivotPoint, state.BIN_WIDTH/2, MAX_ANGLE_RIGHT_SIZE)
    ];

    function pointOnCircle(center, radius, angle) {
        const x = center.x + radius * Math.cos(angle);
        const y = center.y - radius * Math.sin(angle);
        return {x, y};
    }

    function drawLine(ctx, from, to) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    }

    function renderLines(ctx, angle) {
        ctx.lineCap = "round";
        ctx.strokeStyle = "white";
        ctx.lineWidth = LINE_WIDTH;

        const leftTarget = pointOnCircle(
            {x: leftPivotPoint.x, y: leftPivotPoint.y},
            state.BIN_WIDTH/2,
            angle
        );

        const rightTarget = pointOnCircle(
            {x: rightPivotPoint.x, y: rightPivotPoint.y},
            state.BIN_WIDTH/2,
            Math.PI - angle
        );

        drawLine(ctx, leftPivotPoint, leftTarget);
        drawLine(ctx, rightPivotPoint, rightTarget);
    }

    function renderTilt(ctx, percent) {
        renderLines(ctx, MAX_ANGLE);
        const lift = -1 * percent * TILT_HEIGHT;
        for (let point of startPoints) {
            drawLine(
                ctx,
                sub(point, {x: 0, y: LINE_WIDTH/2}),
                add(point, {x: 0, y: lift})
            );
        }
    }

    function toggleBin(number, willOpen) {

        const ctx = state.ctxRef[number - 1];

        if (willOpen) {
            const tiltDuration = 200;
            const rotateDuration = 1000;
            animate(number, {
                from: 0,
                to: rotateDuration + tiltDuration,
                action: n => {
                    ctx.clearRect(0, 0, state.CANVAS_WIDTH, state.CANVAS_HEIGHT);
                    if (n <= rotateDuration) {
                        const angle = (n / rotateDuration) * MAX_ANGLE;
                        renderLines(ctx, angle);

                    } else {
                        renderTilt(ctx, (n - rotateDuration) / tiltDuration);

                    }
                },
                duration: rotateDuration + tiltDuration
            });
        }
    }

    return {
        toggleBin
    };
}