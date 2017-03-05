chroma.ease.linear = {};

/**
 * Linear ease. This does not include a direction argument as a linear ease is
 * the same both ways.
 *
 * @param {number} time Current time
 * @param {number} duration Duration
 *
 * @return {number} The value at the specified time in the curve.
 */
chroma.ease.linear.apply = function(time, duration) {
  return time / duration;
};
