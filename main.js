(() => {

    async function main() {
        
        const { start: logoStart } = logo();
        await logoStart();

        const { start: startLumonal } = lumonal();
        const filename = await startLumonal();

        

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