function animation() {
    const animations = {};

    function animate(key, {from, to, action, interpolate, duration}, signal) {
        if (interpolate === undefined) interpolate = (from, to, percent) => {
            const interval = to - from;
            return from + percent * interval;
        };

        return new Promise((resolve, rej) => {

            if (signal !== undefined && signal.aborted) {
                // return Promise.reject(new DOMException('Aborted', 'AbortError'));
                resolve();
            }

            animations[key] = {
                from,
                to,
                action,
                interpolate,
                duration,
                resolve,
                start: document.timeline.currentTime
            };

            // Listen for abort event on signal
            if (signal !== undefined) {
                signal.addEventListener('abort', () => {
                    rej(new DOMException('Aborted', 'AbortError'));
                });
            }
        });


    }

    return {
        animations,
        animate
    };
}