/**
 * Pulse keys on, then off. There are lots of settings that can change the
 * behavior so this is a really powerful effect. Pulse on then off forever is
 * simply the standard behavior.
 */
track.pulse = function() {
  this.defaults_ = {
    'repeat': true,
    'delay': 0,
    'rest': 0,
    'blend_mode': 'normal',
    'duration': 1000,
    'density': 0.02,
    'ease_in_duration': 500,
    'ease_in_function': 'sine',
    'ease_in_direction': 1,
    'ease_out_duration': 500,
    'ease_out_function': 'sine',
    'ease_out_direction': -1,
    'hold_duration': 0,
    'keys': ['<all>'],
    'keys_ignore': null,
    'colors': null,
    'persist': false,
    'distinct_colors': null,
    'background': null
  };

  track.apply(this, arguments);
};
rocket.inherits(track.pulse, track);

/**
 * Apply the track
 *
 * @param {canvas} begin_canvas The starting canvas.
 * @param {number} time Current time for this track (all tracks start at 0)
 * @param {effect} effect The effect this track is a part of.
 */
track.pulse.prototype.apply = function(begin_canvas, time, effect) {
  // If there is a delay, move time into the past to trick the track into not
  // executing yet without a bunch of extra conditionals.
  var time_;
  if (this.delay_ === null) {
    time_ = time;
  } else {
    time_ = time - this.delay_;
  }

  // If time is negative, skip running this effect due to a delay.
  if (time_ < 0) {
    return;
  }

  // If the track is "over", just use this.last_canvas_. This happens when the
  // track has run it's course but persist is true and thus it wasn't removed
  // from the effects list. We still need to do the above logic to apply the
  // persist, though.
  if (time_ >= this.get_total_duration()) {
    chroma.blend.replace.apply(begin_canvas, this.last_canvas_);

    return;
  }

  // The number of ms into the current iteration of this track (between 0 and
  // duration).
  var iteration_time = time_ % this.get_iteration_duration_();
  // console.log(iteration_time);

  // Seed random for this iteration of this track so all calls to Math.random()
  // are predictable.
  Math.seedrandom(this.get_iteration_(time_) + ' ' + this.guid_);

  // Set the persist canvas to be the last canvas if this is the start of the
  // new iteration
  if (this.persist_ === true) {
    if (
      this.last_iteration_ !== this.get_iteration_(time) &&
      time_ < this.get_total_duration() &&
      this.last_canvas_ !== undefined
    ) {
      this.persist_canvas_ = this.last_canvas_;
    }
    this.last_iteration_ = this.get_iteration_(time);

    if (this.persist_canvas_ !== undefined) {
      chroma.blend[this.blend_mode_].apply(begin_canvas, this.persist_canvas_);
    }
  }

  // Select the distinct colors to use in this track.
  var set_of_distinct_colors;
  if (this.distinct_colors_ !== null) {
    set_of_distinct_colors = [];
    for (var i = 0; i < this.distinct_colors_; i++) {
      set_of_distinct_colors.push(chroma.rgb(
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255)
      ));
    }
  }

  // Always start this canvas off as a blank slate
  var canvas = chroma.generate_blank_canvas();

  for (var y = 0; y < canvas.length; y++) {
    for (var x = 0; x < canvas[y].length; x++) {
      // If this track has a background, set that as the canvas color in this
      // position. Otherwise don't set one.
      if (this.background_ !== null) {
        canvas[y][x] = this.background_;
      }

      if (
        Math.random() < this.density_ &&
        this.position_is_sampled_by_key_(x, y) === true
      ) {
        // If this track has a background, set the begin color to the background
        // color. Else use the color of the begin_canvas. This ensures that a
        // proper start color is set when doing masking.
        var begin_color;
        if (this.background_ === null) {
          begin_color = begin_canvas[y][x];
        } else {
          begin_color = canvas[y][x];
        }

        var end_color;
        if (this.colors_ === null) {
          if (this.distinct_colors_ === null) {
            end_color = chroma.rgb(
              Math.round(Math.random() * 255),
              Math.round(Math.random() * 255),
              Math.round(Math.random() * 255)
            );
          } else {
            end_color = set_of_distinct_colors[
              Math.floor(Math.random() * set_of_distinct_colors.length)
            ];
          }
        } else {
          end_color = this.colors_[
            Math.floor(Math.random() * this.colors_.length)
          ];
        }

        var color;
        var gradient_position;
        if (
          iteration_time >= 0 &&
          iteration_time <= this.ease_in_duration_
        ) {
          gradient_position = chroma.ease[this.ease_in_function_].apply(
            iteration_time,
            this.ease_in_duration_,
            this.ease_in_direction_
          );

          color = this.gradient_(
            begin_color,
            end_color,
            gradient_position
          );
        } else if (
          iteration_time > this.ease_in_duration_ &&
          iteration_time <= this.ease_in_duration_ + this.hold_duration_
        ) {
          gradient_position = 1;
          color = this.gradient_(
            begin_color,
            end_color,
            gradient_position
          );
        } else if (
          iteration_time > this.ease_in_duration_ + this.hold_duration_ &&
          iteration_time <=
            this.ease_in_duration_ +
            this.hold_duration_ +
            this.ease_out_duration_
        ) {
          gradient_position = chroma.ease[this.ease_out_function_].apply(
            (iteration_time - this.ease_in_duration_),
            this.ease_out_duration_ + this.hold_duration_,
            this.ease_out_direction_
          );

          color = this.gradient_(
            end_color,
            begin_color,
            gradient_position
          );
        } else {
          color = null;
        }

        canvas[y][x] = color;
      }
    }
  }

  // Finally apply the blending.
  chroma.blend[this.blend_mode_].apply(begin_canvas, canvas);

  // Always store the last generated canvas as it existed after the entire
  // effect and blending was done.
  this.last_canvas_ = $.clone(begin_canvas);

  // If this is a triggered effect and it's supposed to persist, dump the
  // current canvas on top of the existing persist canvas.
  if (effect.get_triggered() === true && this.persist_ === true) {
    chroma.blend.normal.apply(chroma.persist_canvas_, canvas);
  }
};
