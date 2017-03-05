/**
 * Turn a key or keys a solid color. Nothing fancy here.
 */
track.static = function() {
  this.defaults_ = {
    'blend_mode': 'normal',
    'keys': ['<all>'],
    'keys_ignore': null,
    'color': chroma.rgb(0, 0, 0)
  };

  track.apply(this, arguments);
};
rocket.inherits(track.static, track);

/**
 * Apply the track.
 *
 * @param {canvas} begin_canvas The current canvas.
 *
 * @return {canvas} The canvas with this track applied.
 */
track.static.prototype.apply = function(begin_canvas) {
  var canvas = chroma.generate_blank_canvas();

  for (var y = 0; y < canvas.length; y++) {
    for (var x = 0; x < canvas[y].length; x++) {
      if (this.position_is_sampled_by_key_(x, y) === true) {
        canvas[y][x] = this.color_;
      }
    }
  }

  canvas = chroma.blend[this.blend_mode_].apply(begin_canvas, canvas);

  return canvas;
};
