/* Carrega o OBJ e prepara os buffers */
"use strict";

// busca o texto do obj, parse o texto, cria os buffers na GPU e guarda o resultado em um 
// cache para evitar duplicar instancias do mesmo modelo.

const loadedModels = {};

const loadedTextures = {};

//funções auxiliares de geometria. calculam o tamanho de um conjunto de posições.

function getExtents(positions) {
  const min = positions.slice(0, 3);
  const max = positions.slice(0, 3);
  for (let i = 3; i < positions.length; i += 3) {
    for (let j = 0; j < 3; ++j) {
      const v = positions[i + j];
      min[j] = Math.min(v, min[j]);
      max[j] = Math.max(v, max[j]);
    }
  }
  return { min, max };
}

function getGeometriesExtents(geometries) {
  return geometries.reduce(({ min, max }, { data }) => {
    const minMax = getExtents(data.position);
    return {
      min: min.map((m, ndx) => Math.min(minMax.min[ndx], m)),
      max: max.map((m, ndx) => Math.max(minMax.max[ndx], m)),
    };
  }, {
    min: Array(3).fill(Number.POSITIVE_INFINITY),
    max: Array(3).fill(Number.NEGATIVE_INFINITY),
  });
}

// gera tangentes. Calcula para cada triangulo a direção tangente a superficie a partir das coordenadas de textura usada pelo shader.

function makeIndexIterator(indices) {
  let ndx = 0;
  const fn = () => indices[ndx++];
  fn.numElements = indices.length;
  return fn;
}
 
function makeUnindexedIterator(positions) {
  let ndx = 0;
  const fn = () => ndx++;
  fn.numElements = positions.length / 3;
  return fn;
}
 
const subtractVector2 = (a, b) => a.map((v, ndx) => v - b[ndx]);
 
function generateTangents(position, texcoord, indices) {
  const getNextIndex = indices ? makeIndexIterator(indices) : makeUnindexedIterator(position);
  const numFaceVerts = getNextIndex.numElements;
  const numFaces = numFaceVerts / 3;
 
  const tangents = [];
  for (let i = 0; i < numFaces; ++i) {
    const n1 = getNextIndex();
    const n2 = getNextIndex();
    const n3 = getNextIndex();
 
    const p1 = position.slice(n1 * 3, n1 * 3 + 3);
    const p2 = position.slice(n2 * 3, n2 * 3 + 3);
    const p3 = position.slice(n3 * 3, n3 * 3 + 3);
 
    const uv1 = texcoord.slice(n1 * 2, n1 * 2 + 2);
    const uv2 = texcoord.slice(n2 * 2, n2 * 2 + 2);
    const uv3 = texcoord.slice(n3 * 2, n3 * 2 + 2);
 
    const dp12 = m4.subtractVectors(p2, p1);
    const dp13 = m4.subtractVectors(p3, p1);
    const duv12 = subtractVector2(uv2, uv1);
    const duv13 = subtractVector2(uv3, uv1);
 
    const f = 1.0 / (duv12[0] * duv13[1] - duv13[0] * duv12[1]);
    const tangent = Number.isFinite(f)
      ? m4.normalize(m4.scaleVector(m4.subtractVectors(
          m4.scaleVector(dp12, duv13[1]),
          m4.scaleVector(dp13, duv12[1]),
        ), f))
      : [1, 0, 0];
 
    tangents.push(...tangent, ...tangent, ...tangent);
  }
  return tangents;
}

//carrega ou retorna do cache uma textura a partir do nome de um arquivo.

function loadTexture(gl, baseUrl, filename) {
  if (loadedTextures[filename]) {
    return loadedTextures[filename];
  }
  const texture = twgl.createTexture(gl, { src: baseUrl + filename, flipY: true });
  loadedTextures[filename] = texture;
  return texture;
}

//carrega um modelo .obj e prepara os buffers. resultado em loadedModels[modelName]

async function loadModel(gl, modelName, objUrl) {
  if (loadedModels[modelName]) {
    return loadedModels[modelName];
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

  for (const material of Object.values(materials)) {
    for (const key of ['diffuseMap', 'specularMap', 'normalMap']) {
      if (material[key]) {
        material[key] = loadTexture(gl, baseUrl, material[key]);
      }
    }
  }
 
  const defaultMaterial = {
    diffuse: [1, 1, 1],
    diffuseMap: defaultTextures.defaultWhite,
    normalMap: defaultTextures.defaultNormal,
    ambient: [0, 0, 0],
    specular: [1, 1, 1],
    specularMap: defaultTextures.defaultWhite,
    shininess: 200,
    opacity: 1,
  };
 
  const parts = obj.geometries.map(({ material, data }) => {
    // Cor por vértice: parseOBJ devolve 3 componentes (rgb); twgl
    // assume 4 (rgba) por padrão, então precisamos avisar que são 3.
    if (data.color) {
      data.color = { numComponents: 3, data: data.color };
    } else {
      data.color = { value: [1, 1, 1, 1] };
    }
 
    // Tangentes: só fazem sentido se houver texcoord E normal.
    if (data.texcoord && data.normal) {
      data.tangent = generateTangents(data.position, data.texcoord);
    } else {
      data.tangent = { value: [1, 0, 0] };
    }
 
    // Atributos ausentes recebem um valor constante, para o shader
    // não quebrar mesmo que o .obj não tenha essa informação.
    if (!data.texcoord) {
      data.texcoord = { value: [0, 0] };
    }
    if (!data.normal) {
      data.normal = { value: [0, 0, 1] };
    }
 
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, data);
    const vao = twgl.createVAOFromBufferInfo(gl, programInfo, bufferInfo);
 
    return {
      material: {
        ...defaultMaterial,
        ...materials[material],
      },
      bufferInfo,
      vao,
    };
  });
 
  // Calcula o tamanho real do modelo (extents) para a câmera poder
  // se enquadrar automaticamente quando este modelo for instanciado.
  const extents = getGeometriesExtents(obj.geometries);
  const size = m4.subtractVectors(extents.max, extents.min);
  const radius = m4.length(size) * 0.5;
  const center = m4.scaleVector(m4.addVectors(extents.min, extents.max), 0.5);
 
  const model = { parts, radius, center };
  loadedModels[modelName] = model;
  return model;
}
 

