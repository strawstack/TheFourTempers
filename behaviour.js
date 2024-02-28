function behaviour(state) {

    function randomFactory(hash) {
        let index = 0;
        function getRandom() {
            index = (index + 1) % hash.length;
            const index2 = (index + 2) % hash.length;
            return parseInt(`${hash[index]}${hash[index2]}`, 16) / 256; // Returns [0 to 1) (precision 1/255)
        }
        return getRandom;
    }

    function distribute(amount, lst) {
        const clst = [...lst];
        let index = 0;
        while (amount > 0) {
            const value =  Math.min(amount, Math.floor(state.getRandom() * 5) + 1) // 1 to 5 (max current amount)
            clst[index] += value;
            amount -= value;
            index = (index + 1) % clst.length;
        }
        return clst;
    }

    function prefixSum(lst) {
        const clst = [...lst];
        let total = 0;
        for (let i = 0; i < clst.length; i++) {
            const value = total;
            total += clst[i];
            clst[i] += value;
        }
        return clst;
    }

    function randBetween(a, b) { // [a, b) exclusive
        return a + Math.floor(state.getRandom() * (b - a));
    }

    function calcBehaviour() {
        const SPAN_SIZE = 5;

        // Calculate behaviour data
        const FILENAME = "FileName"; 
        const hash = Array(10).fill(null).map((e, i) => CryptoJS.SHA256(`${FILENAME}${i}`).toString()).join("");
        state.getRandom = randomFactory(hash);

        // Fill out groupSpans and other behaviour state
        const col_dividers = distribute(20, Array(3).fill(0));
        const row_dividers = distribute(10, Array(2).fill(0));

        function calcGroupsSpans(col_div, row_div) {
            let colPrefix = [0, ...prefixSum(col_div)];
            let rowPrefix = [0, ...prefixSum(row_div)];
            
            const groupSpans = [];
            Array(3).fill(null).forEach((e, yi) => {
                const spans = [];
                Array(4).fill(null).forEach((e, xi) => {
                    spans.push({
                        x: colPrefix[xi] + xi * SPAN_SIZE,
                        y: rowPrefix[yi] + yi * SPAN_SIZE
                    });
                });
                groupSpans.push(spans);
            });
            return groupSpans;
        }

        // 2D array (4 col x 3 row) of top left coord for each 5x5 span 
        state.groupSpans = calcGroupsSpans(col_dividers, row_dividers);

        function createGroup({x, y}) {
            const GROUP_LIMIT = 15;
            let count = GROUP_LIMIT;

            const numRows = randBetween(3, SPAN_SIZE + 1); // [3 to 5]
            
            // Each row takes up min one digit
            count -= numRows;

            // How many digits in each row
            const rowLengths = Array(numRows).fill(null).map(e => {
                const length = randBetween(1, Math.min(
                    Math.max(2, count), // Ensure always at least one digit in row
                    SPAN_SIZE + 1
                ));
                count -= length;
                return length;
            });

            let prevOffset = 0;
            const rowOffsets = rowLengths.map((size, i) => { 
                const prevSize = (i - 1 < 0) ? SPAN_SIZE : rowLengths[i - 1];
                const offset = randBetween(
                    Math.max(0, (prevOffset - size) + 1),
                    Math.min(SPAN_SIZE - size + 1, prevOffset + prevSize)
                );
                prevOffset = offset;
                return offset;
            });

            const startRow = Math.floor(state.getRandom() * (SPAN_SIZE - numRows + 1));

            const cube = Array(5).fill(null).map(e => Array(5).fill('O'));
            for (let r = startRow; r < startRow + numRows; r++) {
                for (let c = rowOffsets[r]; c < rowOffsets[r] + rowLengths[r]; c++) {
                    cube[r][c] = '#';
                }
            }

            console.log(cube.map(row => row.join("")).join("\n"));
        }

        function calcGroups(spans) {
            const groups = [];
            spans.forEach(row => {
                row.forEach(({x, y}) => {
                    groups.push(
                        createGroup({x, y})
                    );
                });
            });
        }

        // Array of objects {main, digit_lookup}
        // main is {x, y} for the main digit of the group
        // digit lookup is an array of 3 to 5 rows of digits
        // that form a contigious blob inside a span
        state.groups = calcGroups(state.groupSpans);

        
    }

    return {
        calcBehaviour
    };

}
