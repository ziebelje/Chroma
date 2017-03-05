var fs = require('fs');

// file is included here:
eval(fs.readFileSync('./js/lib/rocket.js')+'');
eval(fs.readFileSync('./js/lib/jex.js')+'');
eval(fs.readFileSync('./js/lib/seedrandom.js')+'');
eval(fs.readFileSync('./js/chroma.js')+'');
eval(fs.readFileSync('./js/effect.js')+'');
eval(fs.readFileSync('./js/effect/static.js')+'');
eval(fs.readFileSync('./js/effect/pulse.js')+'');
eval(fs.readFileSync('./js/blend.js')+'');
eval(fs.readFileSync('./js/blend/normal.js')+'');
eval(fs.readFileSync('./js/blend/lighten.js')+'');
eval(fs.readFileSync('./js/ease.js')+'');
eval(fs.readFileSync('./js/ease/linear.js')+'');
eval(fs.readFileSync('./js/ease/bounce.js')+'');
eval(fs.readFileSync('./js/ease/sine.js')+'');
eval(fs.readFileSync('./js/ease/cubic.js')+'');

  var effects = [
    {
      'type': 'static',
      'on': true,
      'settings': {
        'color': {
          'r': 0,
          'g': 0,
          'b': 0
        },
        'blend_mode': 'normal'
        // 'keys': ['esc', 'f1']
        // 'keys': ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12']
      }
    },
    {
      'type': 'pulse',
      'on': true,
      'settings': {
        'duration': 1000,
        'ease_in_function': 'bounce',
        'ease_in_duration': 500,
        'ease_out_duration': 500,
        'delay': 0,
        'density': 0.5,
        // 'colors': [
        //   {'r': 255, 'g': 0, 'b': 0}
        // ],
        // 'keys': ['b']
      }
    },
    {
      'type': 'pulse',
      'on': false,
      'settings': {
        'duration': 1000,
        'ease_in_function': 'cubic',
        'ease_in_duration': 500,
        'ease_out_duration': 500,
        'delay': 250,
        'density': 0.5,
        'colors': [
          {'r': 200, 'g': 0, 'b': 0}
        ]
      }
    },
    {
      'type': 'pulse',
      'on': false,
      'settings': {
        'duration': 1000,
        'ease_in_function': 'cubic',
        'ease_in_duration': 500,
        'ease_out_duration': 500,
        'delay': 500,
        'density': 0.5,
        'colors': [
          {'r': 255, 'g': 100, 'b': 0}
        ]
      }
    },
    {
      'type': 'pulse',
      'on': false,
      'settings': {
        'duration': 1000,
        'ease_in_function': 'cubic',
        'ease_in_duration': 500,
        'ease_out_duration': 500,
        'delay': 750,
        'density': 0.5,
        'colors': [
          {'r': 200, 'g': 100, 'b': 0}
        ]
      }
    }
  ];








const chroma2 = require('razer-chroma')
const utils = require('./samples/utils')

if (chroma2.initialize()) {

  effects.forEach(function(effect) {
    effect.settings = chroma.effect.apply_defaults(
      chroma.effect[effect.type].defaults,
      effect.settings
    );
    effect.settings.guid = Math.random();
  });

  var t = 0;
  var interval_ms = 33;

  var output_array = [];
  for(var y = 0; y < 6; y++) {
    output_array.push([]);
    for(var x = 0; x < 22; x++) {
      output_array[output_array.length - 1].push({
        'red': 0,
        'green': 0,
        'blue': 0
      })
    }
  }

  // console.log('got here once');
  setInterval(function() {
    var hrTime = process.hrtime();
    var start = (hrTime[0] * 1000000 + hrTime[1] / 1000);
    t += interval_ms;
    var canvas = chroma.generate_canvas(effects, t);
    // console.log(canvas);



    for (var key in chroma.keys) {
      var rgb = chroma.sample(
        canvas,
        key
      );

      if (chroma.led_profile[key] !== undefined) {
        output_array[chroma.led_profile[key].y][chroma.led_profile[key].x] = {
          'red': rgb.r,
          'green': rgb.g,
          'blue': rgb.b
        };
      }

      // output_array[0][1] = {
      //   'red': 255,
      //   'green': 0,
      //   'blue': 0
      // };

      // output_array[5][7] = {
      //   'red': 255,
      //   'green': 0,
      //   'blue': 0
      // };

      // output_array[chroma.keys[key].ky][chroma.keys[key].kx] = {
      //   'red': rgb.r,
      //   'green': rgb.g,
      //   'blue': rgb.b
      // };

      // console.log('TEST');
      // console.log('TEST');
      // console.log('TEST');
      // console.log('TEST');
      // console.log('TEST');
      // console.log('TEST');
      // console.log('TEST');
      // console.log('TEST');
      // console.log('TEST');
      // console.log('TEST');
      // console.log('TEST');
      // console.log('TEST');
      // console.log('TEST');
      // console.log('TEST');
      // console.log('TEST');
      // console.log('TEST');
      // console.log('TEST');
      // console.log(output_array);



    }
    var hrTime = process.hrtime();
    var stop = (hrTime[0] * 1000000 + hrTime[1] / 1000);
    console.log(Math.random());
    chroma2.Keyboard.setCustom(output_array);
    var hrTime = process.hrtime();
    var stop_update = (hrTime[0] * 1000000 + hrTime[1] / 1000);

    // console.log(start);
    // console.log(stop);
    // console.log(stop_update);

    // console.log(((stop-start)/1000) + 'ms - run my code');
    // console.log(((stop_update-stop)/1000) + 'ms - update keyboard');

  }, interval_ms);

  utils.pressKeyToExit(chroma2)

}
else {
  console.log('failed to init');
}
