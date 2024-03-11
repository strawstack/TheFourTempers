function binToggle(state, animate, animations) {

    const { add } = helper(state);

    const LINE_WIDTH = 3;
    const TILT_HEIGHT = 17;
    const MAX_ANGLE = 3 * Math.PI/4;
    const MAX_ANGLE_RIGHT_SIZE = Math.PI/4;

    const FONT_COLOR = "#8DF4FF";
    const BACKGROUND_COLOR = "#024179";

    const leftPivotPoint = {
        x: state.CANVAS_WIDTH/2 - state.BIN_WIDTH/2 + LINE_WIDTH/2,
        y: state.CANVAS_HEIGHT - LINE_WIDTH/2
    };
    const leftTargetPoint = pointOnCircle(leftPivotPoint, state.BIN_WIDTH/2, MAX_ANGLE);

    const rightPivotPoint = {
        x: state.CANVAS_WIDTH/2 + state.BIN_WIDTH/2 - LINE_WIDTH/2,
        y: state.CANVAS_HEIGHT - LINE_WIDTH/2
    };
    const rightTargetPoint = pointOnCircle(rightPivotPoint, state.BIN_WIDTH/2, MAX_ANGLE_RIGHT_SIZE);

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
        ctx.strokeStyle = FONT_COLOR;
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

        const LEFT_PIVOT = 0;
        const LEFT_TARGET = 1;
        const RIGHT_PIVOT = 2;
        const RIGHT_TARGET = 3;

        const lift = -1 * percent * TILT_HEIGHT;
        const startPoints = [leftPivotPoint, leftTargetPoint, rightPivotPoint, rightTargetPoint];
        const vertPoints = startPoints.map(point => add(point, {x: 0, y: lift}));

        // Fill
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.beginPath();
        ctx.moveTo(vertPoints[LEFT_TARGET].x, vertPoints[LEFT_TARGET].y);
        ctx.lineTo(vertPoints[LEFT_PIVOT].x, vertPoints[LEFT_PIVOT].y);
        ctx.lineTo(vertPoints[RIGHT_PIVOT].x, vertPoints[RIGHT_PIVOT].y);
        ctx.lineTo(vertPoints[RIGHT_TARGET].x, vertPoints[RIGHT_TARGET].y)
        ctx.lineTo(startPoints[RIGHT_TARGET].x, startPoints[RIGHT_TARGET].y);
        ctx.lineTo(startPoints[RIGHT_PIVOT].x, startPoints[RIGHT_PIVOT].y);
        ctx.lineTo(startPoints[LEFT_PIVOT].x, startPoints[LEFT_PIVOT].y);
        ctx.lineTo(startPoints[LEFT_TARGET].x, startPoints[LEFT_TARGET].y);
        ctx.closePath();
        ctx.fill();

        renderLines(ctx, MAX_ANGLE);

        // Vertical lines
        for (let i = 0; i < startPoints.length; i++) {
            drawLine(ctx, startPoints[i], vertPoints[i]);
        }

        // Horizontal lines
        drawLine(ctx, vertPoints[LEFT_PIVOT], vertPoints[LEFT_TARGET]);

        drawLine(ctx, vertPoints[RIGHT_PIVOT], vertPoints[RIGHT_TARGET]);

        drawLine(ctx, startPoints[LEFT_PIVOT], startPoints[RIGHT_PIVOT]);
        drawLine(ctx, vertPoints[LEFT_PIVOT], vertPoints[RIGHT_PIVOT]);

    }

    function toggleBin(number, willOpen) {
        
        const tiltDuration = 200;
        const rotateDuration = 600;
        const ctx = state.ctxRef[number - 1];

        const calculate = () => {
            if (number in animations) {

                const {start, to} = animations[number];
                const prevElapsed = document.timeline.currentTime - start;

                if (willOpen) {
                    return to - prevElapsed; // formerly closing, calculate current position
                } else {
                    return prevElapsed;
                }

            } else {
                if (willOpen) {
                    return 0; // currently closed, begin opening

                } else {
                    return rotateDuration + tiltDuration;

                }
            }
        };
        const previousElapsed = calculate();

        if (willOpen) {

            animate(number, {
                from: previousElapsed,
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
                duration: rotateDuration + tiltDuration - previousElapsed
            });

        } else { // willOpen === false

            animate(number, {
                from: 0,
                to: previousElapsed,
                action: n => {

                    const invert = previousElapsed - n;

                    ctx.clearRect(0, 0, state.CANVAS_WIDTH, state.CANVAS_HEIGHT);

                    if (invert <= rotateDuration) {
                        const angle = (invert / rotateDuration) * MAX_ANGLE;
                        renderLines(ctx, angle);

                    } else {
                        renderTilt(ctx, (invert - rotateDuration) / tiltDuration);

                    }
                },
                duration: previousElapsed
            });

        }
    }

    return {
        toggleBin
    };
}