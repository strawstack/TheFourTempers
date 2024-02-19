(() => {
    
    function createDigit(n) {
        if (n === undefined) n = Math.floor(Math.random() * 10);
        const d = document.createElement("div");
        d.className = "digit";
        d.innerHTML = n;
        return d;
    }
    
    function main() {
        
        const dc = document.querySelector(".digit-container");
        
        Array(64 * 23).fill(null).forEach(e => {
            dc.appendChild(
                createDigit()
            );
        });

    }

    let once = false;
    document.fonts.onloadingdone = () => {
        if (!once) {
            once = true;
            main();
        }
    };

})();


