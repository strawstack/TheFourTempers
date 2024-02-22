const animations = {};
function animation() {

    function animate(key, {from, to, action, interpolate, duration, done}) {
        if (interpolate === undefined) interpolate = (from, to, percent) => {
            const interval = to - from;
            return from + percent * interval;
        };
        animations[key] = {
            from,
            to,
            action,
            interpolate,
            duration,
            done,
            start: document.timeline.currentTime
        };
    }

    return {
        animate
    };
}