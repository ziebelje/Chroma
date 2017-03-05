chroma.blend.normal = {};

/**
 * The final color is the top color, whatever the bottom color may be. The
 * effect is similar to two opaque pieces of paper overlapping.
 *
 * @param {canvas} bottom_canvas Bottom canvas.
 * @param {canvas} top_canvas Top canvas.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/blend-mode
 */
chroma.blend.normal.apply = function(bottom_canvas, top_canvas) {
  for (var y = 0; y < bottom_canvas.length; y++) {
    for (var x = 0; x < bottom_canvas[y].length; x++) {
      if (top_canvas[y][x] !== null) {
        bottom_canvas[y][x] = top_canvas[y][x];
      }
    }
  }
};
