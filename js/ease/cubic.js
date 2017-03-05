chroma.ease.cubic = {};

/**
 * Ease in pretty quickly.
 *
 * @param {number} time Current time
 * @param {number} duration Duration
 * @param {number} direction Direction to run the ease; 1 for forwards, -1 for
 * backwards.
 *
 * @see http://easings.net/#easeOutCubic
 * @see http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * @return {number} The value at the specified time in the curve.
 */
chroma.ease.cubic.apply = function(time, duration, direction) {
  var t = time;

  if (direction === -1) {
    t = duration - time;
  }

  var z = (((t = (t / duration) - 1) * (t * t)) + 1);

  return direction === 1 ? z : (1 - z);
};
