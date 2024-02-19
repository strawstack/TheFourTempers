(() => {
    
    // The current font size
    let fSize = 1.5;

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

    function fontSize(rem) {
        document.querySelectorAll(".digit").forEach(e => {
            e.style.fontSize = `${rem}rem`;
        });

    }

    // debug font size
    window.addEventListener("keydown", e => {
        const {key} = e;
        if (key === "ArrowUp") {
            fSize += 0.25;
            fSize = Math.min(8, fSize);
            fontSize(fSize);

        } else if (key === "ArrowDown") {
            fSize -= 0.25;
            fSize = Math.max(1.5, fSize);
            fontSize(fSize);
        }
    })

})();


