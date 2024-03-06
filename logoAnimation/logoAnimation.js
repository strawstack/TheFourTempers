function logoAnimation({ ctx, size }) {

    const FONT_SIZE = 62;
    const LINE_WIDTH = 5;

    const arcDuration = 800;
    const waitBeforeLines = 100; 
    const lineDuration = 150;
    const waitBetweenLines = 100;
    const offsetDuration = 2 * arcDuration + 2 * lineDuration + waitBeforeLines + waitBetweenLines;

    const state = {};
    const animations = {};

    state.font = getCssVar("--font");
    state.background = getCssVar("--background");

    state.outerArc = {
        scale: { x: 2, y: 1 },
        pos: { x: size.WIDTH / 2, y: size.HEIGHT / 2 },
        rad: 100,
        start: -1 * Math.PI / 2, // -90deg (y-axis)
        end: 3 * Math.PI / 2,    // 270deg (y-axis)
        percent: 1,
        offset: 0
    };

    state.clip = state.outerArc;

    state.midArc = {
        scale: { x: 1.5, y: 1 },
        pos: { x: size.WIDTH / 2, y: size.HEIGHT / 2 },
        rad: 100,
        start: -1 * Math.PI / 2, // -90deg (y-axis)
        end: 3 * Math.PI / 2,    // 270deg (y-axis)
        percent: 0,
        offset: 0 // push element right
    };

    state.inArc = {
        scale: { x: 0.8, y: 1 },
        pos: { x: size.WIDTH / 2, y: size.HEIGHT / 2 },
        rad: 100,
        start: -1 * Math.PI / 2, // -90deg (y-axis)
        end: 3 * Math.PI / 2,    // 270deg (y-axis)
        percent: 0,
        offset: 0 // push element right
    };

    state.topLine = {
        from: {
            x: size.WIDTH / 2 + state.outerArc.rad * Math.cos(-1 * degToRad(35)) * state.outerArc.scale.x,
            y: size.HEIGHT / 2 + state.outerArc.rad * Math.sin(-1 * degToRad(35)) * state.outerArc.scale.y
        },
        to: {
            x: size.WIDTH / 2 + state.outerArc.rad * Math.cos(degToRad(215)) * state.outerArc.scale.x,
            y: size.HEIGHT / 2 + state.outerArc.rad * Math.sin(degToRad(215)) * state.outerArc.scale.y
        },
        percent: 0
    };

    state.botLine = {
        from: {
            x: size.WIDTH / 2 + state.outerArc.rad * Math.cos(degToRad(35)) * state.outerArc.scale.x,
            y: size.HEIGHT / 2 + state.outerArc.rad * Math.sin(degToRad(35)) * state.outerArc.scale.y
        },
        to: {
            x: size.WIDTH / 2 + state.outerArc.rad * Math.cos(degToRad(145)) * state.outerArc.scale.x,
            y: size.HEIGHT / 2 + state.outerArc.rad * Math.sin(degToRad(145)) * state.outerArc.scale.y
        },
        percent: 0
    };

    const lineLenght = state.topLine.from.x - state.topLine.to.x;
    const lineVertGap = state.botLine.to.y - state.topLine.to.y;
    const margin = 20;
    const extraWidth = 20;

    state.rect = {
        pos: {
            x: state.topLine.to.x - extraWidth/2,
            y: state.topLine.to.y + margin
        },
        width: lineLenght + extraWidth,
        height: lineVertGap - 2 * margin,
        opacity: 0
    };

    function calculate(timestamp) {
        
        for (let key in animations) {
            const { start, from, to, duration, action, resolve } = animations[key];
            const elapsed = Date.now() - start;
            if (elapsed >= duration) {
                delete animations[key];
                action(to);
                resolve();

            } else {
                const delta = to - from;
                const progress = from + delta * (elapsed / duration);
                action(progress);

            }
        }
        
        render();
        window.requestAnimationFrame(calculate);
    }

    function render() {
        ctx.clearRect(0, 0, size.WIDTH, size.HEIGHT);

        renderOval(state.outerArc);
        renderOval(state.midArc);
        renderOval(state.inArc);

        renderLine(state.topLine);
        renderLine(state.botLine);

        renderRect(state.rect);

    }

    async function start() {

        ctx.font = `${FONT_SIZE}px 'M PLUS Rounded 1c', sans-serif`;

        // Create clipping region
        const createClip = data => {
            ctx.save();
            ctx.scale(data.scale.x, data.scale.y);
            ctx.beginPath();
            ctx.arc(
                data.pos.x / data.scale.x, 
                data.pos.y / data.scale.y, 
                data.rad + LINE_WIDTH/2,
                0, Math.PI * 2
            );
            ctx.restore();
            ctx.lineWidth = LINE_WIDTH;
            ctx.clip();
        };
        createClip(state.clip);

        window.requestAnimationFrame(calculate);

        animation('offset', {
            from: 35,
            to: 0,
            duration: offsetDuration,
            action: n => {
                const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);
                const x = 1 - easeOutQuart(1 - (n / 35));
                state.midArc.offset = 35 * x;
                state.inArc.offset = 35 * x;
            }
        });

        await animation('midArc', {
            from: 0,
            to: 1,
            duration: arcDuration,
            action: n => {
                state.midArc.percent = n;
            }
        });

        await animation('inArc', {
            from: 0,
            to: 1,
            duration: arcDuration,
            action: n => {
                state.inArc.percent = n;
            }
        });

        await wait(waitBeforeLines);

        animation('rect', {
            from: 0,
            to: 1,
            duration: 100,
            action: n => {
                state.rect.opacity = n;
            }
        });

        await animation('topLine', {
            from: 0,
            to: 1,
            duration: lineDuration,
            action: n => {
                state.topLine.percent = n;
            }
        });

        await wait(waitBetweenLines);

        await animation('botLine', {
            from: 0,
            to: 1,
            duration: lineDuration,
            action: n => {
                state.botLine.percent = n;
            }
        });

    }

    function renderRect(data) {
        ctx.save();
        ctx.globalAlpha = data.opacity;
        ctx.fillStyle = state.background;
        ctx.fillRect(data.pos.x, data.pos.y, data.width, data.height);
        ctx.restore();
    }

    function renderLine(data) {
        ctx.beginPath();
        ctx.moveTo(data.from.x, data.from.y);
        const delta = {
            x: data.to.x - data.from.x,
            y: data.to.y - data.from.y
        };
        ctx.lineTo(
            data.from.x + data.percent * delta.x,
            data.from.y + data.percent * delta.y
        );
        ctx.stroke();
    }

    function renderOval(data) {
        ctx.save();
        ctx.scale(data.scale.x, data.scale.y);
        ctx.beginPath();
        ctx.arc(
            (data.pos.x + data.offset) / data.scale.x, 
            data.pos.y / data.scale.y, 
            data.rad, 
            data.start,
            data.start + (data.end - data.start) * data.percent 
        );
        ctx.restore();
        ctx.lineWidth = LINE_WIDTH;
        ctx.strokeStyle = state.font;
        ctx.stroke();
    }

    function wait(ms) {
        return new Promise((res, rej) => {
            setTimeout(res, ms);
        });
    }

    function animation(key, { from, to, duration, action }) {
        return new Promise((res, rej) => {
            animations[key] = {
                from,
                to,
                duration,
                action,
                start: Date.now(),
                resolve: res
            }
        });
    }

    function getCssVar(name) {
        return window.getComputedStyle(document.body).getPropertyValue(name);
    }

    function degToRad(deg) {
        return (deg / 180) * Math.PI;
    }

    return {
        start
    };
}