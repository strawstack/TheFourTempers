(() => {

    function getCssVar(name) {
        return window.getComputedStyle(document.body).getPropertyValue(name);
    }

    async function main() {

        

    }

    let once = false;
    document.fonts.onloadingdone = () => {
        if (!once) {
            once = true;
            main();
        }
    };
    
})();