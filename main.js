(async () => {

    async function main() {
        
        const { start: startLumonal, boot: bootLumonal } = lumonal();

        await bootLumonal();

        const { start: logoStart } = logo();
        await logoStart();
        
        const roloFilename = await startLumonal();

        const { start: roloStart } = rolodex(roloFilename);
        const filename = await roloStart();

        const { start: startTempers } = tempers();
        startTempers(filename);

    }

    await document.fonts.ready;
    main();

})();