var $ = rocket.extend(rocket.$, rocket);

$.ready(function() {

  var examples = [];
  examples.push({
    'name': 'Blank',
    'description': 'Does nothing :)',
    'settings': {
      'tracks': {},
      'effects': {},
      'triggers': {}
    }
  });
  examples.push({
    'name': 'Static Color',
    'description': 'A single static color spanning the entire keyboard.',
    'settings': {
      'tracks': {
        'Static Blue': {
          'type': 'static',
          'color': '#00f'
        }
      },
      'effects': {
        'Static Blue': {
          'tracks': ['Static Blue'],
          'autorun': true
        }
      },
      'triggers': {}
    }
  });
  examples.push({
    'name': 'Trigger Happy',
    'description': 'Demonstrating that you can trigger effects on a completely separate set of keys than what you press.',
    'settings': {
      'tracks': {
        'Pulse Numpad': {
          'type': 'pulse',
          'keys': ['<numpad>'],
          'density': 1,
          'repeat': 1
        }
      },
      'effects': {
        'Pulse Numpad': {
          'tracks': ['Pulse Numpad'],
          'autorun': false
        }
      },
      'triggers': {
        'foo': {
          'effect': 'Pulse Numpad',
          'keys': ['<all>']
        }
      }
    }
  });
  examples.push({
    'name': 'Blend Tech',
    'description': 'A static green color is placed on top of a static red color with blend_mode set to "lighten". This creates a static yellow color.',
    'settings': {
      'tracks': {
        'Static Red': {
          'type': 'static',
          'color': '#f00'
        },
        'Static Green': {
          'type': 'static',
          'color': '#0f0',
          'blend_mode': 'lighten'
        }
      },
      'effects': {
        'Static Yellow': {
          'tracks': ['Static Red', 'Static Green'],
          'autorun': true
        }
      },
      'triggers': {}
    }
  });
  examples.push({
    'name': 'Delay & Rest',
    'description': 'Demonstrates how to delay tracks from starting and rest between iterations. This spells "HOT DOG" one key at a time, then repeats forever.',
    'settings': {
      'tracks': {
        'H': {
          'type': 'pulse',
          'keys': ['h'],
          'density': 1,
          'delay': 0,
          'rest': 5000
        },
        'O': {
          'type': 'pulse',
          'keys': ['o'],
          'density': 1,
          'delay': 1000,
          'rest': 5000
        },
        'T': {
          'type': 'pulse',
          'keys': ['t'],
          'density': 1,
          'delay': 2000,
          'rest': 5000
        },
        'D': {
          'type': 'pulse',
          'keys': ['d'],
          'density': 1,
          'delay': 3000,
          'rest': 5000
        },
        'O_': {
          'type': 'pulse',
          'keys': ['o'],
          'density': 1,
          'delay': 4000,
          'rest': 5000
        },
        'G': {
          'type': 'pulse',
          'keys': ['g'],
          'density': 1,
          'delay': 5000,
          'rest': 5000
        }
      },
      'effects': {
        'HOT DOG': {
          'tracks': ['H', 'O', 'T', 'D', 'O_', 'G'],
          'autorun': true
        }
      },
      'triggers': {}
    }
  });
  examples.push({
    'name': 'Delay',
    'description': 'Demonstrates how to delay tracks from starting. This spells "HOT DOG" (once) one key at a time.',
    'settings': {
      'tracks': {
        'H': {
          'type': 'pulse',
          'keys': ['h'],
          'density': 1,
          'delay': 0,
          'repeat': 1
        },
        'O': {
          'type': 'pulse',
          'keys': ['o'],
          'density': 1,
          'delay': 1000,
          'repeat': 1
        },
        'T': {
          'type': 'pulse',
          'keys': ['t'],
          'density': 1,
          'delay': 2000,
          'repeat': 1
        },
        'D': {
          'type': 'pulse',
          'keys': ['d'],
          'density': 1,
          'delay': 3000,
          'repeat': 1
        },
        'O_': {
          'type': 'pulse',
          'keys': ['o'],
          'density': 1,
          'delay': 4000,
          'repeat': 1
        },
        'G': {
          'type': 'pulse',
          'keys': ['g'],
          'density': 1,
          'delay': 5000,
          'repeat': 1
        }
      },
      'effects': {
        'HOT DOG': {
          'tracks': ['H', 'O', 'T', 'D', 'O_', 'G'],
          'autorun': true
        }
      },
      'triggers': {}
    }
  });
  examples.push({
    'name': 'Density Demo',
    'description': 'Showing how to use different densities for random or focused effects.',
    'settings': {
      'tracks': {
        '50%': {
          'type': 'pulse',
          'colors': ['#0f0'],
          'density': 0.5
        },
        '10%': {
          'type': 'pulse',
          'colors': ['#00f'],
          'density': 0.1
        },
        '100% Single Key': {
          'type': 'pulse',
          'colors': ['#f00'],
          'keys': ['escape'],
          'density': 1
        }
      },
      'effects': {
        'Static Blue': {
          'tracks': ['50%', '10%', '100% Single Key'],
          'autorun': true
        }
      },
      'triggers': {}
    }
  });
  examples.push({
    'name': 'Ease Demo',
    'description': 'There are several different ease functions available.',
    'settings': {
      'tracks': {
        'Linear': {
          'type': 'pulse',
          'colors': ['#f00'],
          'keys': ['q'],
          'ease_in_function': 'linear',
          'ease_out_function': 'linear',
          'density': 1
        },
        'Sine': {
          'type': 'pulse',
          'colors': ['#f00'],
          'keys': ['w'],
          'ease_in_function': 'sine',
          'ease_out_function': 'sine',
          'density': 1
        },
        'Bounce': {
          'type': 'pulse',
          'colors': ['#f00'],
          'keys': ['e'],
          'ease_in_function': 'bounce',
          'ease_out_function': 'bounce',
          'density': 1
        },
        'Cubic': {
          'type': 'pulse',
          'colors': ['#f00'],
          'keys': ['r'],
          'ease_in_function': 'cubic',
          'ease_out_function': 'cubic',
          'density': 1
        }
      },
      'effects': {
        'Eases': {
          'tracks': ['Linear', 'Sine', 'Bounce', 'Cubic'],
          'autorun': true
        }
      },
      'triggers': {}
    }
  });
  examples.push({
    'name': 'Ignore Key',
    'description': 'You can select a large group of keys and then trivially remove a small subset of them.',
    'settings': {
      'tracks': {
        'Static Red': {
          'type': 'static',
          'color': '#f00',
          'keys': ['<all>'],
          'keys_ignore': ['a', 'e', 'i', 'o', 'u']
        }
      },
      'effects': {
        'Static Red': {
          'tracks': ['Static Red'],
          'autorun': true
        }
      },
      'triggers': {}
    }
  });
  examples.push({
    'name': 'Static Regions',
    'description': 'Using multiple static tracks over different key regions.',
    'settings': {
      'tracks': {
        'Static Red': {
          'type': 'static',
          'color': '#f00',
          'keys': ['escape']
        },
        'Static Green': {
          'type': 'static',
          'color': '#0f0',
          'keys': ['<arrow>']
        },
        'Static Blue': {
          'type': 'static',
          'color': '#00f',
          'keys': ['<letter>']
        },
        'Static Yellow': {
          'type': 'static',
          'color': '#ff0',
          'keys': ['<function>']
        },
        'Static Teal': {
          'type': 'static',
          'color': '#0ff',
          'keys': ['<numpad>']
        },
        'Static White': {
          'type': 'static',
          'color': '#fff',
          'keys': ['<wasd>']
        }
      },
      'effects': {
        'Static Blue': {
          'tracks': ['Static Red', 'Static Green', 'Static Blue', 'Static Yellow', 'Static Teal', 'Static White'],
          'autorun': true
        }
      },
      'triggers': {}
    }
  });
  examples.push({
    'name': 'Persist Demo',
    'description': 'Persist the state of a key after a track has completed running. Start typing and note that the keys light up and never turn off.',
    'settings': {
      'tracks': {
        'white_pulse_on_type': {
          'type': 'pulse',
          'ease_in_function': 'cubic',
          'colors': ['#fff'],
          'keys': ['<trigger>'],
          'repeat': 1,
          'density': 1,
          'persist': true
        }
      },
      'effects': {
        'white_pulse_on_type': {
          'tracks': ['white_pulse_on_type'],
          'autorun': false
        }
      },
      'triggers': {
        'white_pulse_on_type': {
          'effect': 'white_pulse_on_type',
          'keys': ['<all>']
        }
      }
    }
  });
  examples.push({
    'name': 'Rotate Colors',
    'description': 'Rotate all keys slowly between random colors.',
    'settings': {
      'tracks': {
        'Rotate Colors': {
          'type': 'pulse',
          'distinct_colors': 1,
          'duration': 3000,
          'ease_in_duration': 3000,
          'ease_in_function': 'sine',
          'density': 1,
          'persist': true
        }
      },
      'effects': {
        'Rotate Colors': {
          'tracks': ['Rotate Colors'],
          'autorun': true
        }
      },
      'triggers': {}
    }
  });
  examples.push({
    'name': 'Lava With Trigger',
    'description': 'Cool lava/fire effect with a trigger on key press',
    'settings': {
      'tracks': {
        'static_dark_red': {
          'type': 'static',
          'color': '#400'
        },
        'lava_red_0_delay': {
          'type': 'pulse',
          'colors': ['#f00'],
          'density': 0.2,
          'delay': 0,
          'duration': 2000,
          'ease_in_duration': 1000,
          'ease_out_duration': 1000
        },
        'lava_orange_200_delay': {
          'type': 'pulse',
          'colors': ['#f70'],
          'density': 0.2,
          'delay': 200,
          'duration': 2000,
          'ease_in_duration': 1000,
          'ease_out_duration': 1000
        },
        'lava_red_400_delay': {
          'type': 'pulse',
          'colors': ['#f00'],
          'density': 0.2,
          'delay': 400,
          'duration': 2000,
          'ease_in_duration': 1000,
          'ease_out_duration': 1000
        },
        'lava_orange_600_delay': {
          'type': 'pulse',
          'colors': ['#f70'],
          'density': 0.2,
          'delay': 600,
          'duration': 2000,
          'ease_in_duration': 1000,
          'ease_out_duration': 1000
        },
        'lava_red_800_delay': {
          'type': 'pulse',
          'colors': ['#f00'],
          'density': 0.2,
          'delay': 800,
          'duration': 2000,
          'ease_in_duration': 1000,
          'ease_out_duration': 1000
        },
        'white_pulse_on_type': {
          'type': 'pulse',
          'ease_in_function': 'cubic',
          'colors': ['#fff'],
          'keys': ['<trigger>'],
          'repeat': 1,
          'density': 1
        }
      },
      'effects': {
        'hot_lava': {
          'tracks': ['static_dark_red', 'lava_red_0_delay', 'lava_orange_200_delay', 'lava_red_400_delay', 'lava_orange_600_delay', 'lava_red_800_delay'],
          'autorun': true
        },
        'white_pulse_on_type': {
          'tracks': ['white_pulse_on_type'],
          'autorun': false
        }
      },
      'triggers': {
        'white_pulse_on_type': {
          'effect': 'white_pulse_on_type',
          'keys': ['<all>']
        }
      }
    }
  });

  var default_settings = examples[2].settings;
  var chroma_ = new chroma(default_settings);
  // var chroma_;

  var body = $('body');

  var table = new jex.table({
    'rows': 1,
    'columns': 2
  });
  table.table().style({
    'width': '100%',
    'height': '100%'
  });
  body.appendChild(table.table());

  // Editor
  var editor_div = $.createElement('div')
    .setAttribute('id', 'foo')
    .style({
      'width': '100%',
      'height': '100%'
    });
  table.td(0, 0).appendChild(editor_div);
  table.td(0, 0).style('width', '600px');

  var editor = ace.edit('foo');
  editor.setTheme('ace/theme/chaos');
  editor.getSession().setMode('ace/mode/json');
  editor.getSession().setTabSize(2);
  editor.setShowPrintMargin(false);
  editor.setValue(JSON.stringify(default_settings, null, 2), -1);
  editor.getSession().on('change', function() {
    try {
      var settings = JSON.parse(editor.getValue());
      chroma_.stop();
      chroma_ = new chroma(settings);
      chroma_.start(callback);
    } catch (e) {
      chroma_.stop();
      chroma_ = new chroma({
        'tracks': {},
        'effects': {},
        'triggers': {}
      });
      chroma_.start(callback);
    }
  });

  // Keyboard
  var keyboard_div = $.createElement('div');
  table.td(1, 0)
    .style('padding-left', '20px')
    .setAttribute('valign', 'top');
  table.td(1, 0).appendChild(keyboard_div);

  // Examples dropdown
  var select = $.createElement('select');
  table.td(1, 0).appendChild(select);

  var description = $.createElement('div')
    .style('color', '#777');
  table.td(1, 0).appendChild(description);

  examples.forEach(function(example, i) {
    var option = $.createElement('option')
      .innerHTML(example.name);
    select.appendChild(option);
  });
  select.addEventListener('change', function() {
    editor.setValue(JSON.stringify(examples[select[0].selectedIndex].settings, null, 2), -1);
    description.innerHTML(examples[select[0].selectedIndex].description);
  });

  var callback = function(canvas) {
    keyboard_div.innerHTML('');

    window.canvas_container = $.createElement('div')
      .style({'display': 'inline-block'});
    keyboard_div.appendChild(window.canvas_container);

    var keyboard_image_container = $.createElement('div')
      .style({
        'position': 'relative',
        'height': '360px'
      });
    keyboard_div.appendChild(keyboard_image_container);

    // var keyboard_container = $.createElement('div')
    //   .style({
    //     'position': 'relative',
    //     'height': '200px'
    //   });
    // keyboard_div.appendChild(keyboard_container);

    chroma.decorate_keyboard_image(keyboard_image_container, canvas);
  };

  chroma_.start(callback);
});

