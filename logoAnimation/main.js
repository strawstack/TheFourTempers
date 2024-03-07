(() => {

    function getCssVar(name) {
        return window.getComputedStyle(document.body).getPropertyValue(name);
    }

    async function main() {

        // Canvas
        const canvas = document.querySelector(".screen>canvas");

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

        console.log("done");

    }

    let once = false;
    document.fonts.onloadingdone = () => {
        if (!once) {
            once = true;
            main();
        }
    };
    
})();