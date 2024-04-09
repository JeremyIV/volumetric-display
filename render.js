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

const center_positions_buffer = gl.createBuffer();
const relative_corner_positions_buffer = gl.createBuffer();
const color_data_buffer = gl.createBuffer();

const center_positions = [];
const relative_corner_positions = [];
let color_data = [];

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
        center_positions.push(row_pos, col_pos, lev_pos);
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

////////////////////////////////////////////////
// UPDATE COLORS

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

function update_colors() {
  console.log();
  for (let index = 0; index < color_data.length; index++) {
    color_data[index] += (0.1 * index) / color_data.length;
    if (color_data[index] > 1) {
      color_data[index] = 0;
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, color_data_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color_data), gl.STATIC_DRAW);
  drawScene();
}

// Example usage:
const frequency = 24; // Call the function 24 times per second
const stopCalling = callAtFrequency(frequency, update_colors);

////////////////////////////////////////////////
// DRAW FUNCTION

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);

  const fieldOfView = glMatrix.toRadian(45); // Convert 45 degrees to radians
  const aspectRatio = canvas.width / canvas.height;
  const near = 0.1; // The near clipping plane distance
  const far = 100.0; // The far clipping plane distance

  // Create a perspective projection matrix
  mat4.perspective(projectionMatrix, fieldOfView, aspectRatio, near, far);

  // Create a translation matrix
  var translationMatrix = mat4.create(); // Initialize a new matrix
  mat4.translate(translationMatrix, translationMatrix, [0, 0, -distance]);

  // Combine the translation with the perspective projection
  // Note: It's important that the multiplication order is "projectionMatrix = translationMatrix * projectionMatrix"
  // rotate, then translate, then project
  mat4.multiply(projectionMatrix, projectionMatrix, translationMatrix);
  mat4.multiply(projectionMatrix, projectionMatrix, perspective);

  const uProjectionMatrixLoc = gl.getUniformLocation(
    program,
    "uProjectionMatrix"
  );
  gl.uniformMatrix4fv(uProjectionMatrixLoc, false, projectionMatrix);

  // OFFSET ROTATION MATRIX
  const uOffsetRotationMatrixLoc = gl.getUniformLocation(
    program,
    "uOffsetRotationMatrix"
  );
  gl.uniformMatrix4fv(uOffsetRotationMatrixLoc, false, offsetRotationMatrix);

  gl.uniform1f(gl.getUniformLocation(program, "uSphereRadius"), SPHERE_RADIUS);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const positionLocation = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, center_positions_buffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  const colorLocation = gl.getAttribLocation(program, "aColor");
  gl.enableVertexAttribArray(colorLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, color_data_buffer);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  const cornerOffsetLocation = gl.getAttribLocation(program, "aOffset");
  gl.enableVertexAttribArray(cornerOffsetLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, relative_corner_positions_buffer);
  gl.vertexAttribPointer(cornerOffsetLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, num_verts); // Draw N points
}

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

function resizeCanvas() {
  canvas.width = window.innerWidth - 20; // TODO: -20 is a hack to stop scroll bars from appearing
  canvas.height = window.innerHeight - 20;

  gl.viewport(0, 0, canvas.width, canvas.height);

  // Redraw the scene
  drawScene(); // Make sure this function redraws your WebGL scene
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Call it once to set initial size
