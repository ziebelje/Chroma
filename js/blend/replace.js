chroma.blend.replace = {};

/**
 * Just blindly replace the contents of bottom_canvas with the contents of
 * top_canvas. This is effectively a normal blend but nulls will overwrite.
 *
 * @param {canvas} bottom_canvas Bottom canvas.
 * @param {canvas} top_canvas Top canvas.
 */
chroma.blend.replace.apply = function(bottom_canvas, top_canvas) {
  for (var y = 0; y < bottom_canvas.length; y++) {
    for (var x = 0; x < bottom_canvas[y].length; x++) {
      bottom_canvas[y][x] = top_canvas[y][x];
    }
  }
};
