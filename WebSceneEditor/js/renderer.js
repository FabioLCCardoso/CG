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


let programInfo;
let defaultTextures; 

function initRenderer(gl){
    programInfo = twgl.createProgramInfo(gl, [vs, fs]);
    gl.enable(gl.DEPTH_TEST); //objetos mais próximos escondem os distantes
    gl.enable(gl.CULL_FACE); // não renderiza a parte de trás dos triangulos 

    defaultTextures = {
        defaultWhite: twgl.createTexture(gl, { src: [255, 255, 255, 255] }),
        defaultNormal: twgl.createTexture(gl, { src: [127, 127, 255, 0] }),
    }
}

function computeCamera(gl, sceneRadius) {
    const fieldOfViewRadians = 60 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

    //zNear e zFar proporcionais ao tamanho da cena.

    const zNear = sceneRadius / 100;
    const zFar = sceneRadius * 10;
    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    const cameraTarget = [0, 0, 0];
    const cameraPosition = [0, 30, 100];
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(cameraPosition, cameraTarget, up);
    const viewMatrix = m4.inverse(cameraMatrix);

    return {projectionMatrix, viewMatrix, cameraPosition};

}
    
// desenha todos objetos da cena. 

function drawScene(gl, viewProjectionMatrix) {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.1, 0.1, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

 const { projectionMatrix, viewMatrix, cameraPosition } = computeCamera(gl, sceneRadius);

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
 
    for (const part of model.parts) {
      gl.bindVertexArray(part.vao);
      // twgl.setUniforms aceita múltiplos objetos de uniforms (aqui passa u_world, e o material na mesma chamada);
      twgl.setUniforms(programInfo, { u_world: worldMatrix }, part.material);
      twgl.drawBufferInfo(gl, part.bufferInfo);
    }
  }
}

