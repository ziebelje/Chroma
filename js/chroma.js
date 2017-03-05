var chroma = function(configuration) {
  this.configuration_ = configuration;
  this.effects_ = [];
  this.triggered_effects_ = [];
  this.triggers_ = [];

  chroma.set_up_keys();
  chroma.generate_keys_normalized();

  for (var effect in configuration.effects) {
    this.add_effect_(
      this.create_effect_from_json_(configuration.effects[effect], effect)
    );
  }

  for (var trigger in configuration.triggers) {
    this.add_trigger_(
      this.create_trigger_from_json_(configuration.triggers[trigger], trigger)
    );
  }
};

chroma.prototype.create_effect_from_json_ = function(json, code) {
  var self = this;

  var effect_ = new effect();
  for (var property in json) {
    if (property === 'tracks') {
      json[property].forEach(function(track) {
        effect_.add_track(
          self.create_track_from_json_(self.configuration_.tracks[track], track)
        );
      });
    } else {
      effect_['set_' + property](json[property]);
    }
  }

  effect_.set_code(code);

  return effect_;
};

chroma.prototype.create_track_from_json_ = function(json, code) {
  var track_ = new track[json.type]();
  for (var property in json) {
    if (property !== 'type') {
      track_['set_' + property](json[property]);
    }
  }

  track_.set_code(code);

  return track_;
};

chroma.prototype.create_trigger_from_json_ = function(json, code) {
  var trigger_ = new trigger();
  for (var property in json) {
    // Don't set the effect as that needs to be created on trigger.
    if (property !== 'effect') {
      trigger_['set_' + property](json[property]);
    }
  }

  trigger_.set_code(code);

  return trigger_;
};

chroma.prototype.add_effect_ = function(effect) {
  this.effects_.push(effect);
};


chroma.prototype.add_triggered_effect_ = function(effect) {
  this.triggered_effects_.push(effect);
};

chroma.prototype.add_trigger_ = function(trigger) {
  this.triggers_.push(trigger);
};

chroma.prototype.start = function(callback) {
  var self = this;

  var chroma_time_start = Date.now();

  // Watch for trigger keys. If they occur, create a new effect (so it gets it's
  // own GUID and not a copy of some other one), attach it to the trigger, then
  // attach it to the main effect list.
  window.addEventListener('keydown', function(e) {
    self.triggers_.forEach(function(trigger) {
      if (trigger.is_triggered_by(chroma.key_codes[e.code]) === true) {
        var trigger_json = self.configuration_.triggers[trigger.get_code()];

        var effect = self.create_effect_from_json_(
          self.configuration_.effects[trigger_json.effect],
          trigger_json.effect
        );

        trigger.set_effect(effect);
        trigger.update_effect_trigger_key(chroma.key_codes[e.code]);

        effect.set_triggered(true);
        effect.set_time_start(Date.now() - chroma_time_start);
        self.add_triggered_effect_(effect);
      }
    });
  });

  var time_now = chroma_time_start;
  // var dt;

  chroma.persist_canvas_ = chroma.generate_blank_canvas();

  this.interval_ = setInterval(function() {
    // Milliseconds since last run
    // dt = Date.now() - time_now;

    // Current time
    time_now = Date.now();

    // todo use blank canvas? or I think I need to generate a canvas with a black fill
    var canvas = [];
    for (var y = 0; y < chroma.canvas_height; y++) {
      canvas.push([]);
      for (var x = 0; x < chroma.canvas_width; x++) {
        canvas[canvas.length - 1].push(chroma.rgb(0, 0, 0));
      }
    }

    // Generate a list of effects that need applied (autorun + triggered)
    var all_effects = [];
    self.effects_.forEach(function(effect) {
      if (effect.get_autorun() === true) {
        all_effects.push(effect);
      }
    });
    all_effects = all_effects.concat(self.triggered_effects_);

    // Loop over the effects
    for (var i = 0; i < all_effects.length; i++) {
      var effect = all_effects[i];

      // Set start time for the effect relative to the beginning of the script.
      if (effect.get_time_start() === undefined) {
        effect.set_time_start(time_now - chroma_time_start);
      }

      // Once we've applied all of the normal effects, apply the persist canvas
      // (if there is one). Then to follow this any additional triggered effect
      // will be applied.
      if ((i + 1) === self.effects_.length) {
        chroma.blend.normal.apply(canvas, chroma.persist_canvas_);
      }

      // Remove effects that have completed. The true flag on
      // effect.get_duration says to count persist tracks/effects as infinte in
      // length and thus they never get removed.
      var effect_t = time_now - chroma_time_start - effect.get_time_start();
      // console.log(effect_t + ' >= ' + effect.get_duration());
      if (
        (effect_t >= effect.get_duration() && effect.get_triggered() === true) ||
        (effect_t >= effect.get_duration() && effect.get_triggered() === false)
      ) {
      // if (effect_t >= effect.get_duration()/* && effect.get_triggered() !== false*/) {
        all_effects.splice(i, 1);
        i--;
      } else {
        // Apply the effect.
        effect.apply(canvas, effect_t);
      }


    }

    // if (chroma.persist_canvas_ !== undefined) {
      // console.log('use persist canvas');
      // chroma.blend.normal.apply(canvas, chroma.persist_canvas_);
    // }

    // console.log(all_effects.length); // TODO figure out persist/duration/when to remove/etc

    // debugger;
    callback(canvas);
  }, 50);
};

