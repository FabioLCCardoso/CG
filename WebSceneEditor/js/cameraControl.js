"use strict";

//tentativa de fazer a câmera orbital.

const cameraState = {
  target: [0, 0, 0],       // ponto que a câmera está olhando
  yaw: Math.PI * 0.25,  
  pitch: Math.PI * 0.2,  
  distance: 10,        

  userHasControl: false,
};


const MAX_PITCH = (89 * Math.PI) / 180;
const MIN_PITCH = -MAX_PITCH;

const MIN_DISTANCE = 0.5;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Gira a câmera em torno do target
function orbitCamera(deltaX, deltaY) {
  const ORBIT_SPEED = 0.005; // radianos por pixel de movimento do mouse
  cameraState.yaw -= deltaX * ORBIT_SPEED;
  cameraState.pitch = clamp(
    cameraState.pitch - deltaY * ORBIT_SPEED,
    MIN_PITCH,
    MAX_PITCH,
  );
  cameraState.userHasControl = true;
}

// zoom
function zoomCamera(deltaY, sceneRadius) {
  const ZOOM_SPEED = 0.001;

  const maxDistance = Math.max(sceneRadius * 5, 20);
  cameraState.distance = clamp(
    cameraState.distance * (1 + deltaY * ZOOM_SPEED),
    MIN_DISTANCE,
    maxDistance,
  );
  cameraState.userHasControl = true;
}

function autoFrameIfNeeded(sceneRadius) {
  if (cameraState.userHasControl) return;
  cameraState.distance = sceneRadius * 1.5;
}


function computeOrbitalCameraPosition() {
  const { target, yaw, pitch, distance } = cameraState;
  const x = target[0] + distance * Math.cos(pitch) * Math.sin(yaw);
  const y = target[1] + distance * Math.sin(pitch);
  const z = target[2] + distance * Math.cos(pitch) * Math.cos(yaw);
  return [x, y, z];
}