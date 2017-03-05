chroma.ease.sine = {};

/**
 * Ease along a sine curve.
 *
 * @param {number} time Current time
 * @param {number} duration Duration
 * @param {number} direction Direction to run the ease; 1 for forwards, -1 for
 * backwards.
 *
 * @see http://easings.net/#easeOutSine
 * @see http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * @return {number} The value at the specified time in the curve.
 */
chroma.ease.sine.apply = function(time, duration, direction) {
  var time_ = time;

  if (direction === -1) {
    time_ = duration - time;
  }

  var z = Math.sin(time_ / duration * (Math.PI / 2));

  return direction === 1 ? z : (1 - z);
};