chroma.prototype.stop = function() {
  clearInterval(this.interval_);
};

/**
 * A cache of persistant canvases indexed by effect guid. Almost every part of
 * effects are stateless; this is an exception.
 *
 * @type {object}
 */
// chroma.persists = {};

/**
 * An object containing one entry per key on the keyboard. Each key has a
 * width, height, x and y coordinates, and a label. The specific dimensions
 * are only important as far as drawing them on the page goes; the ratios are
 * what matter.
 *
 * @type {object}
 */
chroma.keys = {};

/**
 * This is a list of keys normalized to the size of the canvas. Each key
 * points at a specific x, y coordinate on the canvas. This is used as a cache
 * so mapping colors to keys can be done quickly.
 *
 * @type {object}
 */
chroma.keys_normalized = {};

/**
 * The same list of normalized data but indexed by location on the canvas.
 * Each location has a list of keys (usually just one key) that are
 * represented by that location. This is used when iterating over a canvas to
 * determine if a pixel should be filled or not based on a list of keys (so
 * the key parameter on an effect).
 */
chroma.keys_normalized_pos = [];

/**
 * Canvas width in pixels. Each key on the keyboard will sample a pixel on the
 * canvas to determine it's color. A width in pixels corresponding rougly to
 * the amount of columns on a keyboard is a pretty good value here. Smaller
 * values would mean multiple keys sample the same pixel and give you a lower
 * resolution result.
 *
 * @type {number}
 */
chroma.canvas_width = 23;

/**
 * Same deal as canvas_width, just automatically calculated to fit the ratio
 * of the actual keyboard.
 *
 * @type {number}
 */
chroma.canvas_height = Math.round(chroma.canvas_width / (1263 / 354));

/**
 * Recursively expand key groups in an array of keys.
 *
 * @param {array<string>} keys The array of keys to expand.
 *
 * @return {array<string>} A flat array of expanded keys.
 */
chroma.expand_key_groups = function(keys) {
  var expanded_keys = [];

  if (keys !== null) {
    for (var i = 0; i < keys.length; i++) {
      if (chroma.key_groups[keys[i]] === undefined) {
        expanded_keys.push(keys[i]);
      } else {
        expanded_keys = expanded_keys.concat(
          chroma.expand_key_groups(chroma.key_groups[keys[i]])
        );
      }
    }
  }

  return expanded_keys;
};

/**
 * Run all of the effects and apply them one by one to the canvas.
 *
 * @param {array<object>} effects An array of effects to apply.
 * @param {number} t Time in milliseconds since the script started.
 * @param {number} dt Actual time between frames.
 *
 * @return {canvas} The canvas with effects applied.
 */
