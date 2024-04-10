////////////////////////////////////////
// PERSPECTIVE CALCULATIONS
distance = 2.0; // Initial value of distance
theta = 0; // Azimuthal angle
phi = 0; // Polar angle

function registerDragEvents(onMove, onUp) {
  function onMouseMove(e) {
    if (e.preventDefault !== undefined) {
      e.preventDefault();
    }
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onMove(x, y);

    drawScene(true);
  }

  function onTouchMove(e) {
    onMouseMove(convertTouchEvent(e));
  }
  function onMouseUp(e) {
    if (e.preventDefault !== undefined) {
      e.preventDefault();
    }
    if (onUp !== undefined) {
      onUp();
    }
    document.onmousemove = null;
    document.onmouseup = null;
    document.removeEventListener("touchmove", onTouchMove, { passive: false });
    document.removeEventListener("touchend", onTouchEnd, { passive: false });
    drawScene();
  }

  function onTouchEnd(e) {
    onMouseUp(convertTouchEvent(e));
  }

  document.onmousemove = onMouseMove;
  document.onmouseup = onMouseUp;
  document.addEventListener("touchmove", onTouchMove, { passive: false });
  document.addEventListener("touchend", onTouchEnd, { passive: false });
}

function convertTouchEvent(event) {
  event.preventDefault();
  if (event.touches.length > 0) {
    // Use the first touch point for the event
    var touch = event.touches[0];
    // Mimic a mouse event based on the first touch point
    return {
      ...event,
      clientX: touch.clientX,
      clientY: touch.clientY,
      target: touch.target,
    };
  }
  return event;
}

function updateRotation(dx, dy) {
  // Update theta and phi based on dx and dy
  // Adjust these scaling factors as needed for sensitivity
  const thetaScale = 0.01;
  const phiScale = 0.01;

  theta += dx * thetaScale;
  phi += dy * phiScale; // Inverting dy to match the screen's coordinate system

  // Clamp phi to prevent the camera from flipping over
  // This restricts the elevation angle to be between -90 and 90 degrees
  phi = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, phi));
}

function canvasMouseDown(e) {
  if (e.preventDefault !== undefined) {
    e.preventDefault();
  }

  // If no transform is slected, rotate the view perspective
  // rotate the viewport
  let lastX = e.clientX;
  let lastY = e.clientY;

  function onMove(x, y) {
    const dx = x - lastX;
    const dy = y - lastY;
    updateRotation(dx, dy);
    lastX = x;
    lastY = y;
  }
  registerDragEvents(onMove);
}

document.addEventListener("mousedown", canvasMouseDown);
document.addEventListener(
  "touchstart",
  function (event) {
    canvasMouseDown(convertTouchEvent(event));
  },
  { passive: false }
);

/////////////////////////////////////////////////
// PINCH/ZOOM

function updateDistanceOnScroll(event) {
  // Check the direction of the scroll (up or down)
  const scrollDirection = Math.sign(event.deltaY);

  // Increase or decrease distance based on scroll direction
  distance += scrollDirection * 0.2; // Adjust the 0.1 step size as needed

  // Log the updated distance value
  drawScene();
}

// Add the event listener for the wheel event
document.addEventListener("wheel", updateDistanceOnScroll);

let initialPinchDistance = null; // Store the initial pinch distance

// Calculate the distance between two touch points
function getPinchDistance(touches) {
  const touch1 = touches[0];
  const touch2 = touches[1];
  const dx = touch1.pageX - touch2.pageX;
  const dy = touch1.pageY - touch2.pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Function to handle touch move events
function onPinchZoom(event) {
  if (event.touches.length === 2) {
    // Ensure two fingers are used
    const currentPinchDistance = getPinchDistance(event.touches);

    if (initialPinchDistance == null) {
      initialPinchDistance = currentPinchDistance;
    } else {
      const pinchChange = currentPinchDistance - initialPinchDistance;
      distance += pinchChange * 0.01; // Adjust the 0.01 step size as needed
      initialPinchDistance = currentPinchDistance; // Update the initial distance for the next move

      // Log the updated distance value
      console.log("Distance:", distance);
    }
  }
}

// Reset initialPinchDistance when touch ends
function onPinchEnd() {
  initialPinchDistance = null;
}

// Add the event listeners for touch events
document.addEventListener("touchmove", onPinchZoom);
document.addEventListener("touchend", onPinchEnd);
document.addEventListener("touchcancel", onPinchEnd);
