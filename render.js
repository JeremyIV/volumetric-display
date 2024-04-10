////////////////////////////////////////////////
// DRAW FUNCTION

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);

  const fieldOfView = glMatrix.toRadian(45); // Convert 45 degrees to radians
  const aspectRatio = canvas.width / canvas.height;
  const near = 0.1; // The near clipping plane distance
  const far = 100.0; // The far clipping plane distance

  // PROJECTION MATRIX
  let projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspectRatio, near, far);

  const uProjectionMatrixLoc = gl.getUniformLocation(
    program,
    "uProjectionMatrix"
  );
  gl.uniformMatrix4fv(uProjectionMatrixLoc, false, projectionMatrix);

  // POSITION TRANSFORMATION MATRIX
  var T = mat4.create();

  // These transforms will be applied in reverse order
  mat4.translate(T, T, [0, 0, -distance]);
  mat4.rotate(T, T, theta, [0, 1, 0]);
  mat4.rotate(T, T, phi, [1, 0, 0]);

  const uPositionTransformationMatrixLoc = gl.getUniformLocation(
    program,
    "uPositionTransformationMatrix"
  );
  gl.uniformMatrix4fv(uPositionTransformationMatrixLoc, false, T);

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

function resizeCanvas() {
  canvas.width = window.innerWidth - 20; // TODO: -20 is a hack to stop scroll bars from appearing
  canvas.height = window.innerHeight - 20;

  gl.viewport(0, 0, canvas.width, canvas.height);

  // Redraw the scene
  drawScene(); // Make sure this function redraws your WebGL scene
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Call it once to set initial size