chroma.generate_canvas = function(effects, t, dt) {
  var canvas = [];
  for (var y = 0; y < chroma.canvas_height; y++) {
    canvas.push([]);
    for (var x = 0; x < chroma.canvas_width; x++) {
      canvas[canvas.length - 1].push(chroma.rgb(0, 0, 0));
    }
  }

  // Apply the active effects.
  effects.forEach(function(effect) {
    if (effect.enabled === true) {
      canvas = chroma.effect[effect.type].apply(canvas, effect, t, dt);
    }
  });

  return canvas;
};

/**
 * A helper function to prevent constantly having to write out RGB objects.
 * Hex codes are an alternative but much more difficult to work with in code.
 *
 * @param {number} r red
 * @param {number} g green
 * @param {number} b blue
 *
 * @return {object} The arguments in an object.
 */
chroma.rgb = function(r, g, b) {
  return {
    'r': r,
    'g': g,
    'b': b
  };
};

/**
 * Given a key object, return the RGB object of the corresponding pixel on the canvas.
 *
 * @param {canvas} canvas The canvas
 * @param {object} key The keyboard key
 *
 * @return {object} An RGB object.
 */
chroma.sample = function(canvas, key) {
  return canvas[chroma.keys_normalized[key].y][chroma.keys_normalized[key].x];
};

/**
 * Set up all of the keyboard keys. This just generates chroma.keys but uses
 * some calculations to make it a bit more bearable.
 *
 * Also, thank you to whoever designed these keyboards. All of the various key
 * widths are nice fractions of the most common key width.
 */
