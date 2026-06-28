"use strict";


//tentativa de fazer um gizmo que nem o da unreal e do blender (setinhas indicando xyz)

const GIZMO_AXES = [
  { axis: 'x', color: [0.9, 0.2, 0.2, 1], direction: [1, 0, 0] },
  { axis: 'y', color: [0.2, 0.8, 0.2, 1], direction: [0, 1, 0] },
  { axis: 'z', color: [0.3, 0.4, 0.95, 1], direction: [0, 0, 1] },
];

// Shader do gizmo, posição + cor sólida
const gizmoVS = `#version 300 es
in vec4 a_position;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

void main() {
  gl_Position = u_projection * u_view * u_world * a_position;
}
`;

const gizmoFS = `#version 300 es
precision highp float;

uniform vec4 u_color;
out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

let gizmoProgramInfo;
let gizmoShaftBufferInfo; 
let gizmoShaftVAO;
let gizmoHeadBufferInfo; 
let gizmoHeadVAO;

// Comprimento/raio "base" da seta, em unidades de mundo, antes do  fator de escala por distância de câmera ser aplicado.
const GIZMO_SHAFT_LENGTH = 1.0;
const GIZMO_SHAFT_RADIUS = 0.04;
const GIZMO_HEAD_LENGTH = 0.3;
const GIZMO_HEAD_RADIUS = 0.12;
const GIZMO_SCREEN_SCALE_FACTOR = 0.12;

function initGizmo(gl) {
  gizmoProgramInfo = twgl.createProgramInfo(gl, [gizmoVS, gizmoFS]);

  // Cilindro alinhado ao eixo Y por padrão na lib twgl, rotacionar para o eixo certo.
  gizmoShaftBufferInfo = twgl.primitives.createCylinderBufferInfo(
    gl, GIZMO_SHAFT_RADIUS, GIZMO_SHAFT_LENGTH, 8, 1,
  );
  gizmoShaftVAO = twgl.createVAOFromBufferInfo(gl, gizmoProgramInfo, gizmoShaftBufferInfo);

  // Cone truncado com raio do topo 0 = cone normal (ponta da seta).
  gizmoHeadBufferInfo = twgl.primitives.createTruncatedConeBufferInfo(
    gl, GIZMO_HEAD_RADIUS, 0, GIZMO_HEAD_LENGTH, 8, 1, true, false,
  );
  gizmoHeadVAO = twgl.createVAOFromBufferInfo(gl, gizmoProgramInfo, gizmoHeadBufferInfo);
}

/* Calcula a matriz de mundo da seta, inclui posição do objeto selecionado (origem da seta),
 rotação para apontar no eixo certo, escala por distância de câmera e deslocamento ao longo do
próprio eixo (a ponta fica no fim do cabo, não na origem). */

function computeGizmoPartMatrix(originWorldPos, axisDef, screenScale, offsetAlongAxis) {
  let matrix = m4.translation(...originWorldPos);

  if (axisDef.axis === 'x') {
    matrix = m4.zRotate(matrix, -Math.PI / 2);
  } else if (axisDef.axis === 'z') {
    matrix = m4.xRotate(matrix, Math.PI / 2);
  }

  matrix = m4.scale(matrix, screenScale, screenScale, screenScale);
  matrix = m4.translate(matrix, 0, offsetAlongAxis, 0);
  return matrix;
}

/* Desenha o gizmo no objeto selecionado, chamado pelo renderer.js depois de desenhar a cena normal
 para o gizmo aparecer por cima dos objetos.
 cameraPosition é usado para calcular o fator de escala que
 mantém o gizmo do mesmo tamanho na tela, independente do zoom.  */

function drawGizmo(gl, projectionMatrix, viewMatrix, cameraPosition) {
  const selected = getSelectedSceneObject();
  if (!selected) return;

  const worldMatrix = computeWorldMatrix(selected);
  const worldPos = [worldMatrix[12], worldMatrix[13], worldMatrix[14]];

  const distance = m4.length(m4.subtractVectors(worldPos, cameraPosition));
  const screenScale = distance * GIZMO_SCREEN_SCALE_FACTOR;

  gl.disable(gl.DEPTH_TEST); // gizmo sempre visível, por cima de tudo
  gl.useProgram(gizmoProgramInfo.program);

  twgl.setUniforms(gizmoProgramInfo, {
    u_projection: projectionMatrix,
    u_view: viewMatrix,
  });

  for (const axisDef of GIZMO_AXES) {

    const shaftMatrix = computeGizmoPartMatrix(worldPos, axisDef, screenScale, GIZMO_SHAFT_LENGTH / 2);
    gl.bindVertexArray(gizmoShaftVAO);
    twgl.setUniforms(gizmoProgramInfo, { u_world: shaftMatrix, u_color: axisDef.color });
    twgl.drawBufferInfo(gl, gizmoShaftBufferInfo);

    // Ponta: posicionada no fim do cabo.
    const headOffset = GIZMO_SHAFT_LENGTH + GIZMO_HEAD_LENGTH / 2;
    const headMatrix = computeGizmoPartMatrix(worldPos, axisDef, screenScale, headOffset);
    gl.bindVertexArray(gizmoHeadVAO);
    twgl.setUniforms(gizmoProgramInfo, { u_world: headMatrix, u_color: axisDef.color });
    twgl.drawBufferInfo(gl, gizmoHeadBufferInfo);
  }

  gl.enable(gl.DEPTH_TEST);
}

// IDs reservados para os eixos do gizmo, bem afastados dos ids de sceneObjects para nunca colidir.
const GIZMO_AXIS_IDS = { x: 90001, y: 90002, z: 90003 };
const GIZMO_ID_TO_AXIS = { 90001: 'x', 90002: 'y', 90003: 'z' };

// Desenha só o gizmo (cabo+ponta de cada eixo) no framebuffer de  picking, cada eixo com uma cor-id própria
function drawGizmoForPicking(gl, projectionMatrix, viewMatrix) {
  const selected = getSelectedSceneObject();
  if (!selected) return;

  const worldMatrix = computeWorldMatrix(selected);
  const worldPos = [worldMatrix[12], worldMatrix[13], worldMatrix[14]];
  const distance = m4.length(m4.subtractVectors(worldPos, lastCamera.cameraPosition));
  const screenScale = distance * GIZMO_SCREEN_SCALE_FACTOR;

  gl.useProgram(pickingProgramInfo.program);
  twgl.setUniforms(pickingProgramInfo, { u_projection: projectionMatrix, u_view: viewMatrix });

  for (const axisDef of GIZMO_AXES) {
    const id = GIZMO_AXIS_IDS[axisDef.axis];
    const idColor = [
      ((id >> 0) & 0xFF) / 0xFF,
      ((id >> 8) & 0xFF) / 0xFF,
      ((id >> 16) & 0xFF) / 0xFF,
      ((id >> 24) & 0xFF) / 0xFF,
    ];

    const shaftMatrix = computeGizmoPartMatrix(worldPos, axisDef, screenScale, GIZMO_SHAFT_LENGTH / 2);
    gl.bindVertexArray(gizmoShaftVAO);
    twgl.setUniforms(pickingProgramInfo, { u_world: shaftMatrix, u_id: idColor });
    twgl.drawBufferInfo(gl, gizmoShaftBufferInfo);

    const headOffset = GIZMO_SHAFT_LENGTH + GIZMO_HEAD_LENGTH / 2;
    const headMatrix = computeGizmoPartMatrix(worldPos, axisDef, screenScale, headOffset);
    gl.bindVertexArray(gizmoHeadVAO);
    twgl.setUniforms(pickingProgramInfo, { u_world: headMatrix, u_id: idColor });
    twgl.drawBufferInfo(gl, gizmoHeadBufferInfo);
  }
}

// detecta clicks no gizmo.
function pickGizmoAxisAt(gl, cssX, cssY) {
  if (!lastCamera) return null;
  const selected = getSelectedSceneObject();
  if (!selected) return null;

  const { projectionMatrix } = computeNarrowPickingProjection(gl, cssX, cssY);
  gl.bindFramebuffer(gl.FRAMEBUFFER, pickingFramebuffer);
  gl.viewport(0, 0, 1, 1);
  gl.disable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawGizmoForPicking(gl, projectionMatrix, lastCamera.viewMatrix);

  const pixelData = new Uint8Array(4);
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.enable(gl.DEPTH_TEST);

  const pickedId = pixelData[0] | (pixelData[1] << 8) | (pixelData[2] << 16) | (pixelData[3] << 24);
  return GIZMO_ID_TO_AXIS[pickedId] || null;
}


/* Projeta um ponto do mundo (3D) para coordenadas de tela em
pixels (2D), usando a câmera atual. Usado para descobrir em que
 direção da TELA um eixo do mundo aponta, o que é necessário para
 converter o movimento do mouse (sempre em pixels 2D) num
 deslocamento ao longo do eixo escolhido (que vive no mundo 3D). */
function projectWorldToScreen(gl, worldPos, projectionMatrix, viewMatrix) {
  const viewProjection = m4.multiply(projectionMatrix, viewMatrix);
  const clipPos = m4.transformPoint(viewProjection, worldPos);
  const screenX = (clipPos[0] * 0.5 + 0.5) * gl.canvas.clientWidth;
  const screenY = (1 - (clipPos[1] * 0.5 + 0.5)) * gl.canvas.clientHeight;
  return [screenX, screenY];
}

let activeDrag = null;

function startGizmoDrag(gl, axis, mouseScreenX, mouseScreenY) {
  const selected = getSelectedSceneObject();
  if (!selected) return;

  const worldMatrix = computeWorldMatrix(selected);
  const worldPos = [worldMatrix[12], worldMatrix[13], worldMatrix[14]];

  const direction = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }[axis];

  // Projeta dois pontos do mundo para a tela. calcula a diferença entre eles pra ver o deslocamento.
  const screenOrigin = projectWorldToScreen(gl, worldPos, lastCamera.projectionMatrix, lastCamera.viewMatrix);
  const worldPosPlusAxis = m4.addVectors(worldPos, direction);
  const screenAxisPoint = projectWorldToScreen(gl, worldPosPlusAxis, lastCamera.projectionMatrix, lastCamera.viewMatrix);

  const screenAxisVector = [
    screenAxisPoint[0] - screenOrigin[0],
    screenAxisPoint[1] - screenOrigin[1],
  ];
  const screenAxisLength = Math.hypot(screenAxisVector[0], screenAxisVector[1]);

  activeDrag = {
    sceneObject: selected,
    axis,
    // translation no início do arrasto, para calcular o deslocamento total a partir do ponto de partida
    startTranslation: [...selected.translation],
    startMouseX: mouseScreenX,
    startMouseY: mouseScreenY,

    screenAxisDirection: screenAxisLength > 0.0001
      ? [screenAxisVector[0] / screenAxisLength, screenAxisVector[1] / screenAxisLength]
      : [1, 0],
    unitsPerScreenPixel: screenAxisLength > 0.0001 ? 1 / screenAxisLength : 0,
  };
}

// atualiza o movimento enquanto o gizmo estiver selecionado 
function updateGizmoDrag(mouseScreenX, mouseScreenY) {
  if (!activeDrag) return;

  const mouseDelta = [
    mouseScreenX - activeDrag.startMouseX,
    mouseScreenY - activeDrag.startMouseY,
  ];

  // Projeta o deslocamento do mouse sobre a direção do eixo na tela 

  const screenDistanceAlongAxis =
    mouseDelta[0] * activeDrag.screenAxisDirection[0] +
    mouseDelta[1] * activeDrag.screenAxisDirection[1];

  const worldDistance = screenDistanceAlongAxis * activeDrag.unitsPerScreenPixel;

  const axisIndex = { x: 0, y: 1, z: 2 }[activeDrag.axis];
  const newTranslation = [...activeDrag.startTranslation];
  newTranslation[axisIndex] += worldDistance;
  activeDrag.sceneObject.translation = newTranslation;
}

function endGizmoDrag() {
  const hadActiveDrag = activeDrag !== null;
  activeDrag = null;
  return hadActiveDrag;
}

function isDragging() {
  return activeDrag !== null;
}