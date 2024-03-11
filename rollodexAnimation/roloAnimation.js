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

    async function start() {
        
        state.targetIndex = names.indexOf('Siena');
        const preSize = 27; 
        state.startIndex = Math.max(0, state.targetIndex - preSize);

        state.flipSpeedPerCard = 400;
        state.cardDuration = 1 / names.length;
        
        state.flipStartPercent = state.startIndex * state.cardDuration;
        state.flipEndPercent = state.targetIndex * state.cardDuration;
        state.flipDuration = (state.targetIndex - state.startIndex) * state.flipSpeedPerCard;

        state.screenWidth = parseInt(getCssVar("--screen-width"), 10);
        state.screenHeight = parseInt(getCssVar("--screen-height"), 10);
        
        state.roloWidth = parseInt(getCssVar("--rolo-width"), 10);
        state.roloHeight = parseInt(getCssVar("--rolo-height"), 10);
        
        state.roloScale = parseFloat(getCssVar("--rolo-scale"));
        state.roloOpacity = parseFloat(getCssVar("--rolo-opacity"));

        state.roloCardHeight = parseInt(getCssVarCalc(
            document.querySelector(".copy-top-card"), 
            "height"
        ), 10);

        state.copyBotCardTop = parseInt(getCssVarCalc(
            document.querySelector(".copy-bot-card"), 
            "top"
        ), 10);

        state.pillCount = 10;

        state.tabContainerHeight = parseInt(getCssVar("--rolo-tab-container-height"));

        state.roloContainerRef = document.querySelector(".rolodex-container");

        state.copyTopCardRef = document.querySelector(".copy-top-card");
        state.copyBotCardRef = document.querySelector(".copy-bot-card");

        state.topCardCardNameRef = document.querySelector(".top-card .card-name");
        state.copyTopCardCardNameRef = document.querySelector(".copy-top-card .card-name");

        state.topTabRef = document.querySelectorAll(".top-card .top-tab-container .tab");
        state.topTabLetterRef = document.querySelectorAll(".top-card .top-tab-container .tab-letter");

        state.botTabRef = document.querySelectorAll(".bot-card .bot-tab-container .tab");
        state.botTabLetterRef = document.querySelectorAll(".bot-card .bot-tab-container .tab-letter");

        state.copyTopTabRef = document.querySelectorAll(
            ".copy-top-card .top-tab-container .tab"
        );
        state.copyTopTabLetterRef = document.querySelectorAll(
            ".copy-top-card .top-tab-container .tab-letter"
        );

        state.copyBotTabRef = document.querySelectorAll(
            ".copy-bot-card .bot-tab-container .tab"
        );

        state.roloWheelHeight = parseInt(getCssVar("--rolo-wheel-height"), 10);
        state.roloPillHeight = parseInt(getCssVar("--rolo-pill-height"), 10);
        state.leftWheelRef = document.querySelector(".left-wheel");
        state.rightWheelRef = document.querySelector(".right-wheel");
        
        // Set up wheel pills
        state.pillsLeft = Array(state.pillCount).fill(null).map((e, i) => {
            const pill = makePill(state.leftWheelRef);            
            return pill;
        });

        state.pillsRight = Array(state.pillCount).fill(null).map((e, i) => {
            const pill = makePill(state.rightWheelRef);            
            return pill;
        });

        window.requestAnimationFrame(calculate);

        animation("zoom", {
            from: state.roloScale,
            to: 1,
            action: scale => {
                const convert = 1 / (1 - state.roloScale);
                const easeOutScale = easeOutExpo(
                    (scale - state.roloScale) * convert
                ) / convert + state.roloScale;
                state.roloContainerRef.style.transform = `scale(${easeOutScale}, ${easeOutScale})`;
            },
            duration: state.flipDuration
        });

        animation("opacity", {
            from: state.roloOpacity,
            to: 1,
            action: opacity => {
                state.roloContainerRef.style.opacity = opacity;
            },
            duration: state.flipDuration / 4
        });

        let turnContinue = true;
        const turnLeft = async duration => {
            const slice = Math.PI / state.pillCount;
            await animation("leftWheel", {
                from: 0,
                to: slice,
                action: n => {
                    if (turnContinue) {
                        setPillsWithOffset(state.pillsLeft, slice, n);
                    }
                },
                duration
            });
            if (turnContinue) turnLeft(duration);
        };

        const turnRight = async duration => {
            const slice = Math.PI / state.pillCount;
            await animation("rightWheel", {
                from: 0,
                to: slice,
                action: n => {
                    if (turnContinue) {
                        setPillsWithOffset(state.pillsRight, slice, n);
                    }
                },
                duration
            });
            if (turnContinue) turnRight(duration);
        };

        turnLeft(state.cardDuration * state.flipDuration);
        turnRight(state.cardDuration * state.flipDuration);

        await animation("flip", {
            from: state.flipStartPercent,
            to: state.flipEndPercent,
            action: n => {
                /*
                const convert = 1 / (state.flipEndPercent - state.flipStartPercent);
                const easeN = easeOutExpo(
                    (n - state.flipStartPercent) * convert
                ) / convert + state.flipStartPercent; */
                flip(n);
            },
            duration: state.flipDuration
        });

        turnContinue = false;

    }

    function setPillsWithOffset(pills, slice, offset) {
        pills.forEach((pill, i) => {
            const rad = (state.roloWheelHeight - state.roloPillHeight) / 2;
            const x =  rad * Math.cos((i + 1) * slice + offset);
            const pos = -1 * x + rad;
            pill.style.top = `${pos}px`;
        });
    }

    function makePill(parentRef) {
        const pill = document.createElement("div");
        pill.className = "pill";
        parentRef.appendChild(pill);
        return pill;
    }

    // n is between 0 and 1
    // Show the correct flip progress
    function flip(n) {
        const cardValue = n / state.cardDuration;
        const cardIndex = Math.floor(cardValue);

        if (names.length - 1 < cardIndex) return;

        const tabCardPriorCount = names.slice(0, cardIndex).reduce((a, c) => {
            return a + ((typeof(c) !== "string") ? 1 : 0);
        }, 0);

        const baseTabOffset = 2;  
        const topTabIndex = (baseTabOffset + tabCardPriorCount) % 4;
                
        setCopyTab(cardIndex, topTabIndex);

        const cardProgress = cardValue - cardIndex;
        scaleCopyCards(cardProgress);

        raiseNextTabs(cardIndex, topTabIndex, cardProgress);
        
        const tabCardPriorCountBot = tabCardPriorCount + (
            (typeof(names[cardIndex]) !== "string") ? 1 : 0
        );
        const botTabIndex = (baseTabOffset + tabCardPriorCountBot) % 4;
        lowerPrevTabs(cardIndex, botTabIndex - 1, 1 - cardProgress);

        // Set current filename
        const cardData = names[cardIndex];
        state.copyTopCardCardNameRef.innerHTML = (typeof(cardData) !== "string") ? "" : cardData;

        if (cardIndex === names.length -1) {
            state.topCardCardNameRef.innerHTML = "";

        } else {
            // Set next filename
            if (cardIndex + 1 < names.length) {
                const nextCardData = names[cardIndex + 1];
                state.topCardCardNameRef.innerHTML = (typeof(nextCardData) !== "string") ? "" : nextCardData;
            }
        }
    }

    function lowerPrevTabs(cardIndex, botTabIndex, cardProgress) {
        state.botTabRef.forEach(tab => tab.style.display = 'none');
        let tabCount = -1;
        const reach = 4;

        // For cards within reach...
        for (let i = 0; i < reach; i++) {
            if (cardIndex - i >= 0) {
                const cardData = names[cardIndex - i];

                // ... if they are a tab...
                if (typeof(cardData) !== "string") {
                    tabCount += 1; // ... track tabCount to calc correct tab index 
                    const mod = (botTabIndex - tabCount) % 4;
                    const tabIndex = (mod < 0) ? mod + 4 : mod;

                    // ... only display next tab if it is not currently fliping 
                    if (i > 0) {
                        state.botTabRef[tabIndex].style.removeProperty("display");
                    }
                    
                    // Scale tab as it appears or hold it at 1 until it falls
                    const scale = (i < reach - 1) ? 1 : cardProgress;
                    const bot = (state.tabContainerHeight - state.tabContainerHeight * scale) / 2;
                    state.botTabRef[tabIndex].style.bottom = `${bot}px`;
                    state.botTabRef[tabIndex].style.transform = `scale(1, ${scale})`;
                }
            }
        }
    }

    function raiseNextTabs(cardIndex, topTabIndex, cardProgress) {
        state.topTabRef.forEach(tab => tab.style.display = 'none');
        let tabCount = -1;
        const reach = 4;

        // For cards within reach...
        for (let i = 0; i < reach; i++) {
            if (cardIndex + i < names.length) {
                const cardData = names[cardIndex + i];

                // ... if they are a tab...
                if (typeof(cardData) !== "string") {
                    tabCount += 1; // ... track tabCount to calc correct tab index 
                    const tabIndex = (topTabIndex + tabCount) % 4;

                    // ... only display next tab if it is not currently fliping 
                    if (i > 0) {
                        state.topTabRef[tabIndex].style.removeProperty("display");
                    }
                    
                    // Scale tab as it appears or hold it at 1 until it falls
                    const scale = (i < reach - 1) ? 1 : cardProgress;
                    const top = (state.tabContainerHeight - state.tabContainerHeight * scale) / 2;
                    state.topTabRef[tabIndex].style.top = `${top}px`;
                    state.topTabRef[tabIndex].style.transform = `scale(1, ${scale})`;
                    state.topTabLetterRef[tabIndex].innerHTML = cardData.tab;
                }
            }
        }
    }

    function scaleCopyCards(cardProgress) {
        const half = 0.5;
        if (cardProgress < half) {
            state.copyBotCardRef.style.display = 'none';
            state.copyTopCardRef.style.removeProperty("display");
            const progress = 2 * cardProgress;
            const scale = 1 - progress;
            const top = (state.roloCardHeight - state.roloCardHeight * scale) / 2;
            state.copyTopCardRef.style.top = `${top}px`;
            state.copyTopCardRef.style.transform = `scale(1, ${scale})`;

        } else {
            state.copyTopCardRef.style.display = "none";
            state.copyBotCardRef.style.removeProperty("display");
            const scale = 2 * (cardProgress - half);
            const top = state.copyBotCardTop - (
                (state.roloCardHeight - state.roloCardHeight * scale) / 2
            );
            state.copyBotCardRef.style.top = `${top}px`;
            state.copyBotCardRef.style.transform = `scale(1, ${scale})`;

        }
        
    }

    // Set the currently flipping tab letter 
    function setCopyTab(cardIndex, tabIndex) {
        const cardData = names[cardIndex];
        
        const tab = state.copyTopTabRef[tabIndex];
        const botTab = state.copyBotTabRef[tabIndex];
        
        state.copyTopTabRef.forEach(tab => tab.style.display = 'none');
        state.copyBotTabRef.forEach(tab => tab.style.display = 'none');
        
        if (typeof(cardData) !== "string") { // tab
            
            tab.style.removeProperty("display");
            botTab.style.removeProperty("display");

            tab.innerHTML = cardData.tab;
        }
    }

    function easeOutQuad(x) {
        return 1 - (1 - x) * (1 - x);    
    }

    function easeOutExpo(x) {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);   
    }

    function getCssVarCalc(element, propertyName) {
        return window.getComputedStyle(element).getPropertyValue(propertyName);
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