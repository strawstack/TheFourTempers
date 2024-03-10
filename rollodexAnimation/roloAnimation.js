function roloAnimation(names) {

    const state = {};
    const animations = {};

    function calculate(timestamp) {

        for (let key in animations) {
            const { start, from, to, duration, action, resolve } = animations[key];
            const elapsed = Date.now() - start;
            if (elapsed >= duration) {
                delete animations[key];
                action(to);
                resolve();

            } else {
                const delta = to - from;
                const progress = from + delta * (elapsed / duration);
                action(progress);

            }
        }
        
        render();
        window.requestAnimationFrame(calculate);
    }

    function render() {

    }

    function start() {
        
        state.screenWidth = parseInt(getCssVar("--screen-width"), 10);
        state.screenHeight = parseInt(getCssVar("--screen-height"), 10);
        
        state.roloWidth = parseInt(getCssVar("--rolo-width"), 10);
        state.roloHeight = parseInt(getCssVar("--rolo-height"), 10);
        
        state.roloScale = parseFloat(getCssVar("--rolo-scale"));
        state.roloOpacity = parseFloat(getCssVar("--rolo-opacity"));

        state.roloContainerRef = document.querySelector(".rolodex-container");

        //state.topCardRef = document.querySelector(".top-card");
        state.copyTopCardRef = document.querySelector(".copy-top-card");

        state.topTabLetterRef = document.querySelectorAll(".top-card .top-tab-container .tab-letter");
        state.copyTopTabRef = document.querySelectorAll(
            ".copy-top-card .top-tab-container .tab"
        );
        
        state.copyTopTabLetterRef = document.querySelectorAll(
            ".copy-top-card .top-tab-container .tab-letter"
        );

        state.cardDuration = 1 / names.length;

        window.requestAnimationFrame(calculate);

        /*
        animation("zoom", {
            from: state.roloScale,
            to: 1,
            action: scale => {
                state.roloContainerRef.style.transform = `scale(${scale}, ${scale})`;
            },
            duration: 6000
        });

        animation("opacity", {
            from: state.roloOpacity,
            to: 1,
            action: opacity => {
                state.roloContainerRef.style.opacity = opacity;
            },
            duration: 4000
        }); */

        // dev
        state.roloContainerRef.style.transform = `scale(${1}, ${1})`;
        state.roloContainerRef.style.opacity = 1;

        animation("flip", {
            from: 0,
            to: 1,
            action: n => {
                flip(n);
            },
            duration: 10000
        });

    }

    // n is between 0 and 1
    // Show the correct flip progress
    function flip(n) {

        const cardValue = n / state.cardDuration;
        const cardIndex = Math.min(names.length - 1, Math.floor(cardValue));
        const tabCardPriorCount = names.slice(0, cardIndex).reduce((a, c) => {
            return a + ((typeof(c) !== "string") ? 1 : 0);
        }, 0);
        const cardProgress = cardValue - cardIndex;
        
        const baseTabOffset = 2;  
        const topTabIndex = (baseTabOffset + tabCardPriorCount) % 4;
        
        setCopyTopTab(cardIndex, topTabIndex);

        // which card is showing
        // tells us the text value of the ui
        // and which of the 1 - 4 tabs is shown

        // and how progressed is the card
        // scale size for copy 

        // On top next tab shows if three or less away
        // Bottom is reverse

    }

    // Set the currently flipping tab letter 
    function setCopyTopTab(cardIndex, topTabIndex) {
        const cardData = names[cardIndex];
        const tab = state.copyTopTabRef[topTabIndex];
        if (typeof(cardData) !== "string") { // tab
            state.copyTopTabRef.forEach(tab => tab.style.display = 'none');
            tab.style.removeProperty("display");
            tab.innerHTML = cardData.tab;
        }
    }

    function easeOutExpo(x) {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);   
    }

    function getCssVar(name) {
        return window.getComputedStyle(document.body).getPropertyValue(name);
    }

    function animation(key, { from, to, duration, action }) {
        return new Promise((res, rej) => {
            animations[key] = {
                from, 
                to, 
                duration,
                action,
                start: Date.now(),
                resolve: res
            };
        });
    }

    return {
        start
    };
}

// _ _ A B
// C D E F
// G H I J
// K L M N 
// O P Q R
// S T U V
// W X Y Z