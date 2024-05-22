value_colors = [
  [0, 0, 0],
  [0.267004, 0.004874, 0.329415], // Dark Blue
  [0.127568, 0.566949, 0.550556], // Blue-Green
  [0.369214, 0.788888, 0.382914], // Yellow-Green
  [0.993248, 0.906157, 0.143936], // Light Yellow
  [0.988362, 0.998364, 0.644924],
  [(1.0, 0.0, 0.0)], // Bright Yellow // "overflow", turn red
  [1.0, 0.0, 0.2],
  [1.0, 0.0, 0.4],
  [1.0, 0.0, 0.6],
  [1.0, 0.0, 0.8],
];

function sandpile_init_context() {
  let new_grid = [];
  let new_color_array = [];
  for (let row = 0; row < num_rows; row++) {
    for (let col = 0; col < num_cols; col++) {
      for (let lev = 0; lev < num_levs; lev++) {
        let new_cell = {
          n: 0,
          color: value_colors[0],
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

function sandpile_next_cell(grid, row, col, lev) {
  let n = grid[coord_to_index(row, col, lev)].n;

  // topple if it's too tall
  if (n > 5) {
    n -= 6;
  }

  // The six directions: up, down, left, right, forward, back
  const directions = [
    { dr: -1, dc: 0, dl: 0 }, // up
    { dr: 1, dc: 0, dl: 0 }, // down
    { dr: 0, dc: -1, dl: 0 }, // left
    { dr: 0, dc: 1, dl: 0 }, // right
    { dr: 0, dc: 0, dl: -1 }, // forward
    { dr: 0, dc: 0, dl: 1 }, // back
  ];

  for (let dir of directions) {
    let nrow = row + dir.dr;
    let ncol = col + dir.dc;
    let nlev = lev + dir.dl;

    if (!out_of_bounds(nrow, ncol, nlev)) {
      let idx = coord_to_index(nrow, ncol, nlev);
      let cell = grid[idx];
      if (cell.n > 5) {
        n++;
      }
    }
  }

  // if this is the center cell, increment by 1
  let center_row = Math.trunc(num_rows / 2);
  let center_col = Math.trunc(num_cols / 2);
  let center_lev = Math.trunc(num_levs / 2);
  if (row === center_row && col === center_col && lev === center_lev) {
    n++;
  }

  new_cell = {
    n: n,
    color: value_colors[n],
  };
  return new_cell;
}
