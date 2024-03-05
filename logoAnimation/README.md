# Animation Overview

Three arcs one inside the other

Outer arc: Animates clockwise from top center (0.8s)

On completion: Second arc: Animates clockwise from top (0.8s)

On completion: Third arc: Animates clockwise from top (0.8s)

Two inner arcs are shifted slightly to the right initially

They reach the horizontal center of the screen as the looping finishes

Slightly before inner arcs complete a rectangle covering middle of inner arcs animates in opacity 0 to 0.7 to 1 covering middle of inner arcs (0.2s)

At the same time as above horizontal line right to left top hemisphere (0.6s)
Same line on bottom hemisphere (0.6s)

Logo fade very fast in all caps at exact moment bottom horizontal line hits. (0.2s)

The "O" has a tear drop in center

Logo remains for (2.5s)

Logo fades out except for the "O" (0.5s)

Pause (0.5s)

"O" fades out (0.5)

As soon as "O" is gone prompt fades in

# Oval Code

ctx.save();
ctx.scale(0.75, 1);
ctx.beginPath();
ctx.arc(20, 21, 10, 0, Math.PI*2, false);
ctx.restore();
ctx.stroke();