var trigger = function() {};

trigger.prototype.effect_;
trigger.prototype.keys_;

trigger.prototype.set_effect = function(effect) {
  this.effect_ = effect;
};

trigger.prototype.update_effect_trigger_key = function(key) {
  var tracks = this.effect_.get_tracks();
  tracks.forEach(function(track) {
    track.replace_key('<trigger>', key);
  });
};

trigger.prototype.get_effect = function(effect) {
  return this.effect_;
};

trigger.prototype.set_keys = function(keys) {
  this.keys_ = chroma.expand_key_groups(keys);
};

trigger.prototype.is_triggered_by = function(key) {
  return this.keys_.indexOf(key) !== -1;
};

trigger.prototype.set_code = function(code) {
  this.code_ = code;
};

trigger.prototype.get_code = function() {
  return this.code_;
};
