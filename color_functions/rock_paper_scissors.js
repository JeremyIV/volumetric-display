// TODO
// reaction diffusion equations
// each cell has some quantity of substances A and B
// at each timestep, they diffuse into neighboring cells
// at each timestep, reactions occur within a cell based on their mixture of substances.

// du/dt = ru del^2 u - uv^2 + f(1-u)
// dv/dt = rv del^2 v + uv^2 - (f + k)v

// u wants to saturate to 1
// v wants to decay to 0
// I guess the idea is that v must decay faster than u saturates?
// u and v both diffuse
// u gets converted to v at a rate uv^2

function get_color(state) {
  if (state === 1) {
    return [1, 0, 0];
  }
  if (state === 2) {
    return [0, 1, 0];
  }

  if (state === 3) {
    return [0, 0, 1];
  }
}

function RPS_init_context() {
  let new_grid = [];
  let new_color_array = [];
  for (let row = 0; row < num_rows; row++) {
    for (let col = 0; col < num_cols; col++) {
      for (let lev = 0; lev < num_levs; lev++) {
        // set state to random number between 1 and 3
        let x = Math.random();
        let state = 1;
        if (x < 1 / 3) {
          state = 2;
        } else if (x < 2 / 3) {
          state = 3;
        }
        let new_cell = {
          state,
          color: get_color(state),
        };
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

function RPS_next_cell(grid, row, col, lev, time) {
  //console.log(time);
  let cell = grid[coord_to_index(row, col, lev)];

  let old_state = cell.state;
  let count_1 = 0;
  let count_2 = 0;
  let count_3 = 0;

  for (let nrow of [row - 1, row, row + 1]) {
    for (let ncol of [col - 1, col, col + 1]) {
      for (let nlev of [lev - 1, lev, lev + 1]) {
        nrow = (nrow + num_rows) % num_rows;
        ncol = (ncol + num_cols) % num_cols;
        nlev = (nlev + num_levs) % num_levs;
        if (!out_of_bounds(nrow, ncol, nlev)) {
          let idx = coord_to_index(nrow, ncol, nlev);
          cell = grid[idx];
          if (cell.state === 1) {
            count_1++;
          } else if (cell.state === 2) {
            count_2++;
          } else if (cell.state === 3) {
            count_3++;
          }
        }
      }
    }
  }

  let new_state = old_state;
  let THRESHOLD = 8;
  // TODO:
  if (old_state == 1) {
    if (count_2 > THRESHOLD) {
      new_state = 2;
    }
  }
  if (old_state == 2) {
    if (count_3 > THRESHOLD) {
      new_state = 3;
    }
  }
  if (old_state == 3) {
    if (count_1 > THRESHOLD) {
      new_state = 1;
    }
  }

  // randomize
  //if (Math.random() < 0.1) {
  //  new_state = Math.floor(Math.random() * 3) + 1;
  //}

  new_cell = {
    state: new_state,
    color: get_color(new_state),
  };
  return new_cell;
}
