"use strict";

// Converte o estado atual da cena num objeto JS simples
function serializeScene() {
  return {
    version: 1,
    objects: sceneObjects.map(obj => ({
      id: obj.id,
      label: obj.label,
      modelName: obj.modelName,
      translation: obj.translation,
      rotation: obj.rotation,
      scale: obj.scale,
      parentId: obj.parentId,
      animation: obj.animation,
    })),
  };
}

// faz o download de um arquivo json com a cena atual
function saveSceneToFile(filename = "cena.json") {
  const data = serializeScene();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Reconstrói sceneObjects a partir de um objeto já parseado de JSON 
async function deserializeScene(gl, data) {
  if (!data || !Array.isArray(data.objects)) {
    throw new Error("Arquivo de cena inválido: campo 'objects' não encontrado.");
  }

  // Limpa a cena atual antes de carregar a nova.
  sceneObjects.length = 0;
  selectedObjectId = null;
  for (const key of Object.keys(modelInstanceCounts)) {
    delete modelInstanceCounts[key];
  }

  /* Maior id encontrado no arquivo, para continuarmos a contagem
   de nextObjectId a partir dali (evita colisão de id com novas instâncias criadas depois de carregar). */
  let maxId = 0;

 //recria objetos basicos
  const modelLoadPromises = [];
  for (const objData of data.objects) {
    const modelDef = availableModels.find(m => m.name === objData.modelName);
    if (modelDef && !loadedModels[objData.modelName]) {
      modelLoadPromises.push(loadModel(gl, modelDef.name, modelDef.objUrl));
    }

    sceneObjects.push({
      id: objData.id,
      label: objData.label,
      modelName: objData.modelName,
      translation: [...objData.translation],
      rotation: [...objData.rotation],
      scale: [...objData.scale],
      parentId: objData.parentId,
      animation: objData.animation ? { ...objData.animation } : null,
    });

    maxId = Math.max(maxId, objData.id);

    // Mantém modelInstanceCounts coerente, pra criar novas instancias quando carregado sem repetir ids.
    const match = /#(\d+)$/.exec(objData.label);
    if (match) {
      const num = parseInt(match[1], 10);
      modelInstanceCounts[objData.modelName] = Math.max(modelInstanceCounts[objData.modelName] || 0, num);
    }
  }

  nextObjectId = maxId + 1;

  await Promise.all(modelLoadPromises);
}

// Le um arquivo .json escolhido pelo usuário (via <input type="file">)  e carrega a cena a partir dele.
function loadSceneFromFile(gl, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        await deserializeScene(gl, data);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}