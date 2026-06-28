"use strict";

const canvas = document.getElementById("canvas-cena");
const gl = canvas.getContext("webgl2");
if(!gl) {
    alert("WebGL2 não suportado neste navegador.");
} else {
    
  initRenderer(gl);
  buildModelMenu(gl);
  refreshEditMenu();

  let then = 0;
   
  function frame(now) {
   
   now *= 0.001;  // converte para segundos
   const deltaTime = now - then;
   then = now;

   updateAnimations(deltaTime);
   
    const sceneRadius = computeSceneRadius();
    drawScene(gl, sceneRadius);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
 /*
  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const pickedId = pickObjectAt(gl, x, y);
    selectSceneObject(pickedId);
    refreshEditMenu();
  }); */ 

  function getCanvasMousePos(event) {

    const rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
    
  }



  canvas.addEventListener("mousedown", (event) => {

    const [x, y] = getCanvasMousePos(event);

    const gizmoAxis = pickGizmoAxisAt(gl, x, y);
    if (gizmoAxis) {
      startGizmoDrag(gl, gizmoAxis, x, y);
      return; 
    }
    const pickedId = pickObjectAt(gl, x, y);
    selectSceneObject(pickedId);
    refreshEditMenu();
  });



  window.addEventListener("mousemove", (event) => {
    if (!isDragging()) return;
    const [x, y] = getCanvasMousePos(event);
    updateGizmoDrag(x, y);
  });

  window.addEventListener("mouseup", () => {
    const wasDragging = endGizmoDrag();
    if (wasDragging) {
      refreshEditMenu();
    }
  });

  console.log("Inicialização completa. Clique em um modelo no menu à direita.");

}
