/* lista de instâncias da cena */
"use strict";

//cada item é uma instância da cena. não guarda geometria, apenas uma referência para o modelo.

const sceneObjects = [];

function addSceneObject(modelName, translation = [0, 0, 0]) {
  const sceneObject = {
    id: sceneObjects.length + 1,
    modelName,
    translation: [...translation],
    rotation: [0, 0, 0],   // radianos, eixos x/y/z
    scale: [1, 1, 1],
  };
  sceneObjects.push(sceneObject);
  return sceneObject;
}

//calcula a matriz de mundo de um objeto da cena a partir de sua posição, rotação e escala.

function computeWorldMatrix(sceneObject) {
  let matrix = m4.translation(...sceneObject.translation);
  matrix = m4.xRotate(matrix, sceneObject.rotation[0]);
  matrix = m4.yRotate(matrix, sceneObject.rotation[1]);
  matrix = m4.zRotate(matrix, sceneObject.rotation[2]);
  matrix = m4.scale(matrix, ...sceneObject.scale);
  return matrix;
}

//calcula um raio aproximado da cena inteira, soma posição de cada instancia com o raio do modelo para se enquadrar automaticamente.

function computeSceneRadius() {
  if (sceneObjects.length === 0) {
    return 10;
  }
 
  let maxDistance = 0;
  for (const sceneObject of sceneObjects) {
    const model = loadedModels[sceneObject.modelName];
    if (!model) continue;
 
    const distanceFromOrigin = m4.length(sceneObject.translation);
    const objectScale = Math.max(...sceneObject.scale);
    const reach = distanceFromOrigin + model.radius * objectScale;
    maxDistance = Math.max(maxDistance, reach);
  }
 
  return maxDistance > 0 ? maxDistance : 10;
}
