function animation() {

    const animations = {};

    function animate(key, {from, to, action, interpolate, duration}) {
        if (interpolate === undefined) interpolate = (from, to, percent) => {
            const interval = to - from;
            return from + percent * interval;
        };

        return new Promise((resolve, rej) => {
            animations[key] = {
                from,
                to,
                action,
                interpolate,
                duration,
                resolve,
                start: document.timeline.currentTime
            };
        });


    }

    return {
        animations,
        animate
    };
}