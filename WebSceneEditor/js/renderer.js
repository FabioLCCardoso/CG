/*  prepara os shaders com iluminação e textura (se tiver), a camera com auto-enquadramento e  o loop de draws */
"use strict";

const vs = `#version 300 es
in vec4 a_position;
in vec3 a_normal;
in vec3 a_tangent;
in vec2 a_texcoord;
in vec4 a_color;
 
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
uniform vec3 u_viewWorldPosition;
 
out vec3 v_normal;
out vec3 v_tangent;
out vec3 v_surfaceToView;
out vec2 v_texcoord;
out vec4 v_color;
 
void main() {
  vec4 worldPosition = u_world * a_position;
  gl_Position = u_projection * u_view * worldPosition;
  v_surfaceToView = u_viewWorldPosition - worldPosition.xyz;
 
  mat3 normalMat = mat3(u_world);
  v_normal = normalize(normalMat * a_normal);
  v_tangent = normalize(normalMat * a_tangent);
 
  v_texcoord = a_texcoord;
  v_color = a_color;
}
`;
 
const fs = `#version 300 es
precision highp float;
 
in vec3 v_normal;
in vec3 v_tangent;
in vec3 v_surfaceToView;
in vec2 v_texcoord;
in vec4 v_color;
 
uniform vec3 diffuse;
uniform sampler2D diffuseMap;
uniform vec3 ambient;
uniform vec3 emissive;
uniform vec3 specular;
uniform sampler2D specularMap;
uniform float shininess;
uniform sampler2D normalMap;
uniform float opacity;
uniform vec3 u_lightDirection;
uniform vec3 u_ambientLight;
 
out vec4 outColor;
 
void main() {
  vec3 normal = normalize(v_normal) * (float(gl_FrontFacing) * 2.0 - 1.0);
  vec3 tangent = normalize(v_tangent) * (float(gl_FrontFacing) * 2.0 - 1.0);
  vec3 bitangent = normalize(cross(normal, tangent));
 
  mat3 tbn = mat3(tangent, bitangent, normal);
  normal = texture(normalMap, v_texcoord).rgb * 2.0 - 1.0;
  normal = normalize(tbn * normal);
 
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);
  vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);
 
  float fakeLight = dot(u_lightDirection, normal) * 0.5 + 0.5;
  float specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);
  vec4 specularMapColor = texture(specularMap, v_texcoord);
  vec3 effectiveSpecular = specular * specularMapColor.rgb;
 
  vec4 diffuseMapColor = texture(diffuseMap, v_texcoord);
  vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb;
  float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a;
 
  outColor = vec4(
      emissive +
      ambient * u_ambientLight +
      effectiveDiffuse * fakeLight +
      effectiveSpecular * pow(specularLight, shininess),
      effectiveOpacity);
}
`;

// Shader do picking. posiciona o vértice e pinta tudo com uma cor, sem cor nem textura.
const pickingVS = `#version 300 es

in vec4 a_position;
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

void main() {
  gl_Position = u_projection * u_view * u_world * a_position;
}
`;

const pickingFS = `#version 300 es
precision highp float;

uniform vec4 u_id;

out vec4 outColor;

void main() {
  outColor = u_id;
}
`;



let programInfo;
let defaultTextures; 

let pickingProgramInfo;

//Framebuffer + textura 1x1 pro picking. não renderiza a cena inteira em alta resolução, cria uma "camera" que só enxerga o ponteiro do mouse.
let pickingFramebuffer;
let pickingTexture;
let pickingDepthBuffer;

// Guarda a camera calculada no ultimo drawScene pra função do picking usar exatamente a mesam camera do frame atual.
let lastCamera = null; 

function initRenderer(gl){
    twgl.setAttributePrefix("a_");
    programInfo = twgl.createProgramInfo(gl, [vs, fs]);
    pickingProgramInfo = twgl.createProgramInfo(gl, [pickingVS, pickingFS]);
    gl.enable(gl.DEPTH_TEST); //objetos mais próximos escondem os distantes
    gl.enable(gl.CULL_FACE); // não renderiza a parte de trás dos triangulos 

    defaultTextures = {
        defaultWhite: twgl.createTexture(gl, { src: [255, 255, 255, 255] }),
        defaultNormal: twgl.createTexture(gl, { src: [127, 127, 255, 0] }),
    }

    initPickingFramebuffer(gl);
    initGizmo(gl);
}

//cria a textura de 1x1 pixel e o framebuffer onde o picking vai desenhar.
function initPickingFramebuffer(gl) {
  pickingTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, pickingTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  pickingDepthBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, pickingDepthBuffer);

  setPickingFramebufferSize(gl, 1, 1);

  pickingFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, pickingFramebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickingTexture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, pickingDepthBuffer);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

}

