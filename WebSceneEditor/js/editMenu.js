"use strict";

/*constrói o menu de edição da cena. Cria uma lista de instâncias da cena e um painel de campos para editar 
translação/rotação/escala */

function refreshEditMenu(){
    const container = document.getElementById("menu-edicao");
    container.innerHTML = "<h2>Menu</h2>";
 
    container.appendChild(buildInstanceList());
 
    const selected = getSelectedSceneObject();
     if (selected) {
        container.appendChild(buildTransformPanel(selected));
  }

}

//cria a lista de instâncias da cena, cada linha tem um botão com o label da instancia
 function buildInstanceList() {
    const list = document.createElement("div");
  list.className = "instance-list";
 
  if (sceneObjects.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Nenhum objeto na cena ainda. Adicione um modelo pelo menu à direita.";
    list.appendChild(empty);
    return list;
  }
 
  for (const sceneObject of sceneObjects) {
    const row = document.createElement("div");
    row.className = "instance-row";
    if (sceneObject.id === selectedObjectId) {
      row.classList.add("selected");
    }
 
    const selectButton = document.createElement("button");
    selectButton.textContent = sceneObject.label;
    selectButton.className = "instance-button";
    selectButton.addEventListener("click", () => {
      selectSceneObject(sceneObject.id);
      refreshEditMenu();
    });
 
    const removeButton = document.createElement("button");
    removeButton.textContent = "×";
    removeButton.className = "instance-remove-button";
    removeButton.title = "Remover da cena";
    removeButton.addEventListener("click", () => {
      removeSceneObject(sceneObject.id);
      refreshEditMenu();
    });
 
    row.appendChild(selectButton);
    row.appendChild(removeButton);
    list.appendChild(row);
  }
 
  return list;
}

// painel de transformação 
function buildTransformPanel(sceneObject) {
  const panel = document.createElement("div");
  panel.className = "transform-panel";
 
  const title = document.createElement("h3");
  title.textContent = "Editando: " + sceneObject.label;
  panel.appendChild(title);
 
  panel.appendChild(buildVectorInputGroup(
    "Posição", sceneObject.translation,
    (axis, value) => { sceneObject.translation[axis] = value; },
  ));
 
  // Rotação é guardada em radianos internamente (é o que m4.xRotate
  // espera), mas mostramos em graus no input porque é mais natural
  // de digitar. Por isso convertemos nos dois sentidos.
  const rotationDegrees = sceneObject.rotation.map(rad => rad * 180 / Math.PI);
  panel.appendChild(buildVectorInputGroup(
    "Rotação (graus)", rotationDegrees,
    (axis, value) => { sceneObject.rotation[axis] = value * Math.PI / 180; },
  ));
 
  panel.appendChild(buildVectorInputGroup(
    "Escala", sceneObject.scale,
    (axis, value) => { sceneObject.scale[axis] = value; },
  ));
 
  return panel;
}

// cria um grupo de inputs para editar um vetor 3D (x,y,z). onChange é chamado com o índice do eixo e o novo valor.
function buildVectorInputGroup(title, values, onChange) {
  const group = document.createElement("div");
  group.className = "vector-input-group";
 
  const label = document.createElement("label");
  label.textContent = title;
  group.appendChild(label);
 
  const row = document.createElement("div");
  row.className = "vector-input-row";
 
  const axisLabels = ["X", "Y", "Z"];
  values.forEach((value, axis) => {
    const wrapper = document.createElement("div");
    wrapper.className = "axis-input-wrapper";
 
    const axisLabel = document.createElement("span");
    axisLabel.textContent = axisLabels[axis];
    axisLabel.className = "axis-label";
 
    const input = document.createElement("input");
    input.type = "number";
    input.step = "0.1";
    input.value = value.toFixed(2);
 

    input.addEventListener("input", () => {
      const parsed = parseFloat(input.value);
      if (!Number.isNaN(parsed)) {
        onChange(axis, parsed);
      }
    });
 
    wrapper.appendChild(axisLabel);
    wrapper.appendChild(input);
    row.appendChild(wrapper);
  });
 
  group.appendChild(row);
  return group;
}
