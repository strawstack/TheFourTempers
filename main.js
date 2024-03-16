(async () => {

    async function main() {
        
        const params = new URLSearchParams(window.location.search);
        let filename = params.get('fn');
        
        if (filename === null) {
            const { start: startLumonal, boot: bootLumonal } = lumonal();

            await bootLumonal();
    
            const { start: logoStart } = logo();
            await logoStart();
            
            const roloFilename = await startLumonal();
    
            const { start: roloStart } = rolodex(roloFilename);
            filename = await roloStart();
        }

        const { start: startTempers } = tempers();
        startTempers(filename);

    }

    await document.fonts.ready;
    main();

})();