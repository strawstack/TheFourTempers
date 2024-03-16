function sendBinAnimation(state, { sub, mag, calcMagnification, wait }, animate, animations, toggleBin) {

    async function sendBin(activeBin) {

        const activeBinNumber = parseInt(activeBin, 10) - 1; 
    
        // Start binAnimation (freeze inputs)
        state.sendBinAnimation = true;
    
        // Save selected digits to re-show later
        const selectedDigits = Object.keys(state.selected).map(k => state.allDigits[k]);
    
        // Wipe specified state
        state.mouseDown = false;
        state.currentVelocity = {x: 0, y: 0};
        "wasd".split("").forEach(c => state.isKeyDown[c] = false);
        
        function find(lst, condition) {
            for (let e of lst) {
                if (condition(e)) {
                    return e;
                }
            }
            return undefined;
        }

        // Check correctness
        const isCorrect = () => {

            const selected = Object.keys(state.selected);

            // selection containes a main digit
            const mainDigit = find(selected, k => k in state.mainDigits);
            if (mainDigit === undefined) return false;

            // main digit from selection matches bin
            if (!state.binToGroupKey[activeBin].includes(mainDigit)) return false;

            // get selection digits
            const { digits } = find(state.groups, g => g.digits[g.main].ref.dataset.key === mainDigit);

            // digits and selection are same length
            if (digits.length !== selected.length) return false;
            
            // all digits present in selection
            if (!digits.every(d => d.ref.dataset.key in state.selected)) return false;

            return true;
        };
        const correct = isCorrect();
    
        // Clone numbers
        const clones = [];
        for (let digit of selectedDigits) {
            const digitRect = digit.getBoundingClientRect();
            const screenRect = state.screen.getBoundingClientRect();
            const { x: left, y: top } = sub(
                {x: digitRect.left, y: digitRect.top},
                {x: screenRect.left, y: screenRect.top}
            );
            const cloneDigit = digit.cloneNode(true);
            cloneDigit.style.position = 'absolute';
            cloneDigit.style.top = `${top}px`;
            cloneDigit.style.left = `${left}px`;
            cloneDigit.style.zIndex = `5`;
            state.screen.appendChild(cloneDigit);
            clones.push(cloneDigit);
        }
    
        function floatFromPixels(pxs) {
            return parseFloat(pxs.slice(0, pxs.length - 2));
        }
    
        const { cellSize } = state.zoom_lookup[state.zoomLevel];
    
        // Animate numbers
        await Promise.all(clones.map(clone => {
    
            const fromX = floatFromPixels(clone.style.left);
            const fromY = floatFromPixels(clone.style.top);
            const toX = state.BIN_GAP_OUTER + state.BIN_WIDTH/2 + (activeBin - 1) * (state.BIN_GAP_INNER + state.BIN_WIDTH) - cellSize/2;
            const toY = state.TOP_BOT_HEIGHT + state.DIVIDER_HEIGHT + state.MID_HEIGHT + cellSize;
            
            return animate(`clone-${clone.dataset.key}`, {
                from: {
                    x: fromX,
                    y: fromY
                },
                to: {
                    x: toX,
                    y: toY
                },
                action: ({x: left, y: top}) => { // modify state from animation value
                    clone.style.top = `${top}px`;
                    clone.style.left = `${left}px`;
                },
                interpolate: (from, to, percent) => { // interpolate between start and end values
                    const { x: fx, y: fy } = from;
                    const { x: tx, y: ty } = to;
                    const intervalX = tx - fx;
                    const intervalY = ty - fy;
    
                    function easeOutQuart(p, delta) {
                        return delta * (1 - Math.pow(1 - p, 4));   
                    }
    
                    return {
                        x: fx + easeOutQuart(percent, intervalX),
                        y: fy + percent * intervalY,
                    };
                },
                duration: mag(sub({x: toX, y: toY}, {x: fromX, y: fromY})) / 240 * 1000 // px per sec
            });
        }));
    
        clones.forEach(e => e.remove());
    
        // If correct modify totals
        if (correct) {
            const mainDigit = find(Object.keys(state.selected), k => k in state.mainDigits);
            if (!(mainDigit in state.stats[state.FILENAME]["collected"])) {
                state.stats[state.FILENAME]["collected"][mainDigit] = true;
                const { digits } = find(state.groups, g => g.digits[g.main].ref.dataset.key === mainDigit);
                digits.forEach(d => {
                    const value = state.allSpans[d.ref.dataset.key].innerHTML;
                    state.stats[state.FILENAME]["bins"][activeBinNumber].cur[value] += 1;
                });
            }

            // Switch non-special digits back to normal animation pattern
            const { digits } = state.mainDigits[mainDigit];
            for (let { ref } of digits) {
                const dkey = ref.dataset.key;
                
                // Cancel animation and promise
                delete animations[`base_${dkey}`];
                if (`base_${dkey}` in state.controllers) {
                    state.controllers[`base_${dkey}`].abort();
                    delete state.controllers[`base_${dkey}`];
                };

                state.isSpecial = {};
            }
            
        } else {
            console.log("no...");

        }
    
        // Wipe selection
        state.selected = null;

        await wait(500);
    
        // Pop dialogue
        await animate("dialogue", {
            from: state.POPUP_TOP_OFFSET + state.POPUP_HEIGHT,
            to: state.POPUP_TOP_OFFSET,
            action: n => {
                state.popupHeight[activeBinNumber] = n;
            },
            duration: 500
        });
    
        await wait(1000);
    
        // Re-display numbers
        selectedDigits.map(d => {
            return animate(d.dataset.key, {
                from: 0,
                to: 1,
                action: n => {
                    d.style.opacity = n;
                },
                duration: 1000
            });
        });
    
        // Close dialogue
        await animate("dialogue", {
            from: state.POPUP_TOP_OFFSET,
            to: state.POPUP_TOP_OFFSET + state.POPUP_HEIGHT,
            action: n => {
                state.popupHeight[activeBinNumber] = n;
            },
            duration: 500
        });
    
        state.sendBinAnimation = false; // all animations complete
    
        // Update mouse position
        calcMagnification(state.mouse);
    
        await wait(500);
    
        // close bin
        if (!state.sendBinKeyState) {
            state.isKeyDown[activeBin] = false;
            toggleBin(activeBin, false);
        }
    }

    return {
        sendBin
    };
}

