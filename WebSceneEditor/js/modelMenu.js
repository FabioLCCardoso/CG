/* menu de seleção de modelos */
"use strict";

//lista estática para testar.
const availableModels = [
  { name: "ball", label: "Bola", objUrl: "models/KayKit/Models/obj/ball.obj" },
  { name: "sword_teamRed", label: "Espada (vermelha)", objUrl: "models/KayKit/Models/obj/sword_teamRed.obj" },
];


//constrói o menu de seleção de modelos. cada item é um botão, ao clickar o modelo é carregado
function buildModelMenu(gl) {
  const container = document.getElementById("menu-modelos");
 
  // limpa o texto placeholder ("Em breve: ...") que está no HTML
  container.innerHTML = "<h2>Seleção de modelos</h2>";
 
  for (const modelDef of availableModels) {
    const button = document.createElement("button");
    button.textContent = modelDef.label;
    button.className = "model-button";
 
    button.addEventListener("click", async () => {
      // Se já estiver em loadedModels, loadModel devolve o cache direto, sem rebaixar nem recriar buffers.
      await loadModel(gl, modelDef.name, modelDef.objUrl);
 
      //cria uma NOVA instância na cena, em uma posição levemente aleatória para múltiplas instâncias não ficarem exatamente sobrepostas.
      /* ------> SPAWN EM POSIÇõES ALEATÓRIAS 
      const x = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      addSceneObject(modelDef.name, [x, 0, z]); */

      addSceneObject(modelDef.name, [0, 0, 0]); // SPAWN NO CENTRO DA CENA
      //console.log("sceneObjects agora:", JSON.stringify(sceneObjects));
      //console.log("modelo carregado?", loadedModels[modelDef.name]);

      refreshEditMenu();
    });
 
    container.appendChild(button);
  }
}
