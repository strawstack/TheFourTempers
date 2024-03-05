function terminal({ canvas: canvasElement, ctx, ta: textarea }) {
    const { write: textAreaWrite, draw, size } = textarea;

    function getCssVar(name) {
        return window.getComputedStyle(document.body).getPropertyValue(name);
    }

    const cursor = {
        row: 0,
        col: 0
    };

    const color = {
        cursor: "rgba(255, 255, 255, 0.25)", // white translucent
        clear: getCssVar("--black")
    };

    let cmd_index = 0;
    const cmd = [[]]; // Array of arrays of commands

    let path = "/";

    // Set inside writePrompt
    const cmdStart = {
        row: 0,
        col: 0
    };

    let scrollY = 0;
    const char_lookup = {};

    const selection = { // Set by mousedown/mousemove events
        isMousedown: false,
        mousedown: {row: null, col: null},
        prev: {row: null, col: null},
        current: {row: null, col: null}
    };

    const hash = pos => {
        return JSON.stringify(pos);
    };

    const restoreChar = (row, col) => {
        const h = hash({row: row + scrollY, col});
        if (h in char_lookup) {
            textAreaWrite(row, col, char_lookup[h]);
        }
    };

    const write = (row, col, char) => {
        char_lookup[hash({row: row + scrollY, col})] = char;
        textAreaWrite(row, col, char);
    };

    const eq = (a, b) => {
        return a.row === b.row && a.col === b.col;
    };

    const charAtCursor = () => {
        let index = 0;
        const cp = {...cmdStart};
        while (index < cmd[cmd_index].length) {
            if (eq(cp, cursor)) {
                return cmd[cmd_index][index];
            }
            cp.col += 1;
            index += 1;
            if (cp.col >= size.cols) {
                cp.row += 1;
                cp.col = 0;
            }
        }
        return " ";
    };

    const cursorPosFromOffset = (pos, offset) => {
        let count = offset;
        const cpos = {...pos};
        while (count > 0) {
            cpos.col += 1;
            if (cpos.col >= size.cols) {
                cpos.row += 1;
                cpos.col = 0;
            }
            count -= 1;
        }
        return cpos;
    };

    // Distance from position a to position b
    const distance = (a, b) => {
        let count = 0;
        const ca = {...a};
        const cb = {...b};
        while (!eq(ca, cb)) {
            ca.col += 1;
            if (ca.col >= size.cols) {
                ca.row += 1;
                ca.col = 0;
            }
            count += 1;
        }
        return count;
    };

    const nextTypeChangeFromCursor = direction => {
        const SPACE = " ";
        const LEFT = -1;
        const RIGHT = 1;
        let index = distance(cmdStart, cursor);
        while (true) {
            index += direction;

            if (direction === LEFT && index <= 0) break;
            if (direction === RIGHT && index >= cmd[cmd_index].length - 1) break;

            if (direction === LEFT) {
                const next = index + direction;
                if (cmd[cmd_index][index] !== SPACE && cmd[cmd_index][next] === SPACE) {
                    break;
                }

            } else { // direction === RIGHT
                if (cmd[cmd_index][index] === SPACE && cmd[cmd_index][index - 1] !== SPACE) {
                    break;
                }
            }
        }
        index = (index < 0) ? 0 : index;
        index = (index > cmd[cmd_index].length - 1) ? cmd[cmd_index].length - 1 : index;
        const pos = cursorPosFromOffset(cmdStart, index);
        return pos;
    };

    const wipeTerminal = () => {
        ctx.fillStyle = color.clear;
        ctx.fillRect(0, 0, size.CANVAS_WIDTH, size.CANVAS_HEIGHT);
    };

    const copyCanvasGraphics = () => {
        const copy = document.createElement('canvas');
        const cctx = copy.getContext('2d');
        const scale = window.devicePixelRatio;
        copy.width  = Math.floor(scale * size.CANVAS_WIDTH);
        copy.height = Math.floor(scale * size.CANVAS_HEIGHT);
        copy.style.width  = `${size.CANVAS_WIDTH}px`;
        copy.style.height = `${size.CANVAS_HEIGHT}px`;
        cctx.scale(scale, scale);
        cctx.drawImage(canvasElement, 
            0, 0,
            canvasElement.width,
            canvasElement.height,
            0, 0,
            size.CANVAS_WIDTH,
            size.CANVAS_HEIGHT
        );
        return copy;
    };

    const scroll = (shouldScrollDown, n) => {
        if (shouldScrollDown === undefined) shouldScrollDown = true;
        if (n === undefined) n = 1;
        let offset = (shouldScrollDown ? 1 : -1) * n;

        let newScrollY = scrollY + offset;
        if (newScrollY < 0) {
            offset = -1 * scrollY;
            newScrollY = 0;
        }

        if (scrollY !== newScrollY) {
            wipeCursor();

            const copy = copyCanvasGraphics();
            wipeTerminal();
            ctx.drawImage(copy, 
                0, offset * size.rowHeight,
                copy.width,
                copy.height,
                0, 0,
                size.CANVAS_WIDTH,
                size.CANVAS_HEIGHT
            );
            scrollY = newScrollY;

            // Restore characters
            if (shouldScrollDown) {
                const base_row = scrollY + size.rows - n;
                for (let r = base_row; r < base_row + n; r++) {
                    for (let c = 0; c < 80; c++) {
                        const h = hash({row: r, col: c});
                        if (h in char_lookup) {
                            textAreaWrite(r - scrollY, c, char_lookup[h]);
                        }
                    }
                }

            } else { // Scroll Up
                for (let r = scrollY; r < scrollY + n; r++) {
                    for (let c = 0; c < 80; c++) {
                        const h = hash({row: r, col: c});
                        if (h in char_lookup) {
                            textAreaWrite(r - scrollY, c, char_lookup[h]);
                        }
                    }
                }

            }
            return true;
        }
        return false;
    };

    const colorRowCol = ({row, col}, color) => {
        draw(row, col, color);
    };

    const drawCursor = () => {
        draw(cursor.row - scrollY, cursor.col, color.cursor);
    };

    const setCursor = (row, col) => {
        // Reverse wrap
        if (col < 0) {
            row -= 1;
            col = size.cols - 1;
        }
        // Line wrap
        if (col >= 80) {
            row += Math.floor(col / size.cols);
            col = col % size.cols;
        }
        // Scroll
        if (row >= scrollY + size.rows) {
            const scroll_offset = (scrollY + size.rows) - row + 1;
            scroll(true, scroll_offset);
        }
        cursor.row = row;
        cursor.col = col;
        draw(cursor.row - scrollY, cursor.col, color.cursor);
    };

    const wipeCursor = () => {
        draw(cursor.row - scrollY, cursor.col, color.clear);
    };

    const newLine = n => {
        if (n === undefined) n = 1;
        wipeCursor();
        setCursor(cursor.row + n, 0);
    };

    const newLineForEachCmdRow = strCmd => {
        const cmd_rows = strCmd.length / size.cols;
        for (let i = 0; i < cmd_rows; i++) {
            newLine();
        }
    };

    const writeWithCursor = text => {
        for (let c of text) {
            if (c === "\n") {
                newLine();

            } else {
                wipeCursor();
                write(cursor.row - scrollY, cursor.col, c);
                setCursor(cursor.row, cursor.col + 1);
            }
        }
    };

    const insertWithCursor = key => {
        const delta = distance(cmdStart, cursor);

        if (delta === cmd[cmd_index].length + 1) {
            writeWithCursor(key);
            cmd[cmd_index].push(key);

        } else {
            const cmdSlice = cmd[cmd_index].slice(delta);
            writeWithCursor(key);
            const saveCursor = {...cursor};
            cmd[cmd_index].splice(delta, 0, key);
            for (let c of cmdSlice) {
                writeWithCursor(c);
            }
            wipeCursor();
            setCursor(saveCursor.row, saveCursor.col);
        }
    };

    const eraseCommand = () => {
        wipeCursor();
        setCursor(cmdStart.row, cmdStart.col);
        for (let i = 0; i < cmd[cmd_index].length; i++) {
            writeWithCursor(" ");
        }
        wipeCursor();
        setCursor(cmdStart.row, cmdStart.col);
    };

    const makeLookup = chars => {
        const lookup = {};
        for (let c of chars) {
            lookup[c] = true;
        }
        return lookup;
    };

    const isPrintable = key => {
        const caps = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`;
        const lower = `abcdefghijklmnopqrstuvwxyz`;
        const digit = `0123456789`;
        const special = `!@#$%^&*()-_=+[{]};:'",<.>/?| `;
        const chars = makeLookup(`${caps}${lower}${digit}${special}`);
        return key in chars;
    };

    let onAutoCompleteRequestFunc = () => {};
    const onAutoCompleteRequest = func => {
        onAutoCompleteRequestFunc = func;
    };

    let onCommandFunc = () => {};
    const onCommand = func => {
        onCommandFunc = func;
    };

    const writePrompt = () => {
        const prompt = `${path}$ `;
        writeWithCursor(prompt);
        cmdStart.row = cursor.row;
        cmdStart.col = cursor.col;
    };

    const commands = {
        clear: {
            call: () => {
                newLine();
                newLine();
                writePrompt();
                scroll(true, cursor.row - scrollY);
                drawCursor();
            }
        },
        noop: {
            call: () => {
                newLine();
                newLine();
                writePrompt();
            }
        },
        wipe: {
            call: () => {
                wipeTerminal();
            }
        }
    };

    const scrollToCursor = () => {
        const lastLine = scrollY + size.rows - 1;
        const delta = cursor.row - lastLine;
        if (delta > 0) {
            scroll(true, delta);
            drawCursor();
        }
    };

    const sendCommand = (name, args) => {
        commands[name].call(args);
    };

    window.addEventListener("keydown", e => {
        e.preventDefault();
        scrollToCursor();

        const ENTER = 13;
        const BACKSPACE = 8;
        const ARROW_UP = 38;
        const ARROW_RIGHT = 39;
        const ARROW_DOWN = 40;
        const ARROW_LEFT = 37;
        const TAB = 9;

        const { key, keyCode, ctrlKey } = e;

        if (keyCode === ENTER) {
            const strCmd = cmd[cmd_index].join("");
            const result = onCommandFunc(strCmd);

            cmd_index = 0;
            if (strCmd !== "") cmd.unshift([]);

            // Ex: vim returns 'null' because it has
            // already taken over the canvas
            if (result === null) return;

            if ("cmd" in result) {
                // Move cursor to end of command
                wipeCursor();
                write(cursor.row, cursor.col, charAtCursor());
                const pos = cursorPosFromOffset(cmdStart, strCmd.length);
                setCursor(pos.row, pos.col);

                commands[result.cmd].call(result.args);

            } else if ("data" in result) {
                newLineForEachCmdRow(strCmd);
                writeWithCursor(result.data);
                newLine();
                newLine();
                writePrompt();
            }

        } else if (keyCode === BACKSPACE) {
            if (!eq(cmdStart, cursor)) {
                wipeCursor();
                write(cursor.row, cursor.col, charAtCursor());
                setCursor(cursor.row, cursor.col - 1);
                const saveCursor = {...cursor};
                const delta = distance(cmdStart, cursor);
                cmd[cmd_index].splice(delta, 1);
                const cmdSlice = cmd[cmd_index].slice(delta);
                for (let c of cmdSlice) {
                    writeWithCursor(c);
                }
                wipeCursor();
                setCursor(saveCursor.row, saveCursor.col);
            }

        } else if (keyCode === TAB) {
            const result = onAutoCompleteRequestFunc({
                cmd: cmd[cmd_index].join(""),
                offset: distance(cmdStart, cursor)
            });
            if (result !== null) {
                for (let c of result) {
                    insertWithCursor(c);
                }
            }

        } else if (keyCode === ARROW_UP) {
            eraseCommand();
            cmd_index += 1;
            if (cmd_index > cmd.length - 1) cmd_index = cmd.length - 1;
            writeWithCursor(cmd[cmd_index]);

        } else if (keyCode === ARROW_RIGHT) {
            const cmdEnd = cursorPosFromOffset(cmdStart, cmd[cmd_index].length);
            if (!eq(cmdEnd, cursor)) {
                if (ctrlKey) {
                    const direction = 1;
                    const pos = nextTypeChangeFromCursor(direction);
                    wipeCursor();
                    write(cursor.row, cursor.col, charAtCursor());
                    setCursor(pos.row, pos.col);

                } else {
                    wipeCursor();
                    write(cursor.row, cursor.col, charAtCursor());
                    setCursor(cursor.row, cursor.col + 1);

                }
            }

        } else if (keyCode === ARROW_DOWN) {
            eraseCommand();
            cmd_index -= 1;
            if (cmd_index < 0) cmd_index = 0;
            writeWithCursor(cmd[cmd_index]);

        } else if (keyCode === ARROW_LEFT) {
            if (!eq(cmdStart, cursor)) {
                if (ctrlKey) {
                    const direction = -1;
                    const pos = nextTypeChangeFromCursor(direction);
                    wipeCursor();
                    write(cursor.row, cursor.col, charAtCursor());
                    setCursor(pos.row, pos.col);

                } else {
                    wipeCursor();
                    write(cursor.row, cursor.col, charAtCursor());
                    setCursor(cursor.row, cursor.col - 1);

                }
            }

        } else if (isPrintable(key)) {
            insertWithCursor(key);

        }
    });

    const localCoordFromClient = ({clientX, clientY}) => {
        const {top, left} = canvasElement.getBoundingClientRect();
        return {
            x: clientX - left,
            y: clientY - top
        };
    };

    const numberFromRowCol = ({row, col}) => {
        return size.cols * row + col;
    };

    const rowColFromNumber = number => {
        return {
            row: Math.floor(number / size.cols),
            col: number % size.cols
        };
    };

    window.addEventListener("wheel", e => {
        const shouldScrollDown = e.deltaY > 0;
        if (shouldScrollDown && cursor.row === scrollY) return;
        const didScroll = scroll(shouldScrollDown, 1);
        if (didScroll) drawCursor();
    });

    const setPath = newPath => {
        path = newPath;
    };

    const init = () => {
        writePrompt();
    };
    init();

    return {
        onCommand,
        onAutoCompleteRequest,
        setPath,
        sendCommand
    };
}