(() => {

    async function main() {
        
        const { start: logoStart } = logo();
        await logoStart();

        const { start: startLumonal } = lumonal();
        const roloFilename = await startLumonal();

        const { start: roloStart } = rolodex(roloFilename);
        const filename = await roloStart();

        const { start: startTempers } = tempers();
        startTempers(filename);

    }

    
    let once = false;
    document.fonts.onloadingdone = () => {
        if (!once) {
            once = true;
            main();
        }
    };

})();