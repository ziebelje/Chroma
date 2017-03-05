 /*
 * @param {canvas} begin_canvas The canvas before the track is
 * applied.
 * @param {object} settings
 *   repeat: How many times to repeat this track. If not a number or unset,
 *     repeat indefinitely
 *   delay: How long to delay the start of this track.
 *   rest: How long to wait between iterations of this track.
 *   blend_mode: How to blend this effet with the current canvas.
 *   duration: How long in milliseconds to run this track.
 *   density: Percentage of the canvas to apply this track to. From 0 to 1.
 *   ease_in_duration: How long in ms to ease the track in.
 *   ease_in_function: Curve to use when easing the track in. Can be bounce,
 *     cubic, linear, or sine.
 *   ease_in_direction: Set to 1 to run ease_in_function forwards, or -1 to run
 *     ease_in_function backwards.
 *   ease_out_duration: How long in ms to ease the track out.
 *   ease_out_function: Curve to use when easing the track in. Can be bounce,
 *     cubic, linear, or sine.
 *   ease_out_direction: Set to 1 to run ease_out_function forwards, or -1 to
 *     run ease_out_function backwards.
 *   hold_duration: How long to hold the color after it's faded in before fading
 *     out.
 *   keys: A list of keys this track should apply to. If null or not set, use
 *     no keys.
 *   keys_ignore: A list of keys this track should *not* apply to. This will be
 *     removed from the keys array.
 *   colors: A list of colors this track should select from. If null or not
 *     set, generate random colors.
 *   persist: If set to true, save the last frame of the track and persist it.
 *   distinct_colors: The number of unique random colors to select. If not set,
 *     a new random color is selected for every key. If colors is provided, this
 *     is ignored.
 * @param {number} t Time
 * @param {number} dt Time interval
 *
 * @return {canvas} The canvas after the track is applied.
*/

var track = function() {
  // Set defaults
  for (var property in this.defaults_) {
    this['set_' + property](this.defaults_[property]);
  }

  // Each track needs a unique ID for random seeding.
  this.guid_ = Math.random();
};

track.prototype.set_color = function(color) {
  this.color_ = this.hex_to_rgb_(color);
};

track.prototype.set_keys = function(keys) {
  this.keys_ = chroma.expand_key_groups(keys);
};

track.prototype.replace_key = function(from, to) {
  var index = this.keys_.indexOf(from);
  if (index !== -1) {
    this.keys_[index] = to;
  }
};

track.prototype.set_keys_ignore = function(keys_ignore) {
  this.keys_ignore_ = chroma.expand_key_groups(keys_ignore);
};

track.prototype.set_blend_mode = function(blend_mode) {
  this.blend_mode_ = blend_mode;
};

track.prototype.set_repeat = function(repeat) {
  this.repeat_ = repeat;
};

track.prototype.set_delay = function(delay) {
  this.delay_ = delay;
};

track.prototype.set_rest = function(rest) {
  this.rest_ = rest;
};

track.prototype.set_duration = function(duration) {
  this.duration_ = duration;
};

track.prototype.set_density = function(density) {
  this.density_ = density;
};

track.prototype.set_ease_in_duration = function(ease_in_duration) {
  this.ease_in_duration_ = ease_in_duration;
};

track.prototype.set_ease_in_function = function(ease_in_function) {
  this.ease_in_function_ = ease_in_function;
};

track.prototype.set_ease_in_direction = function(ease_in_direction) {
  this.ease_in_direction_ = ease_in_direction;
};

track.prototype.set_ease_out_duration = function(ease_out_duration) {
  this.ease_out_duration_ = ease_out_duration;
};

track.prototype.set_ease_out_function = function(ease_out_function) {
  this.ease_out_function_ = ease_out_function;
};

track.prototype.set_ease_out_direction = function(ease_out_direction) {
  this.ease_out_direction_ = ease_out_direction;
};

track.prototype.set_hold_duration = function(hold_duration) {
  this.hold_duration_ = hold_duration;
};

track.prototype.set_colors = function(colors) {
  var self = this;

  if (colors !== null) {
    this.colors_ = [];
    colors.forEach(function(color) {
      self.colors_.push(self.hex_to_rgb_(color));
    });
  } else {
    this.colors_ = null;
  }
};

track.prototype.set_persist = function(persist) {
  this.persist_ = persist;
};

track.prototype.set_distinct_colors = function(distinct_colors) {
  this.distinct_colors_ = distinct_colors;
};

// http://stackoverflow.com/a/5624139/4028548
track.prototype.hex_to_rgb_ = function(hex) {
  if (jex.type(hex) === 'string') {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthand_regex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthand_regex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result !== null ? {
      'r': parseInt(result[1], 16),
      'g': parseInt(result[2], 16),
      'b': parseInt(result[3], 16)
    } : null;
  } else {
    return hex;
  }

};

track.prototype.gradient_ = function(begin_color, end_color, t) {
  return chroma.rgb(
    Math.round(begin_color.r + (t * (end_color.r - begin_color.r))),
    Math.round(begin_color.g + (t * (end_color.g - begin_color.g))),
    Math.round(begin_color.b + (t * (end_color.b - begin_color.b)))
  );
};

/**
 * Determine if one set of keys contains at least one item from another set of
 * keys.
 *
 * @param {array} haystack The array to search.
 * @param {array} needle The array providing items to check for in the
 * haystack.
 *
 * @return {boolean} If haystack contains at least one item from needle.
 */
track.prototype.keys_in_keys_ = function(haystack, needle) {
  return needle.some(function(v) {
    return haystack.indexOf(v) >= 0;
  });
};

/* is x,y sampled by any of keys */
track.prototype.position_is_sampled_by_key_ = function(x, y) {
  var self = this;

  var keys = this.keys_.filter(function(i) {
    return self.keys_ignore_.indexOf(i) < 0;
  });

  if (chroma.keys_normalized_pos[y] !== undefined) {
    if (chroma.keys_normalized_pos[y][x] !== undefined) {
      if (this.keys_in_keys_(keys, chroma.keys_normalized_pos[y][x]) === true) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Get the total duration of this track.
 *
 * @param {boolean} include_persist Whether or not to count persisting as an
 * infinte track length. Sometimes this matters, sometimes it doesn't.
 *
 * @return {number} The total duration of the track.
 */
track.prototype.get_total_duration = function(include_persist) {
  if ((include_persist && this.persist_ === true) || this.repeat_ === true) {
    return Infinity;
  }

  // Removed delay because that was padding the length of the effect. Not sure how I want to handle this...delay doesn't really increase the length of the effect, it just makes it start later.
  // return this.delay_ + (this.get_iteration_duration_() * this.repeat_);
  return (this.get_iteration_duration_() * this.repeat_);
};

/**
 * Get the duration of a single iteration of this track.
 *
 * @return {number} The duration.
 */
track.prototype.get_iteration_duration_ = function() {
  return this.duration_ + this.rest_;
};

/**
 * Get the current iteration (1-indexed) of the track.
 *
 * @param {number} time The amount of time into the track.
 *
 * @return {number} The iteration.
 */
track.prototype.get_iteration_ = function(time) {
  return Math.floor(time / this.get_iteration_duration_()) + 1;
};

track.prototype.set_code = function(code) {
  this.code_ = code;
};

track.prototype.get_code = function() {
  return this.code_;
};


track.prototype.set_background = function(background) {
  this.background_ = this.hex_to_rgb_(background);
};
