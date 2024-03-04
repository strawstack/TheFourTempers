(() => {

    function getCssVar(name) {
        return window.getComputedStyle(document.body).getPropertyValue(name);
    }

    function main() {

        // Filesystem
        const fs = filesystem();

        // Canvas
        const canvas = document.querySelector("canvas.screen");
        canvas.width = parseInt(getCssVar("--screen-width"), 10);
        canvas.height = parseInt(getCssVar("--screen-height"), 10);
        const ctx = canvas.getContext("2d");

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