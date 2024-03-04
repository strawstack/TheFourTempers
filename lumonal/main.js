(() => {

    function getCssVar(name) {
        return window.getComputedStyle(document.body).getPropertyValue(name);
    }

    function main() {

        // Filesystem
        const fs = filesystem();

        // Canvas
        const canvas = document.querySelector("canvas.screen");

        const scale = window.devicePixelRatio;
        canvas.width = Math.floor(scale * parseInt(getCssVar("--screen-width"), 10));
        canvas.height = Math.floor(scale * parseInt(getCssVar("--screen-height"), 10));

        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);

        // TextArea
        const ta = textarea({ canvas, ctx });

        // Terminal
        const ter = terminal({ canvas, ctx, ta });

        // Bash
        bash({ fs, ter });

    }

    let once = false;
    document.fonts.onloadingdone = () => {
        if (!once) {
            once = true;
            main();
        }
    };
})();