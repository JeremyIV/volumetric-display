// TODO

// webGL boilerplate
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2", { depth: true });
if (!gl) {
  alert("WebGL 2.0 not supported");
  throw new Error("WebGL 2.0 not supported");
}

// OPAQUE FRAGMENTS
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.clearDepth(1.0); // Clear everything

gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque

// 3d grid of equilateral triangles, 19hx22lx16d
// A parallel buffer which stores the colors for each one

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(
  gl,
  gl.FRAGMENT_SHADER,
  fragmentShaderSource
);
const program = createProgram(gl, vertexShader, fragmentShader);

////////////////////////////////////////
// SET UP THE POSITION & COLOR BUFFERS

center_positions_buffer = gl.createBuffer();
relative_corner_positions_buffer = gl.createBuffer();
color_data_buffer = gl.createBuffer();
center_positions = [];
relative_corner_positions = [];
color_data = [];

num_rows = 19;
num_cols = 22;
num_levs = 16;

num_verts = num_rows * num_cols * num_levs * 3;

// TODO: max length of 1 in largest dimension
const SPHERE_RADIUS = 0.005;
row_size = 1;
grid_size = row_size / 19;
start_row_position = -row_size / 2.0;
start_col_position = (-(row_size / 2.0) * num_cols) / num_rows;
start_lev_position = -((row_size / 2.0) * num_levs) / num_rows;

for (let row = 0; row < num_rows; row++) {
  for (let col = 0; col < num_cols; col++) {
    for (let lev = 0; lev < num_levs; lev++) {
      row_pos = start_row_position + grid_size * row;
      col_pos = start_col_position + grid_size * col;
      lev_pos = start_lev_position + grid_size * lev;

      for (let j = 0; j < 3; j++) {
        center_positions.push(row_pos, lev_pos, col_pos);
        color_data.push(1, 1, 1); // initialize to white
      }

      relative_corner_positions.push(
        SPHERE_RADIUS * 2,
        0.0,
        -SPHERE_RADIUS,
        Math.sqrt(3) * SPHERE_RADIUS,
        -SPHERE_RADIUS,
        -Math.sqrt(3) * SPHERE_RADIUS
      );
    }
  }
}

gl.bindBuffer(gl.ARRAY_BUFFER, center_positions_buffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(center_positions),
  gl.STATIC_DRAW
);

gl.bindBuffer(gl.ARRAY_BUFFER, relative_corner_positions_buffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(relative_corner_positions),
  gl.STATIC_DRAW
);

gl.bindBuffer(gl.ARRAY_BUFFER, color_data_buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color_data), gl.STATIC_DRAW);

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}
