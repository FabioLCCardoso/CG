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
 
  // profundidade de hierarquia
  const depth = getHierarchyDepth(sceneObject);
  row.style.marginLeft = (depth * 16) + "px";
  
  const selectButton = document.createElement("button");
  selectButton.textContent = (depth > 0 ? "↳ " : "") + sceneObject.label;
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

//conta quantos niveis de pais existem até a raiz
function getHierarchyDepth(sceneObject) {
  let depth = 0;
  let current = sceneObject;

  while(current.parentId !== null) {
    const parent = getSceneObjectById(current.parentId);
    if (!parent) break;
    depth++;
    current = parent;
  }
  return depth;
}

// painel de transformação 
function buildTransformPanel(sceneObject) {
  const panel = document.createElement("div");
  panel.className = "transform-panel";
 
  const title = document.createElement("h3");
  title.textContent = "Editando: " + sceneObject.label;
  panel.appendChild(title);
 
  panel.appendChild(buildParentSelector(sceneObject));

  panel.appendChild(buildVectorInputGroup(
    "Posição", sceneObject.translation,
    (axis, value) => { sceneObject.translation[axis] = value; },
    { min: -50, max: 50, step: 0.1 },
  ));
 
  // Rotação é guardada em radianos internamente (é o que m4.xRotate
  // espera), mas mostramos em graus no input porque é mais natural
  // de digitar. Por isso convertemos nos dois sentidos.
  const rotationDegrees = sceneObject.rotation.map(rad => rad * 180 / Math.PI);
  panel.appendChild(buildVectorInputGroup(
    "Rotação (graus)", rotationDegrees,
    (axis, value) => { sceneObject.rotation[axis] = value * Math.PI / 180; },
    { min: -180, max: 180, step: 1 },
  ));
 
  panel.appendChild(buildVectorInputGroup(
    "Escala", sceneObject.scale,
    (axis, value) => { sceneObject.scale[axis] = value; },
    { min: 0.1, max: 5, step: 0.05 },
  ));
 
  return panel;
}

//seletor de pai
function buildParentSelector(sceneObject) {
  const wrapper = document.createElement("div");
  wrapper.className = "parent-selector-wrapper";

  const label = document.createElement("label");
  label.textContent = "Pai:";
  wrapper.appendChild(label);

  const select = document.createElement("select");
  select.className = "parent-select";

  const noneOption = document.createElement("option");
  noneOption.value = "";
  noneOption.textContent = "Nenhum";
  select.appendChild(noneOption);

  for(const other of sceneObjects) {
    if(other.id === sceneObject.id) continue; //não pode ser pai de si mesmo
    const option = document.createElement("option");
    option.value = other.id;
    option.textContent = other.label;
    if(sceneObject.parentId === other.id) {
      option.selected = true;
    }
    select.appendChild(option);
  }

  select.addEventListener("change", () => {

    const newParentId = select.value === "" ? null : parseInt(select.value, 10);

    const applied = setSceneObjectParent(sceneObject.id, newParentId);

    if (!applied) {
      alert("Não é possível definir este pai: criaria um ciclo na hierarquia.");
      select.value = sceneObject.parentId === null ? "" : String(sceneObject.parentId);
      return;
}
  refreshEditMenu();
});
  wrapper.appendChild(select);
  return wrapper;
}

// cria um grupo de inputs para editar um vetor 3D (x,y,z). onChange é chamado com o índice do eixo e o novo valor.
// range = { min, max, step } define os limites do slider (a caixa de número não tem limite).
function buildVectorInputGroup(title, values, onChange, range) {
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

    const numberInput = document.createElement("input");
    numberInput.type = "number";
    numberInput.step = range.step;
    numberInput.value = value.toFixed(2);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.className = "axis-slider";
    slider.min = range.min;
    slider.max = range.max;
    slider.step = range.step;
    // Se o valor inicial estiver fora da faixa do slider, o slider "trava" no limite mais próximo, mas a caixa de número continua mostrando o valor real.
    slider.value = Math.min(Math.max(value, range.min), range.max);

    // Caixa de número editada -> atualiza o objeto e sincroniza o slider.
    numberInput.addEventListener("input", () => {
      const parsed = parseFloat(numberInput.value);
      if (!Number.isNaN(parsed)) {
        onChange(axis, parsed);
        slider.value = Math.min(Math.max(parsed, range.min), range.max);
      }
    });

    // Slider arrastado -> atualiza o objeto e sincroniza a caixa de número.
    slider.addEventListener("input", () => {
      const parsed = parseFloat(slider.value);
      onChange(axis, parsed);
      numberInput.value = parsed.toFixed(2);
    });

    const inputRow = document.createElement("div");
    inputRow.className = "axis-number-row";
    inputRow.appendChild(axisLabel);
    inputRow.appendChild(numberInput);

    wrapper.appendChild(inputRow);
    wrapper.appendChild(slider);
    row.appendChild(wrapper);
  });
 
  group.appendChild(row);
  return group;
}