/*chroma.decorate_keyboard = function(parent, canvas) {
  // Width of the border around each key to spread them out
  var key_border_width = 1;

  var keys = chroma.keys;

  for (var key in keys) {
    var rgb = chroma.sample(
      canvas,
      key
    );

    var div = $.createElement('div')
      .style({
        'position': 'absolute',
        'left': keys[key].x,
        'top': keys[key].y,
        'width': keys[key].w + 'px',
        'height': keys[key].h + 'px',
        'background': 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')',
        'line-height': (keys[key].h - key_border_width) + 'px',
        'text-align': 'center',
        'color': '#fff',
        'font-family': 'Open Sans',
        'font-size': '12px',
        'box-sizing': 'border-box',
        'border': key_border_width + 'px solid #000',
        'border-radius': '5px'
      })
      .innerHTML(keys[key].label);

    parent.appendChild(div);
  }
};*/

chroma.decorate_keyboard_image = function(parent, canvas) {
  for (var key in chroma.keys) {
    var rgb = chroma.sample(
      canvas,
      key
    );

    if(rgb === null) {
      rgb = chroma.rgb(0, 0, 0);
    }

    var key_size = 2;
    var div = $.createElement('div')
      .style({
        // 'z-index': 5,
        'position': 'absolute',
        'left': (29 + chroma.keys[key].x + (chroma.keys[key].w / 2) - key_size / 2) + 'px',
        'top': (41 + chroma.keys[key].y + (chroma.keys[key].h / 2) - key_size / 2) + 'px',
        'width': key_size + 'px',
        'height': key_size + 'px',
        'background': 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')',
        'box-sizing': 'border-box',
        'border-radius': '50%',
        'box-shadow': '0px 0px 25px 25px ' + 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')'
      });
    parent.appendChild(div);
  }

  var image = $.createElement('img')
    .setAttribute('src', 'img/ornata_chroma.png')
    .style({
      'position': 'absolute'
    });
  parent.appendChild(image);
};

/*chroma.decorate_canvas = function(parent, canvas) {
  var pixel_width = 10;
  var pixel_height = pixel_width;

  var row;
  var pixel;
  for (var y = 0; y < canvas.length; y++) {
    row = $.createElement('div')
      .style({'height': pixel_height});
    parent.appendChild(row);
    for (var x = 0; x < canvas[y].length; x++) {

      var background;
      if (canvas[y][x] === null) {
        background = 'rgb(0, 0, 0)';
      } else {
        background = 'rgb(' + canvas[y][x].r + ',' + canvas[y][x].g + ',' + canvas[y][x].b + ')';
      }

      pixel = $.createElement('div')
        .style({
          'width': pixel_width + 'px',
          'height': pixel_height + 'px',
          'background': background,
          'display': 'inline-block'
        });
      row.appendChild(pixel);
    }
  }
};*/

