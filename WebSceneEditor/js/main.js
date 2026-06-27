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
 
  console.log("Inicialização completa. Clique em um modelo no menu à direita.");

}