function setPickingFramebufferSize(gl, width, height){
  gl.bindTexture(gl.TEXTURE_2D, pickingTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, pickingDepthBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
}

function computeCamera(gl, sceneRadius) {
    const fieldOfViewRadians = 60 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

    //zNear e zFar proporcionais ao tamanho da cena.

    const zNear = sceneRadius / 100;
    const zFar = sceneRadius * 10;
    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    
    autoFrameIfNeeded(sceneRadius);
    const cameraPosition = computeOrbitalCameraPosition();
    const cameraTarget = cameraState.target;
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(cameraPosition, cameraTarget, up);
    const viewMatrix = m4.inverse(cameraMatrix);

    return {projectionMatrix, viewMatrix, cameraPosition, near:zNear, far:zFar};

}
    
// desenha todos objetos da cena. 

function drawScene(gl, sceneRadius) {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.1, 0.1, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

 const { projectionMatrix, viewMatrix, cameraPosition, near, far } = computeCamera(gl, sceneRadius);
 lastCamera = { projectionMatrix, viewMatrix, cameraPosition, near, far };

  gl.useProgram(programInfo.program);
 
    const sharedUniforms ={
            u_lightDirection: m4.normalize([-1, 3, 5]),
    u_ambientLight: [0.3, 0.3, 0.3],
    u_view: viewMatrix,
    u_projection: projectionMatrix,
    u_viewWorldPosition: cameraPosition,

    };

    twgl.setUniforms(programInfo, sharedUniforms);

  for (const sceneObject of sceneObjects) {
    const model = loadedModels[sceneObject.modelName];
    if (!model) continue; // ainda não terminou de carregar
 
    const worldMatrix = computeWorldMatrix(sceneObject);

    /*console.log("desenhando", sceneObject.modelName, "worldMatrix:", worldMatrix, "partes:", model.parts.length);
    console.log("canvas size:", gl.canvas.width, gl.canvas.height, "client:", gl.canvas.clientWidth, gl.canvas.clientHeight);
    console.log("sceneRadius:", sceneRadius, "cameraPosition:", cameraPosition);
    console.log("projectionMatrix:", Array.from(projectionMatrix));
    console.log("viewMatrix:", Array.from(viewMatrix)); */
    for (const part of model.parts) {
      gl.bindVertexArray(part.vao);
      // twgl.setUniforms aceita múltiplos objetos de uniforms (aqui passa u_world, e o material na mesma chamada);
      twgl.setUniforms(programInfo, { u_world: worldMatrix }, part.material);
      twgl.drawBufferInfo(gl, part.bufferInfo);
    }
  }
    drawGizmo(gl, projectionMatrix, viewMatrix, cameraPosition);
}

function computeNarrowPickingProjection(gl, cssX, cssY) {

  const fieldOfViewRadians = 60 * Math.PI / 180;
  const near = lastCamera.near;
  const far = lastCamera.far;

  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const top = Math.tan(fieldOfViewRadians * 0.5) * near;
  const bottom = -top;
  const left = aspect * bottom;
  const right = aspect * top;
  const width = right - left;
  const height = top - bottom;

  const pixelX = cssX * gl.canvas.width / gl.canvas.clientWidth;
  const pixelY = gl.canvas.height - cssY * gl.canvas.height / gl.canvas.clientHeight - 1;

  const subLeft = left + pixelX * width / gl.canvas.width;
  const subBottom = bottom + pixelY * height / gl.canvas.height;
  const subWidth = width / gl.canvas.width;
  const subHeight = height / gl.canvas.height;
  const projectionMatrix = m4.frustum(

    subLeft, subLeft + subWidth,
    subBottom, subBottom + subHeight,
    near, far,
  );

  return { projectionMatrix };

}




function pickObjectAt(gl, cssX, cssY) {
  if(!lastCamera) return null;

  const fieldOfViewRadians = 60 * Math.PI / 180;
  const near = lastCamera.near;
  const far = lastCamera.far;

  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const top = Math.tan(fieldOfViewRadians * 0.5) * near;
  const bottom = -top;
  const left = aspect * bottom;
  const right = aspect * top;
  const width = right - left;
  const height = top - bottom;

  const pixelX = cssX * gl.canvas.width / gl.canvas.clientWidth;
  const pixelY = gl.canvas.height - cssY * gl.canvas.height / gl.canvas.clientHeight - 1;
  
  const subLeft = left + pixelX * width / gl.canvas.width;
  const subBottom = bottom + pixelY * height / gl.canvas.height;
  const subWidth = width / gl.canvas.width;
  const subHeight = height / gl.canvas.height;

    const pickingProjectionMatrix = m4.frustum(
    subLeft, subLeft + subWidth,
    subBottom, subBottom + subHeight,
    near, far,
  );

  
  gl.bindFramebuffer(gl.FRAMEBUFFER, pickingFramebuffer);
  gl.viewport(0, 0, 1, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(0, 0, 0, 0); // id 0 = "nenhum objeto"
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(pickingProgramInfo.program);

  twgl.setUniforms(pickingProgramInfo, {
    u_projection: pickingProjectionMatrix,
    u_view: lastCamera.viewMatrix,
  });

  for (const sceneObject of sceneObjects) {
    const model = loadedModels[sceneObject.modelName];
    if (!model) continue;
    const worldMatrix = computeWorldMatrix(sceneObject);

    // Codifica o id  como uma cor RGBA, 1 byte por canal.

    const id = sceneObject.id;

    const idColor = [
      ((id >> 0) & 0xFF) / 0xFF,
      ((id >> 8) & 0xFF) / 0xFF,
      ((id >> 16) & 0xFF) / 0xFF,
      ((id >> 24) & 0xFF) / 0xFF,
    ];



    for (const part of model.parts) {
      gl.bindVertexArray(part.vao);
      twgl.setUniforms(pickingProgramInfo, { u_world: worldMatrix, u_id: idColor });
      twgl.drawBufferInfo(gl, part.bufferInfo);
    }
  }

  const pixelData = new Uint8Array(4);
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  const pickedId = pixelData[0] | (pixelData[1] << 8) | (pixelData[2] << 16) | (pixelData[3] << 24);
  return pickedId === 0 ? null : pickedId;


}