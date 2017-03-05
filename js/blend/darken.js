chroma.blend.darken = {};

/**
 * The final color is a color composed of the darkest values per color
 * channel.
 *
 * @param {canvas} bottom_canvas Bottom canvas.
 * @param {canvas} top_canvas Top canvas.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/blend-mode
 */
chroma.blend.darken.apply = function(bottom_canvas, top_canvas) {
  for (var y = 0; y < bottom_canvas.length; y++) {
    for (var x = 0; x < bottom_canvas[y].length; x++) {
      if (bottom_canvas[y][x] === null) {
        bottom_canvas[y][x] = chroma.rgb(
          top_canvas[y][x].r,
          top_canvas[y][x].g,
          top_canvas[y][x].b
        );
      } else if (top_canvas[y][x] === null) {
        bottom_canvas[y][x] = chroma.rgb(
          bottom_canvas[y][x].r,
          bottom_canvas[y][x].g,
          bottom_canvas[y][x].b
        );
      } else {
        bottom_canvas[y][x] = chroma.rgb(
          Math.min(bottom_canvas[y][x].r, top_canvas[y][x].r),
          Math.min(bottom_canvas[y][x].g, top_canvas[y][x].g),
          Math.min(bottom_canvas[y][x].b, top_canvas[y][x].b)
        );
      }
    }
  }
};
