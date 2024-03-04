function textarea({ canvas, ctx }) {
    canvas.focus();

    function getCssVar(name) {
        return window.getComputedStyle(document.body).getPropertyValue(name);
    }

    // Set
    const TEXTAREA_WIDTH = 78;
    const ratio = window.devicePixelRatio;
    const FONT_SIZE = ratio * 20;
    const FONT_COLOR = getCssVar('--font');

    ctx.font = `${FONT_SIZE}px 'Ubuntu Mono', monospace`;

    // Calculation
    const {fontBoundingBoxAscent, fontBoundingBoxDescent, width: box_width_real} = ctx.measureText("m");
    const box_height = fontBoundingBoxAscent + fontBoundingBoxDescent;

    const box_width = Math.ceil(box_width_real);

    const textareaWidth = TEXTAREA_WIDTH * box_width;
    const TEXTAREA_HEIGTH = Math.floor(canvas.height / box_height);
    const textareaHeight = TEXTAREA_HEIGTH * box_height;

    const margin = {
        x: canvas.width - textareaWidth,
        y: canvas.height - textareaHeight
    };

    const pad = {
        x: Math.ceil(margin.x / 2),
        y: Math.ceil(margin.y / 2)
    };

    // Methods
    const _gridPosition = cursor => {
        return {
            x: pad.x + cursor.x * box_width,
            y: pad.y + fontBoundingBoxAscent + cursor.y * box_height
        };
    };

    const rowColFromGridPos = ({x, y}) => {
        const row = Math.floor((y - pad.y) / box_height);
        const col = Math.floor((x - pad.x) / box_width);
        return {
            row,
            col
        };
    };

    const write = (row, col, char) => {
        const {x, y} = _gridPosition({x: col, y: row});
        ctx.fillStyle = FONT_COLOR;
        ctx.fillText(char, x, y);
    };

    const draw = (row, col, color) => {
        const {x, y} = _gridPosition({x: col, y: row});
        ctx.fillStyle = color;
        ctx.fillRect(x, y - fontBoundingBoxAscent, box_width, box_height);
        ctx.fillStyle = FONT_COLOR;
    };

    const demo = () => {
        const text = "abcdefghijklmnopqrstuvwxyzABCEDFGHIJKLMNOPQRSTUVWXYZmmmmmmmmmmmmmmmmmmmmmmmmmmmm";
        for (let y = 0; y < TEXTAREA_HEIGTH; y++) {
            for (let x = 0; x < TEXTAREA_WIDTH; x++) {
                write(y, x, text[x]);
            }
        }
    };
    // demo();

    return {
        write,
        draw,
        rowColFromGridPos,
        canvas: {
            canvasElement: canvas,
            ctx
        },
        size: {
            cols: TEXTAREA_WIDTH,
            rows: TEXTAREA_HEIGTH,
            rowHeight: box_height,
            charWidth: box_width,
            pad
        }
    };
}