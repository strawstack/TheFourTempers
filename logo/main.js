function logo() {

    function getCssVar(name) {
        return window.getComputedStyle(document.body).getPropertyValue(name);
    }

    async function start() {

        const screen = document.querySelector(".logo-screen");
        screen.style.removeProperty("display");

        // Canvas
        const canvas = document.querySelector(".logo-screen>.logocanvas");

        const scale = window.devicePixelRatio;
        canvas.width = Math.floor(scale * parseInt(getCssVar("--screen-width"), 10));
        canvas.height = Math.floor(scale * parseInt(getCssVar("--screen-height"), 10));

        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);

        const { start } = logoAnimation({ canvas, ctx, size: {
            WIDTH: parseInt(getCssVar("--screen-width"), 10),
            HEIGHT: parseInt(getCssVar("--screen-height"), 10)
        }});

        await start();

        return null; // back to global main
    }

    return {
        start
    };
    
}