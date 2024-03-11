function lumonal() {

    function getCssVar(name) {
        return window.getComputedStyle(document.body).getPropertyValue(name);
    }

    async function start() {

        return new Promise((res, rej) => {
            // Filesystem
            const fs = filesystem();

            // Canvas
            const canvas = document.querySelector("canvas.lumonal-screen");
            canvas.style.removeProperty("display");

            const scale = window.devicePixelRatio;
            canvas.width = Math.floor(scale * parseInt(getCssVar("--screen-width"), 10));
            canvas.height = Math.floor(scale * parseInt(getCssVar("--screen-height"), 10));

            const ctx = canvas.getContext("2d");
            ctx.scale(scale, scale);

            // TextArea
            const ta = textarea({ canvas, ctx });

            // Terminal
            const ter = terminal({ canvas, ctx, ta, resolve: res });

            // Bash
            bash({ fs, ter });
        });

    }

    return {
        start
    };

}