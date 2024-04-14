value_colors = [
  [0, 0, 0],
  [0.2, 0.2, 0.2],
  [0.4, 0.4, 0.4],
  [0.6, 0.6, 0.6],
  [0.8, 0.8, 0.8],
  [1.0, 1.0, 1.0], // 5
  [1.0, 0.0, 0.0], // "overflow", turn red
  [1.0, 0.0, 0.2],
  [1.0, 0.0, 0.4],
  [1.0, 0.0, 0.6],
  [1.0, 0.0, 0.8],
];

function coord_to_index(row, col, lev) {
  let index = lev + col * num_levs + row * num_levs * num_cols;
  return index;
}

function index_to_coord(index) {
  row = Math.trunc(index / (num_levs * num_cols));
  col = Math.trunc(index / num_levs) % num_cols; // - row * num_levs * num_cols;
  lev = index % num_levs;
  return { row, col, lev };
}

function init_volume(fill_value) {
  let volume = [];
  for (let row = 0; row < num_rows; row++) {
    for (let col = 0; col < num_cols; col++) {
      for (let lev = 0; lev < num_levs; lev++) {
        volume.push(fill_value);
      }
    }
  }
  return volume;
}

function init_context() {
  let values = init_volume(0);
  let color_array = init_volume(value_colors[0]);

  let context = { is_clean: true, values, color_array };
  return context;
}

function get_volume_center_index() {
  let center_row = Math.trunc(num_rows / 2);
  let center_col = Math.trunc(num_cols / 2);
  let center_lev = Math.trunc(num_levs / 2);

  return coord_to_index(center_row, center_col, center_lev);
}

function in_bounds_coord(row, col, lev) {
  let row_in_bounds = row >= 0 && row < num_rows;
  let col_in_bounds = col >= 0 && col < num_cols;
  let lev_in_bounds = lev >= 0 && lev < num_levs;

  return row_in_bounds && col_in_bounds && lev_in_bounds;
}

function in_bounds_index(index) {
  let coords = index_to_coord(index);
  return in_bounds_coord(coords.row, coords.col, coords.lev);
}

function get_neighbor_indices(row, col, lev) {
  let neighbors_all = [];
  let neighbors_valid = [];

  neighbors_all.push(coord_to_index(row - 1, col, lev));
  neighbors_all.push(coord_to_index(row + 1, col, lev));
  neighbors_all.push(coord_to_index(row, col - 1, lev));
  neighbors_all.push(coord_to_index(row, col + 1, lev));
  neighbors_all.push(coord_to_index(row, col, lev - 1));
  neighbors_all.push(coord_to_index(row, col, lev + 1));

  for (let i = 0; i < 6; i++) {
    if (in_bounds_index(neighbors_all[i])) {
      neighbors_valid.push(neighbors_all[i]);
    }
  }
  return neighbors_valid;
}

function update_sandpiles(context) {
  // context will contain:
  // values: a 3d array of the values at each location in the sandpile
  // color_array: same as always
  // is_clean: if true, then add 1 to the center of the values array before computing the next step
  if (context === null) {
    //initialize the first context
    context = init_context();
  }

  let is_clean = true;
  let new_values = init_volume(0);
  let new_color_array = [];

  if (context.is_clean) {
    //drop a grain of sand at the center
    let center_index = get_volume_center_index();
    new_values[center_index] += 1;
  }

  `TODO:
  for each row, col, lev:
    get the value from context.values

    new values[row][col][lev] +=value
    if value > 5:
      set is_clean to false
      new values[row][col][lev] -= 6
      for each neighbor:
        increment by 1
  `;

  //topple logic
  for (let row = 0; row < num_rows; row++) {
    for (let col = 0; col < num_cols; col++) {
      for (let lev = 0; lev < num_levs; lev++) {
        let index = coord_to_index(row, col, lev);
        let old_value = context.values[index];
        if (old_value > 5) {
          is_clean = false;
          new_values[index] -= 6;

          for (let neighbor_index of get_neighbor_indices(row, col, lev)) {
            new_values[neighbor_index] += 1;
          }
        }

        new_values[index] += old_value;
      }
    }
  }

  //calculate colors from the sandpile values calculated above
  for (let i = 0; i < new_values.length; i++) {
    new_color_array.push(value_colors[new_values[i]]);
  }

  let new_context = {
    is_clean,
    values: new_values,
    color_array: new_color_array,
  };

  return new_context;
}