chroma.set_up_keys = function() {
  // This is arbitrary and just set to match what the UI wants. The important
  // thing overall is ratios and percentages.
  var key_width_1_00 = 41.5;

  // Additional widths
  var key_width_0_50 = key_width_1_00 / 2;
  var key_width_1_25 = key_width_1_00 * 1.25;
  var key_width_1_50 = key_width_1_00 * 1.50;
  var key_width_1_75 = key_width_1_00 * 1.75;
  var key_width_2_00 = key_width_1_00 * 2.00;
  var key_width_2_25 = key_width_1_00 * 2.25;
  var key_width_2_75 = key_width_1_00 * 2.75;
  var key_width_5_75 = key_width_1_00 * 5.75;

  // Heights
  var key_height_1_00 = key_width_1_00;
  var key_height_0_25 = key_height_1_00 * 0.25;
  var key_height_2_00 = key_height_1_00 * 2.00;

  // Space separating key sections
  var key_gutter_size = key_width_1_00 / 2.80;

  // Vertical positions
  var y0 = 0;
  var y1 = y0 + key_height_1_00 + key_gutter_size;
  var y2 = y1 + key_height_1_00;
  var y3 = y2 + key_height_1_00;
  var y4 = y3 + key_height_1_00;
  var y5 = y4 + key_height_1_00;

  // First row
  chroma.keys.escape = {
    'label': 'escape',
    'x': 0,
    'y': y0,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.f1 = {
    'label': 'F1',
    'x': chroma.keys.escape.x + chroma.keys.escape.w + key_width_1_00,
    'y': y0,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.f2 = {
    'label': 'F2',
    'x': chroma.keys.f1.x + chroma.keys.f1.w,
    'y': y0,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.f3 = {
    'label': 'F3',
    'x': chroma.keys.f2.x + chroma.keys.f2.w,
    'y': y0,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.f4 = {
    'label': 'F4',
    'x': chroma.keys.f3.x + chroma.keys.f3.w,
    'y': y0,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.f5 = {
    'label': 'F5',
    'x': chroma.keys.f4.x + chroma.keys.f4.w + key_width_0_50,
    'y': y0,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.f6 = {
    'label': 'F6',
    'x': chroma.keys.f5.x + chroma.keys.f5.w,
    'y': y0,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.f7 = {
    'label': 'F7',
    'x': chroma.keys.f6.x + chroma.keys.f6.w,
    'y': y0,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.f8 = {
    'label': 'F8',
    'x': chroma.keys.f7.x + chroma.keys.f7.w,
    'y': y0,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.f9 = {
    'label': 'F9',
    'x': chroma.keys.f8.x + chroma.keys.f8.w + key_width_0_50,
    'y': y0,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.f10 = {
    'label': 'F10',
    'x': chroma.keys.f9.x + chroma.keys.f9.w,
    'y': y0,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.f11 = {
    'label': 'F11',
    'x': chroma.keys.f10.x + chroma.keys.f10.w,
    'y': y0,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.f12 = {
    'label': 'F12',
    'x': chroma.keys.f11.x + chroma.keys.f11.w,
    'y': y0,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.print_screen = {
    'label': 'prn',
    'x': chroma.keys.f12.x + chroma.keys.f12.w + key_gutter_size,
    'y': y0,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.scroll_lock = {
    'label': 'scr',
    'x': chroma.keys.print_screen.x + chroma.keys.print_screen.w,
    'y': y0,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.pause = {
    'label': 'pau',
    'x': chroma.keys.scroll_lock.x + chroma.keys.scroll_lock.w,
    'y': y0,
    'w': key_width_1_00,
    'h': key_height_1_00
  };

  // Second row
  chroma.keys.backquote = {
    'label': '~',
    'x': 0,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys['1'] = {
    'label': '1',
    'x': chroma.keys.backquote.x + chroma.keys.backquote.w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys['2'] = {
    'label': '2',
    'x': chroma.keys['1'].x + chroma.keys['1'].w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys['3'] = {
    'label': '3',
    'x': chroma.keys['2'].x + chroma.keys['2'].w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys['4'] = {
    'label': '4',
    'x': chroma.keys['3'].x + chroma.keys['3'].w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys['5'] = {
    'label': '5',
    'x': chroma.keys['4'].x + chroma.keys['4'].w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys['6'] = {
    'label': '6',
    'x': chroma.keys['5'].x + chroma.keys['5'].w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys['7'] = {
    'label': '7',
    'x': chroma.keys['6'].x + chroma.keys['6'].w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys['8'] = {
    'label': '8',
    'x': chroma.keys['7'].x + chroma.keys['7'].w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys['9'] = {
    'label': '9',
    'x': chroma.keys['8'].x + chroma.keys['8'].w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys['0'] = {
    'label': '0',
    'x': chroma.keys['9'].x + chroma.keys['9'].w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.minus = {
    'label': '-',
    'x': chroma.keys['0'].x + chroma.keys['0'].w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.equal = {
    'label': '=',
    'x': chroma.keys.minus.x + chroma.keys.minus.w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.backspace = {
    'label': '←',
    'x': chroma.keys.equal.x + chroma.keys.equal.w,
    'y': y1,
    'w': key_width_2_00,
    'h': key_height_1_00
  };
  chroma.keys.insert = {
    'label': 'ins',
    'x': chroma.keys.backspace.x + chroma.keys.backspace.w + key_gutter_size,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.home = {
    'label': 'home',
    'x': chroma.keys.insert.x + chroma.keys.insert.w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.page_up = {
    'label': 'pgup',
    'x': chroma.keys.home.x + chroma.keys.home.w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.numpad_num_lock = {
    'label': 'nmlk',
    'x': chroma.keys.page_up.x + chroma.keys.page_up.w + key_gutter_size,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.numpad_divide = {
    'label': '/',
    'x': chroma.keys.numpad_num_lock.x + chroma.keys.numpad_num_lock.w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.numpad_multiply = {
    'label': '*',
    'x': chroma.keys.numpad_divide.x + chroma.keys.numpad_divide.w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.numpad_subtract = {
    'label': '-',
    'x': chroma.keys.numpad_multiply.x + chroma.keys.numpad_multiply.w,
    'y': y1,
    'w': key_width_1_00,
    'h': key_height_1_00
  };

  // Third row
  chroma.keys.tab = {
    'label': 'tab',
    'x': 0,
    'y': y2,
    'w': key_width_1_50,
    'h': key_height_1_00
  };
  chroma.keys.q = {
    'label': 'Q',
    'x': chroma.keys.tab.x + chroma.keys.tab.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.w = {
    'label': 'W',
    'x': chroma.keys.q.x + chroma.keys.q.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.e = {
    'label': 'E',
    'x': chroma.keys.w.x + chroma.keys.w.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.r = {
    'label': 'R',
    'x': chroma.keys.e.x + chroma.keys.e.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.t = {
    'label': 'T',
    'x': chroma.keys.r.x + chroma.keys.r.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.y = {
    'label': 'T',
    'x': chroma.keys.t.x + chroma.keys.t.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.u = {
    'label': 'U',
    'x': chroma.keys.y.x + chroma.keys.y.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.i = {
    'label': 'I',
    'x': chroma.keys.u.x + chroma.keys.u.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.o = {
    'label': 'O',
    'x': chroma.keys.i.x + chroma.keys.i.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.p = {
    'label': 'P',
    'x': chroma.keys.o.x + chroma.keys.o.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.bracket_left = {
    'label': '[',
    'x': chroma.keys.p.x + chroma.keys.p.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.bracket_right = {
    'label': ']',
    'x': chroma.keys.bracket_left.x + chroma.keys.bracket_left.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.backslash = {
    'label': '\\',
    'x': chroma.keys.bracket_right.x + chroma.keys.bracket_right.w,
    'y': y2,
    'w': key_width_1_50,
    'h': key_height_1_00
  };
  chroma.keys.delete = {
    'label': 'del',
    'x': chroma.keys.backslash.x + chroma.keys.backslash.w + key_gutter_size,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.end = {
    'label': 'end',
    'x': chroma.keys.delete.x + chroma.keys.delete.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.page_down = {
    'label': 'pgdn',
    'x': chroma.keys.end.x + chroma.keys.end.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.numpad_7 = {
    'label': '7',
    'x': chroma.keys.page_down.x + chroma.keys.page_down.w + key_gutter_size,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.numpad_8 = {
    'label': '8',
    'x': chroma.keys.numpad_7.x + chroma.keys.numpad_7.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.numpad_9 = {
    'label': '9',
    'x': chroma.keys.numpad_8.x + chroma.keys.numpad_8.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.numpad_add = {
    'label': '+',
    'x': chroma.keys.numpad_9.x + chroma.keys.numpad_9.w,
    'y': y2,
    'w': key_width_1_00,
    'h': key_height_2_00
  };

  // Fourth row
  chroma.keys.caps_lock = {
    'label': 'caps',
    'x': 0,
    'y': y3,
    'w': key_width_1_75,
    'h': key_height_1_00
  };
  chroma.keys.a = {
    'label': 'A',
    'x': chroma.keys.caps_lock.x + chroma.keys.caps_lock.w,
    'y': y3,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.s = {
    'label': 'S',
    'x': chroma.keys.a.x + chroma.keys.a.w,
    'y': y3,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.d = {
    'label': 'D',
    'x': chroma.keys.s.x + chroma.keys.s.w,
    'y': y3,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.f = {
    'label': 'F',
    'x': chroma.keys.d.x + chroma.keys.d.w,
    'y': y3,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.g = {
    'label': 'G',
    'x': chroma.keys.f.x + chroma.keys.f.w,
    'y': y3,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.h = {
    'label': 'H',
    'x': chroma.keys.g.x + chroma.keys.g.w,
    'y': y3,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.j = {
    'label': 'J',
    'x': chroma.keys.h.x + chroma.keys.h.w,
    'y': y3,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.k = {
    'label': 'K',
    'x': chroma.keys.j.x + chroma.keys.j.w,
    'y': y3,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.l = {
    'label': 'L',
    'x': chroma.keys.k.x + chroma.keys.k.w,
    'y': y3,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.semicolon = {
    'label': ';',
    'x': chroma.keys.l.x + chroma.keys.l.w,
    'y': y3,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.quote = {
    'label': '\'',
    'x': chroma.keys.semicolon.x + chroma.keys.semicolon.w,
    'y': y3,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.enter = {
    'label': 'enter',
    'x': chroma.keys.quote.x + chroma.keys.quote.w,
    'y': y3,
    'w': key_width_2_25,
    'h': key_height_1_00
  };
  chroma.keys.numpad_4 = {
    'label': '4',
    'x': chroma.keys.enter.x + chroma.keys.enter.w + (key_gutter_size * 2) + (key_width_1_00 * 3),
    'y': y3,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.numpad_5 = {
    'label': '5',
    'x': chroma.keys.numpad_4.x + chroma.keys.numpad_4.w,
    'y': y3,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.numpad_6 = {
    'label': '6',
    'x': chroma.keys.numpad_5.x + chroma.keys.numpad_5.w,
    'y': y3,
    'w': key_width_1_00,
    'h': key_height_1_00
  };

  // Fifth row
  chroma.keys.shift_left = {
    'label': 'shift',
    'x': 0,
    'y': y4,
    'w': key_width_2_25,
    'h': key_height_1_00
  };
  chroma.keys.z = {
    'label': 'Z',
    'x': chroma.keys.shift_left.x + chroma.keys.shift_left.w,
    'y': y4,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.x = {
    'label': 'X',
    'x': chroma.keys.z.x + chroma.keys.z.w,
    'y': y4,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.c = {
    'label': 'C',
    'x': chroma.keys.x.x + chroma.keys.x.w,
    'y': y4,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.v = {
    'label': 'V',
    'x': chroma.keys.c.x + chroma.keys.c.w,
    'y': y4,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.b = {
    'label': 'B',
    'x': chroma.keys.v.x + chroma.keys.v.w,
    'y': y4,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.n = {
    'label': 'N',
    'x': chroma.keys.b.x + chroma.keys.b.w,
    'y': y4,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.m = {
    'label': 'M',
    'x': chroma.keys.n.x + chroma.keys.n.w,
    'y': y4,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.comma = {
    'label': ',',
    'x': chroma.keys.m.x + chroma.keys.m.w,
    'y': y4,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.period = {
    'label': '.',
    'x': chroma.keys.comma.x + chroma.keys.comma.w,
    'y': y4,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.slash = {
    'label': '/',
    'x': chroma.keys.period.x + chroma.keys.period.w,
    'y': y4,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.shift_right = {
    'label': 'shift',
    'x': chroma.keys.slash.x + chroma.keys.slash.w,
    'y': y4,
    'w': key_width_2_75,
    'h': key_height_1_00
  };
  chroma.keys.up = {
    'label': '▲',
    'x': chroma.keys.shift_right.x + chroma.keys.shift_right.w + key_gutter_size + key_width_1_00,
    'y': y4,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.numpad_1 = {
    'label': '1',
    'x': chroma.keys.up.x + chroma.keys.up.w + key_gutter_size + key_width_1_00,
    'y': y4,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.numpad_2 = {
    'label': '2',
    'x': chroma.keys.numpad_1.x + chroma.keys.numpad_1.w,
    'y': y4,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.numpad_3 = {
    'label': '3',
    'x': chroma.keys.numpad_2.x + chroma.keys.numpad_2.w,
    'y': y4,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.numpad_enter = {
    'label': '↵',
    'x': chroma.keys.numpad_3.x + chroma.keys.numpad_3.w,
    'y': y4,
    'w': key_width_1_00,
    'h': key_height_2_00
  };

  // Sixth row
  chroma.keys.control_left = {
    'label': 'ctrl',
    'x': 0,
    'y': y5,
    'w': key_width_1_50,
    'h': key_height_1_00
  };
  chroma.keys.meta = {
    'label': '⊞',
    'x': chroma.keys.control_left.x + chroma.keys.control_left.w,
    'y': y5,
    'w': key_width_1_25,
    'h': key_height_1_00
  };
  chroma.keys.alt_left = {
    'label': 'alt',
    'x': chroma.keys.meta.x + chroma.keys.meta.w,
    'y': y5,
    'w': key_width_1_25,
    'h': key_height_1_00
  };
  chroma.keys.space = {
    'label': '',
    'x': chroma.keys.alt_left.x + chroma.keys.alt_left.w,
    'y': y5,
    'w': key_width_5_75,
    'h': key_height_1_00
  };
  chroma.keys.alt_right = {
    'label': 'alt',
    'x': chroma.keys.space.x + chroma.keys.space.w,
    'y': y5,
    'w': key_width_1_25,
    'h': key_height_1_00
  };
  chroma.keys.fn = {
    'label': 'fn',
    'x': chroma.keys.alt_right.x + chroma.keys.alt_right.w,
    'y': y5,
    'w': key_width_1_25,
    'h': key_height_1_00
  };
  chroma.keys.context_menu = {
    'label': '☰',
    'x': chroma.keys.fn.x + chroma.keys.fn.w,
    'y': y5,
    'w': key_width_1_25,
    'h': key_height_1_00
  };
  chroma.keys.control_right = {
    'label': 'ctrl',
    'x': chroma.keys.context_menu.x + chroma.keys.context_menu.w,
    'y': y5,
    'w': key_width_1_50,
    'h': key_height_1_00
  };
  chroma.keys.left = {
    'label': '◀',
    'x': chroma.keys.control_right.x + chroma.keys.control_right.w + key_gutter_size,
    'y': y5,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.down = {
    'label': '▼',
    'x': chroma.keys.left.x + chroma.keys.left.w,
    'y': y5,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.right = {
    'label': '▶',
    'x': chroma.keys.down.x + chroma.keys.down.w,
    'y': y5,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
  chroma.keys.numpad_0 = {
    'label': '0',
    'x': chroma.keys.right.x + chroma.keys.right.w + key_gutter_size,
    'y': y5,
    'w': key_width_2_00,
    'h': key_height_1_00
  };
  chroma.keys.numpad_decimal = {
    'label': '.',
    'x': chroma.keys.numpad_0.x + chroma.keys.numpad_0.w,
    'y': y5,
    'w': key_width_1_00,
    'h': key_height_1_00
  };
};

/**
 * Generate a normalized array of keys where each key is mapped to a specific
 * position on the canvas. This is used as a cache so mapping colors to keys
 * can be done quickly.
 *
 * Additionally convert that same array to an array indexed by position. This
 * is used when iterating over a canvas to determine if a pixel should be
 * filled or not based on a list of keys (so the key parameter on an effect).
 */
chroma.generate_keys_normalized = function() {
  // Get the virtual keyboard dimensions.
  var virtual_keyboard_width = 0;
  var virtual_keyboard_height = 0;
  for (var key in chroma.keys) {
    virtual_keyboard_width = Math.max(
      virtual_keyboard_width,
      chroma.keys[key].x + chroma.keys[key].w
    );
    virtual_keyboard_height = Math.max(
      virtual_keyboard_height,
      chroma.keys[key].y + chroma.keys[key].h
    );
  }

  for (var key in chroma.keys) {
    // Center
    var cx = chroma.keys[key].x + (chroma.keys[key].w / 2);
    var cy = chroma.keys[key].y + (chroma.keys[key].h / 2);

    var x = Math.floor(cx / virtual_keyboard_width * chroma.canvas_width);
    var y = Math.floor(cy / virtual_keyboard_height * chroma.canvas_height);

    // Normalized and indexed by key.
    chroma.keys_normalized[key] = {
      'x': x,
      'y': y
    };

    // Normalized and indexed by position.
    if (chroma.keys_normalized_pos[y] === undefined) {
      chroma.keys_normalized_pos[y] = [];
    }
    if (chroma.keys_normalized_pos[y][x] === undefined) {
      chroma.keys_normalized_pos[y][x] = [];
    }
    chroma.keys_normalized_pos[y][x].push(key);
  }
};

/**
 * Generate an empty canvas.
 *
 * @return {canvas} The empty canvas.
 */
chroma.generate_blank_canvas = function() {
  var canvas = [];
  for (var y = 0; y < chroma.canvas_height; y++) {
    canvas.push([]);
    for (var x = 0; x < chroma.canvas_width; x++) {
      canvas[canvas.length - 1].push(null);
      // todo replace this with the background stuff
      // canvas[canvas.length - 1].push(chroma.rgb(0, 0, 0));
    }
  }

  return canvas;
};
