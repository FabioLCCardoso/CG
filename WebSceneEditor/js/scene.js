/* lista de instâncias da cena */
"use strict";

//cada item é uma instância da cena. não guarda geometria, apenas uma referência para o modelo.

const sceneObjects = [];
// contador para evitar id repetido
let nextObjectId = 1; 

//conta quantas instancias do mesmo modelo foram criadas
const modelInstanceCounts = {};

let selectedObjectId = null;

function addSceneObject(modelName, translation = [0, 0, 0]) {

  modelInstanceCounts[modelName] = (modelInstanceCounts[modelName] || 0) + 1;
  const instanceNumber = modelInstanceCounts[modelName];

  const sceneObject = {
    id: nextObjectId++,
    label: `${modelName} #${instanceNumber}`,
    modelName,
    translation: [...translation],
    rotation: [0, 0, 0],   // radianos, eixos x/y/z
    scale: [1, 1, 1],
    parentId: null, // id do objeto pai, se houver
    animation: null,
  };
  sceneObjects.push(sceneObject);
  return sceneObject;
}

//Renive instancia da cena pelo id.
function removeSceneObject(id) {
  const index = sceneObjects.findIndex(obj => obj.id === id);
  if(index === -1) return;
  sceneObjects.splice(index, 1);
  if (selectedObjectId === id) {
    selectedObjectId = null;
  }


  //Se for pai de outras instancias, remove a referencia de pai das instancias filhas
  for (const obj of sceneObjects) {
    if (obj.parentId === id) {
      obj.parentId = null;
    }
  }
}

// seleciona uma instancia

function selectSceneObject(id){
  selectedObjectId = id;
}

//devolve objeto da instancia
function getSelectedSceneObject() {
  return sceneObjects.find(obj => obj.id === selectedObjectId) || null;
}

//busca uma instancia pelo id (navega até o pai)
function getSceneObjectById(id) {
  return sceneObjects.find(obj => obj.id === id) || null;
}

//verifica de candidateId pode se tornar pai de objectId sem criar um ciclo.

function wouldCreateCycle(objectId, candidateParentId) {
  let current = candidateParentId;
  while (current !== null) {
    if (current === objectId) return true;
    const parent = getSceneObjectById(current);
    current = parent ? parent.parentId : null;
  }
  return false;

}

//define o pai de uma instancia, rejeita tentativas do objeto ser o proprio pai ou criar um ciclo.
function setSceneObjectParent(objectId, parentId) {
  if (objectId === parentId) {
    console.warn("Um objeto não pode ser pai de si mesmo.");
    return false;
  }
  if(parentId !== null && wouldCreateCycle(objectId, parentId)) {
    console.warn("Não é possível criar um ciclo na hierarquia de objetos.");
    return false;
  }

  const obj = getSceneObjectById(objectId);
  if(!obj) return false;

  obj.parentId = parentId;
  return true;

}


//calcula a matriz local de um objeto (sem considerar pais) da cena a partir de sua posição, rotação e escala.

function computeLocalMatrix(sceneObject) {
  let matrix = m4.translation(...sceneObject.translation);
  matrix = m4.xRotate(matrix, sceneObject.rotation[0]);
  matrix = m4.yRotate(matrix, sceneObject.rotation[1]);
  matrix = m4.zRotate(matrix, sceneObject.rotation[2]);
  matrix = m4.scale(matrix, ...sceneObject.scale);
  return matrix;
}

// calcula a matriz de mundo de um objeto. considera cadeia de pais. recursão subindo a árvore de pais.
function computeWorldMatrix(sceneObject){
  const localMatrix = computeLocalMatrix(sceneObject);
  if(sceneObject.parentId === null) {
    return localMatrix;
  }

  const parent = getSceneObjectById(sceneObject.parentId);
  if(!parent) {
    console.warn("Objeto pai não encontrado para id:", sceneObject.parentId);
    return localMatrix;
  }

  const parentMatrix = computeWorldMatrix(parent);
  return m4.multiply(parentMatrix, localMatrix);

}

//atualiza animações de todas instancias com ela ativa. 
function updateAnimations(deltaTime) {
  for(const sceneObject of sceneObjects) {
    if(!sceneObject.animation) continue;

    const axisIndex = { x: 0, y: 1, z: 2 }[sceneObject.animation.axis];
    sceneObject.rotation[axisIndex] += sceneObject.animation.speed * deltaTime;

}
}

//calcula um raio aproximado da cena inteira, soma posição de cada instancia com o raio do modelo para se enquadrar automaticamente.
//usa a worldmatrix para considerar a posição de cada instancia.
function computeSceneRadius() {

  if (sceneObjects.length === 0) {
    return 10;
  }
  let maxDistance = 0;

  for (const sceneObject of sceneObjects) {

    const model = loadedModels[sceneObject.modelName];

    if (!model) continue;



    const worldMatrix = computeWorldMatrix(sceneObject);

    // A posição mundial fica nos índices 12,13,14 da matriz 4x4

    const worldPosition = [worldMatrix[12], worldMatrix[13], worldMatrix[14]];
    const distanceFromOrigin = m4.length(worldPosition);
    const objectScale = Math.max(...sceneObject.scale);
    const reach = distanceFromOrigin + model.radius * objectScale;
    maxDistance = Math.max(maxDistance, reach);
  }
  return maxDistance > 0 ? maxDistance : 10;
} 

 
