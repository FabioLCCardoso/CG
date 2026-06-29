"use strict";

//renderiza uma vez todos os modelos para usar de ícones.

const THUMBNAIL_SIZE = 96;

const thumbnailCache = {};       // modelName -> data URL (pronta)
const thumbnailModels = {};      // modelName -> { parts, radius, center } carregado no contexto de thumbnail

let thumbnailCanvas = null;
let thumbnailGl = null;
let thumbnailProgramInfo = null;

//shader da thumbnail 
const thumbnailVS = `#version 300 es
in vec4 a_position;
in vec3 a_normal;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

out vec3 v_normal;

void main() {
  gl_Position = u_projection * u_view * u_world * a_position;
  v_normal = normalize(mat3(u_world) * a_normal);
}
`;

const thumbnailFS = `#version 300 es
precision highp float;

in vec3 v_normal;
uniform vec3 u_diffuse;

out vec4 outColor;

void main() {
  vec3 lightDir = normalize(vec3(0.4, 0.8, 0.6));
  float light = max(dot(normalize(v_normal), lightDir), 0.0) * 0.7 + 0.3;
  outColor = vec4(u_diffuse * light, 1.0);
}
`;

function ensureThumbnailContext() {
  if (thumbnailGl) return;

  thumbnailCanvas = document.createElement("canvas");
  thumbnailCanvas.width = THUMBNAIL_SIZE;
  thumbnailCanvas.height = THUMBNAIL_SIZE;
  // Nunca é inserido no DOM — existe só na memória.

  thumbnailGl = thumbnailCanvas.getContext("webgl2");
  if (!thumbnailGl) {
    console.warn("Não foi possível criar contexto WebGL2 para thumbnails.");
    return;
  }

  thumbnailGl.enable(thumbnailGl.DEPTH_TEST);
  thumbnailGl.enable(thumbnailGl.CULL_FACE);
  thumbnailProgramInfo = twgl.createProgramInfo(thumbnailGl, [thumbnailVS, thumbnailFS]);
}


async function loadModelForThumbnail(modelName, objUrl) {
  if (thumbnailModels[modelName]) {
    return thumbnailModels[modelName];
  }

  const objText = await fetch(objUrl).then(res => res.text());
  const obj = parseOBJ(objText);

  const baseUrl = objUrl.substring(0, objUrl.lastIndexOf('/') + 1);
  const matTexts = await Promise.all(
    obj.materialLibs.map(filename => fetch(baseUrl + filename).then(res => res.text())),
  );
  const materials = {};
  for (const matText of matTexts) {
    Object.assign(materials, parseMTL(matText));
  }

  const defaultMaterial = { diffuse: [0.8, 0.8, 0.8] };

  const parts = obj.geometries.map(({ material, data }) => {
    if (data.color) {
      data.color = { numComponents: 3, data: data.color };
    } else {
      data.color = { value: [1, 1, 1, 1] };
    }
    if (!data.normal) {
      data.normal = { value: [0, 0, 1] };
    }

    const bufferInfo = twgl.createBufferInfoFromArrays(thumbnailGl, data);
    const vao = twgl.createVAOFromBufferInfo(thumbnailGl, thumbnailProgramInfo, bufferInfo);

    return {
      material: { ...defaultMaterial, ...materials[material] },
      bufferInfo,
      vao,
    };
  });

  const extents = getGeometriesExtents(obj.geometries);
  const size = m4.subtractVectors(extents.max, extents.min);
  const radius = m4.length(size) * 0.5;
  const center = m4.scaleVector(m4.addVectors(extents.min, extents.max), 0.5);

  const model = { parts, radius, center };
  thumbnailModels[modelName] = model;
  return model;
}

// Fila com concorrência 
const THUMBNAIL_CONCURRENCY = 3;
let activeThumbnailJobs = 0;
const thumbnailQueue = [];

function runNextQueuedThumbnail() {
  if (activeThumbnailJobs >= THUMBNAIL_CONCURRENCY) return;
  const job = thumbnailQueue.shift();
  if (!job) return;

  activeThumbnailJobs++;
  renderThumbnail(job.modelDef)
    .catch(err => {
      console.warn("Falha ao gerar thumbnail para", job.modelDef.name, err);
      return null;
    })
    .then(dataUrl => {
      if (dataUrl) {
        thumbnailCache[job.modelDef.name] = dataUrl;
      }
      activeThumbnailJobs--;
      job.resolve(dataUrl);
      runNextQueuedThumbnail();
    });
}


function getModelThumbnail(modelDef) {
  if (thumbnailCache[modelDef.name]) {
    return Promise.resolve(thumbnailCache[modelDef.name]);
  }

  return new Promise(resolve => {
    thumbnailQueue.push({ modelDef, resolve });
    runNextQueuedThumbnail();
  });
}

async function renderThumbnail(modelDef) {
  ensureThumbnailContext();
  if (!thumbnailGl) return null;

  const gl = thumbnailGl;
  const model = await loadModelForThumbnail(modelDef.name, modelDef.objUrl);
  if (!model) return null;

  gl.viewport(0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
  gl.clearColor(0.15, 0.15, 0.18, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Câmera fixa simples

  const fieldOfViewRadians = 35 * Math.PI / 180;
  const aspect = 1; // thumbnail é quadrada
  const radius = Math.max(model.radius, 0.01);
  const near = radius / 50;
  const far = radius * 20;
  const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, near, far);

  const distance = radius * 2.6;
  const eye = [distance * 0.7, distance * 0.55, distance * 0.7];
  const cameraMatrix = m4.lookAt(eye, [0, 0, 0], [0, 1, 0]);
  const viewMatrix = m4.inverse(cameraMatrix);

  // Centraliza o modelo na origem, independente de onde a geometria original do obj esteja posicionada.
  const worldMatrix = m4.translation(-model.center[0], -model.center[1], -model.center[2]);

  gl.useProgram(thumbnailProgramInfo.program);
  twgl.setUniforms(thumbnailProgramInfo, {
    u_projection: projectionMatrix,
    u_view: viewMatrix,
  });

  for (const part of model.parts) {
    gl.bindVertexArray(part.vao);
    twgl.setUniforms(thumbnailProgramInfo, {
      u_world: worldMatrix,
      u_diffuse: part.material.diffuse,
    });
    twgl.drawBufferInfo(gl, part.bufferInfo);
  }

  return thumbnailCanvas.toDataURL("image/png");
}