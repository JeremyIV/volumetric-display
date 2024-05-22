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

U_diffusion_rate = 10;
V_diffusion_rate = 10;
reaction_rate = 190;
U_concentration_rate = 2.8;
V_decay_rate = 2.8 + 6.2;
dt = 0.01;

function get_color(u, v) {
  //return [Math.pow(u, 1 / 3), Math.pow(v, 1 / 3), 0];
  return [0, Math.pow(v, 1 / 3), 0];
}

function RD_init_context() {
  let new_grid = [];
  let new_color_array = [];
  for (let row = 0; row < num_rows; row++) {
    for (let col = 0; col < num_cols; col++) {
      for (let lev = 0; lev < num_levs; lev++) {
        let u = 0.5;
        let v = 0;
        //if (row === 0) {
        //  u = 1;
        //}
        //if (col === 0) {
        //  v = 1;
        //}
        if (
          Math.abs(row - 5) < 3 &&
          Math.abs(col - 10) < 3 &&
          Math.abs(lev - 5) < 3
        ) {
          v = 0.9;
        }
        let new_cell = {
          u,
          v,
          color: get_color(u, v),
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

function RD_next_cell(grid, row, col, lev) {
  let cell = grid[coord_to_index(row, col, lev)];
  let u = cell.u;
  let v = cell.v;

  let dudt = 0;
  let dvdt = 0;

  ////////////////////////////
  // DIFFUSION
  ////////////////////////////
  const directions = [
    { dr: -1, dc: 0, dl: 0 }, // up
    { dr: 1, dc: 0, dl: 0 }, // down
    { dr: 0, dc: -1, dl: 0 }, // left
    { dr: 0, dc: 1, dl: 0 }, // right
    { dr: 0, dc: 0, dl: -1 }, // forward
    { dr: 0, dc: 0, dl: 1 }, // back
  ];

  dudt -= U_diffusion_rate * u;
  dvdt -= V_diffusion_rate * v;
  for (let dir of directions) {
    let nrow = row + dir.dr;
    let ncol = col + dir.dc;
    let nlev = lev + dir.dl;

    if (!out_of_bounds(nrow, ncol, nlev)) {
      let idx = coord_to_index(nrow, ncol, nlev);
      let cell = grid[idx];
      dudt += (U_diffusion_rate * cell.u) / 6.0;
      dvdt += (V_diffusion_rate * cell.v) / 6.0;
    }
  }

  // REACTION
  conversion_rate = reaction_rate * u * v * v;
  dudt -= conversion_rate;
  dvdt += conversion_rate;

  // DECAY

  dudt += U_concentration_rate * (1 - u - v);
  dvdt -= V_decay_rate * v;

  let new_u = u + dudt * dt;
  let new_v = v + dvdt * dt;
  new_u = Math.max(0, Math.min(new_u, 1)); // Clamps new_u between 0 and 1
  new_v = Math.max(0, Math.min(new_v, 1)); // Clamps new_v between 0 and 1

  new_cell = {
    u: new_u,
    v: new_v,
    color: get_color(new_u, new_v),
  };
  if (row === 5 && col === 10 && lev == 5) {
    //console.log(new_cell);
    //console.log(conversion_rate);
    //console.log(dudt, dvdt);
  }
  return new_cell;
}
