////////////////////////////////////////////////
// UPDATE COLORS
let context = null;

function callAtFrequency(frequency, callback) {
  // Calculate the interval in milliseconds for the given frequency
  const interval = 1000 / frequency;

  // Use setInterval to call the callback function at the calculated interval
  const intervalId = setInterval(callback, interval);

  // Return a function to stop the interval
  return function stop() {
    clearInterval(intervalId);
  };
}

// The returned context always contains an attribute "color_array"
// color_array is of shape N,3, where N is the # of lights
function calculate_colors(context) {
  let index = 0;
  let color_array = [];

  for (let row = 0; row < num_rows; row++) {
    for (let col = 0; col < num_cols; col++) {
      for (let lev = 0; lev < num_levs; lev++) {
        let new_color = [];
        for (let i = 0; i < 3; i++) {
          let new_value = context === null ? 0 : context.color_array[index][i];
          new_value += (0.1 * index) / (3 * num_cols * num_levs * num_rows);
          if (new_value > 1) {
            new_value = 0;
          }
          new_color.push(new_value);
        }
        index++;
        color_array.push(new_color);
      }
    }
  }
  let new_context = { color_array: color_array };

  return new_context;
}

//color_array is per-triangle
//color_data is per-vertex
update_rule = get_update_automata(sandpile_next_cell, sandpile_next_cell);
function update_colors() {
  //console.log();
  context = update_rule(context); //calculate_colors(context);
  //console.log(context);
  color_array = context.color_array; //array of shape n,3
  let color_data = []; //array of shape n*3*3
  for (let i = 0; i < color_array.length; i++) {
    for (let j = 0; j < 3; j++) {
      //for each vert
      for (let k = 0; k < 3; k++) {
        //for each color channel
        color_data.push(color_array[i][k]);
      }
    }
  }
  //console.log(color_data);
  gl.bindBuffer(gl.ARRAY_BUFFER, color_data_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color_data), gl.STATIC_DRAW);
  drawScene();
}

// Example usage:
const frequency = 20; // Call the function 24 times per second
const stopCalling = callAtFrequency(frequency, update_colors);
