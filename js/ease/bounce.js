chroma.ease.bounce = {};

/**
 * Ease in pretty quickly, then bounce back down once it hits 1.
 *
 * @param {number} time Current time
 * @param {number} duration Duration
 * @param {number} direction Direction to run the ease; 1 for forwards, -1 for
 * backwards.
 *
 * @see http://easings.net/#easeOutBounce
 * @see http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * @return {number} The value at the specified time in the curve.
 */
chroma.ease.bounce.apply = function(time, duration, direction) {
  var time_ = time;

  if (direction === -1) {
    time_ = duration - time;
  }

  var z;
  if ((time_ /= duration) < (1 / 2.75)) {
    z = 7.5625 * time_ * time_;
  } else if (time_ < (2 / 2.75)) {
    z = ((7.5625 * (time_ -= (1.5 / 2.75)) * time_) + 0.75);
  } else if (time_ < (2.5 / 2.75)) {
    z = ((7.5625 * (time_ -= (2.25 / 2.75)) * time_) + 0.9375);
  } else {
    z = ((7.5625 * (time_ -= (2.625 / 2.75)) * time_) + 0.984375);
  }

  return direction === 1 ? z : (1 - z);
};
