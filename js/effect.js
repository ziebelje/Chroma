var effect = function() {
  this.tracks_ = [];
};

effect.prototype.add_track = function(track) {
  this.tracks_.push(track);
};

effect.prototype.get_tracks = function() {
  return this.tracks_;
};

effect.prototype.set_time_start = function(time_start) {
  this.time_start_ = time_start;
};

effect.prototype.get_time_start = function() {
  return this.time_start_;
};

effect.prototype.set_code = function(code) {
  this.code_ = code;
};

effect.prototype.get_code = function() {
  return this.code_;
};

/**
 * Get the total length of the effect in milliseconds (null if the effect is
 * infinite).
 *
 * @return {number} The effect length.
 */
effect.prototype.get_duration = function(include_persist) {
  var duration = 0;

  this.tracks_.forEach(function(track) {
    duration = Math.max(duration, track.get_total_duration(include_persist));
  });

  return duration;
};

effect.prototype.apply = function(begin_canvas, t) {
  var self = this;
  // var canvas = begin_canvas;
  this.tracks_.forEach(function(track) {
    /*canvas = */track.apply(begin_canvas, t, self);
  });

  // return canvas;
};

effect.prototype.set_triggered = function(triggered) {
  this.triggered_ = triggered;
};

effect.prototype.get_triggered = function() {
  return this.triggered_;
};

effect.prototype.set_autorun = function(autorun) {
  this.autorun_ = autorun;
};

effect.prototype.get_autorun = function() {
  return this.autorun_;
};
