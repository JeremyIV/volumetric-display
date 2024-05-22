function life_init_context() {
  let new_grid = [];
  let new_color_array = [];
  for (let row = 0; row < num_rows; row++) {
    for (let col = 0; col < num_cols; col++) {
      for (let lev = 0; lev < num_levs; lev++) {
        let new_cell = {
          alive: Math.random() < 0.01,
        };
        new_cell["color"] = new_cell.alive ? [1, 1, 1] : [0, 0, 0];
        new_grid.push(new_cell);
        new_color_array.push(new_cell.color);
      }
    }
  }

  return {
    grid: new_grid,
    color_array: new_color_array,
  };
}

function life_next_cell(grid, row, col, lev) {
  let is_alive = grid[coord_to_index(row, col, lev)].alive;
  let n_living_neighbors = 0;

  for (let nrow of [row - 1, row, row + 1]) {
    for (let ncol of [col - 1, col, col + 1]) {
      for (let nlev of [lev - 1, lev, lev + 1]) {
        if (!out_of_bounds(nrow, ncol, nlev)) {
          let idx = coord_to_index(nrow, ncol, nlev);
          cell = grid[idx];
          if (cell.alive) {
            n_living_neighbors++;
          }
        }
      }
    }
  }

  let alive =
    n_living_neighbors < 4 &&
    ((is_alive && n_living_neighbors > 1) || n_living_neighbors > 2);

  new_cell = {
    alive: alive,
    color: alive ? [1, 1, 1] : [0, 0, 0],
  };
  return new_cell;
}
