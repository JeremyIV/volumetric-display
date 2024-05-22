function out_of_bounds(row, col, lev) {
  return (
    row < 0 ||
    row >= num_rows ||
    col < 0 ||
    col >= num_cols ||
    lev < 0 ||
    lev >= num_levs
  );
}

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

timestep = 0;

function get_update_automata(init_context, next_cell) {
  // next_cell: function that takes in the grid and the current cell position, returns the new cell.

  function update_automata(context) {
    if (context === null) {
      return init_context();
    }
    let new_grid = [];
    let new_color_array = [];
    for (let row = 0; row < num_rows; row++) {
      for (let col = 0; col < num_cols; col++) {
        for (let lev = 0; lev < num_levs; lev++) {
          //console.log(timestep);
          let new_cell = next_cell(context.grid, row, col, lev, timestep);
          new_grid.push(new_cell);
          new_color_array.push(new_cell.color);
        }
      }
    }

    let new_context = {
      grid: new_grid,
      color_array: new_color_array,
    };
    timestep++;
    return new_context;
  }

  return update_automata;
}
