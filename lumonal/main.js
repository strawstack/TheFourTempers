function lumonal() {

    function getCssVar(name) {
        return window.getComputedStyle(document.body).getPropertyValue(name);
    }

    async function boot() {

        // Canvas
        const canvas = document.querySelector("canvas.lumonal-screen");
        canvas.style.removeProperty("display");

        const scale = window.devicePixelRatio;
        canvas.width = Math.floor(scale * parseInt(getCssVar("--screen-width"), 10));
        canvas.height = Math.floor(scale * parseInt(getCssVar("--screen-height"), 10));

        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);

        // TextArea
        const { write, size } = textarea({ canvas, ctx });

        return new Promise( async (resolve, rej) => {
            
            const bootText = getBootText();

            const writeText = async () => {
                for (let y = 0; y < bootText.length; y++) {
                    for (let x = 0; x < bootText[y].length; x++) {
                        write(y, x, bootText[y][x]);
                        await wait(2);
                    }
                }
            };

            await writeText();

            await wait(250);
            ctx.clearRect(0, 0, size.WIDTH, size.HEIGHT);
            await wait(250);
            
            canvas.style.display = 'none';
            resolve();

        });
    }

    async function start() {

        return new Promise((res, rej) => {
            // Filesystem
            const fs = filesystem();

            const macrodataModeInit = true;

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
            const ter = terminal({ canvas, ctx, ta, macrodataModeInit,
                resolve: filename => {
                    canvas.style.display = 'none';
                    res(filename);
                }
            });

            // Bash
            bash({ fs, ter, macrodataModeInit });
        });

    }

    async function wait(ms) {
        return new Promise((res, rej) => setTimeout(res, ms));
    }  

    function getBootText() {
        return [
            "LUMON OS",
            "ParseElements: Keyboard: 0 digitizer: 12 pointer: 0 0 scroll: 0 led: 0",
            "GPU Initalized: Control ID 16",
            "startupTask",
            "Video has output: streams: 1",
            "Reuse output buffer Index:2 dev:Code Output offset:184000 size:20800",
            "Audio has output streams 1",
            "DisableInput = 0",
            "portType = 3",
            "skipCached = 0",
            "PortType: 3, Length: 128",
            "Network Stack = 1",
            "User Authentication Module = 1",
            "Power Management: Wired",
            "Initializing: Macrodata Refinement",
            "Updating System... 100% Complete"
        ];
    }

    return {
        boot,
        start
    };

}