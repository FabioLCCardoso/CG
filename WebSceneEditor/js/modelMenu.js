/* menu de seleção de modelos */
"use strict";

const availableModels = [
  { name: "arrow_teamBlue", label: "arrow_teamBlue", objUrl: "models/KayKit/Models/obj/arrow_teamBlue.obj" },
  { name: "arrow_teamRed", label: "arrow_teamRed", objUrl: "models/KayKit/Models/obj/arrow_teamRed.obj" },
  { name: "arrow_teamYellow", label: "arrow_teamYellow", objUrl: "models/KayKit/Models/obj/arrow_teamYellow.obj" },
  { name: "ball", label: "ball", objUrl: "models/KayKit/Models/obj/ball.obj" },
  { name: "ball_teamBlue", label: "ball_teamBlue", objUrl: "models/KayKit/Models/obj/ball_teamBlue.obj" },
  { name: "ball_teamRed", label: "ball_teamRed", objUrl: "models/KayKit/Models/obj/ball_teamRed.obj" },
  { name: "ball_teamYellow", label: "ball_teamYellow", objUrl: "models/KayKit/Models/obj/ball_teamYellow.obj" },
  { name: "barrierFloor", label: "barrierFloor", objUrl: "models/KayKit/Models/obj/barrierFloor.obj" },
  { name: "barrierLadder", label: "barrierLadder", objUrl: "models/KayKit/Models/obj/barrierLadder.obj" },
  { name: "barrierLarge", label: "barrierLarge", objUrl: "models/KayKit/Models/obj/barrierLarge.obj" },
  { name: "barrierMedium", label: "barrierMedium", objUrl: "models/KayKit/Models/obj/barrierMedium.obj" },
  { name: "barrierSmall", label: "barrierSmall", objUrl: "models/KayKit/Models/obj/barrierSmall.obj" },
  { name: "barrierStrut", label: "barrierStrut", objUrl: "models/KayKit/Models/obj/barrierStrut.obj" },
  { name: "blaster_teamBlue", label: "blaster_teamBlue", objUrl: "models/KayKit/Models/obj/blaster_teamBlue.obj" },
  { name: "blaster_teamRed", label: "blaster_teamRed", objUrl: "models/KayKit/Models/obj/blaster_teamRed.obj" },
  { name: "blaster_teamYellow", label: "blaster_teamYellow", objUrl: "models/KayKit/Models/obj/blaster_teamYellow.obj" },
  { name: "bomb_teamBlue", label: "bomb_teamBlue", objUrl: "models/KayKit/Models/obj/bomb_teamBlue.obj" },
  { name: "bomb_teamRed", label: "bomb_teamRed", objUrl: "models/KayKit/Models/obj/bomb_teamRed.obj" },
  { name: "bomb_teamYellow", label: "bomb_teamYellow", objUrl: "models/KayKit/Models/obj/bomb_teamYellow.obj" },
  { name: "bow_teamBlue", label: "bow_teamBlue", objUrl: "models/KayKit/Models/obj/bow_teamBlue.obj" },
  { name: "bow_teamRed", label: "bow_teamRed", objUrl: "models/KayKit/Models/obj/bow_teamRed.obj" },
  { name: "bow_teamYellow", label: "bow_teamYellow", objUrl: "models/KayKit/Models/obj/bow_teamYellow.obj" },
  { name: "button_teamBlue", label: "button_teamBlue", objUrl: "models/KayKit/Models/obj/button_teamBlue.obj" },
  { name: "button_teamRed", label: "button_teamRed", objUrl: "models/KayKit/Models/obj/button_teamRed.obj" },
  { name: "button_teamYellow", label: "button_teamYellow", objUrl: "models/KayKit/Models/obj/button_teamYellow.obj" },
  { name: "characer_duck", label: "characer_duck", objUrl: "models/KayKit/Models/obj/characer_duck.obj" },
  { name: "characer_duckHead", label: "characer_duckHead", objUrl: "models/KayKit/Models/obj/characer_duckHead.obj" },
  { name: "character_bear", label: "character_bear", objUrl: "models/KayKit/Models/obj/character_bear.obj" },
  { name: "character_bearHead", label: "character_bearHead", objUrl: "models/KayKit/Models/obj/character_bearHead.obj" },
  { name: "character_dog", label: "character_dog", objUrl: "models/KayKit/Models/obj/character_dog.obj" },
  { name: "character_dogHead", label: "character_dogHead", objUrl: "models/KayKit/Models/obj/character_dogHead.obj" },
  { name: "detail_desert", label: "detail_desert", objUrl: "models/KayKit/Models/obj/detail_desert.obj" },
  { name: "detail_forest", label: "detail_forest", objUrl: "models/KayKit/Models/obj/detail_forest.obj" },
  { name: "diamond_teamBlue", label: "diamond_teamBlue", objUrl: "models/KayKit/Models/obj/diamond_teamBlue.obj" },
  { name: "diamond_teamRed", label: "diamond_teamRed", objUrl: "models/KayKit/Models/obj/diamond_teamRed.obj" },
  { name: "diamond_teamYellow", label: "diamond_teamYellow", objUrl: "models/KayKit/Models/obj/diamond_teamYellow.obj" },
  { name: "flag_teamBlue", label: "flag_teamBlue", objUrl: "models/KayKit/Models/obj/flag_teamBlue.obj" },
  { name: "flag_teamRed", label: "flag_teamRed", objUrl: "models/KayKit/Models/obj/flag_teamRed.obj" },
  { name: "flag_teamYellow", label: "flag_teamYellow", objUrl: "models/KayKit/Models/obj/flag_teamYellow.obj" },
  { name: "gateLargeWide_teamBlue", label: "gateLargeWide_teamBlue", objUrl: "models/KayKit/Models/obj/gateLargeWide_teamBlue.obj" },
  { name: "gateLargeWide_teamRed", label: "gateLargeWide_teamRed", objUrl: "models/KayKit/Models/obj/gateLargeWide_teamRed.obj" },
  { name: "gateLargeWide_teamYellow", label: "gateLargeWide_teamYellow", objUrl: "models/KayKit/Models/obj/gateLargeWide_teamYellow.obj" },
  { name: "gateLarge_teamBlue", label: "gateLarge_teamBlue", objUrl: "models/KayKit/Models/obj/gateLarge_teamBlue.obj" },
  { name: "gateLarge_teamRed", label: "gateLarge_teamRed", objUrl: "models/KayKit/Models/obj/gateLarge_teamRed.obj" },
  { name: "gateLarge_teamYellow", label: "gateLarge_teamYellow", objUrl: "models/KayKit/Models/obj/gateLarge_teamYellow.obj" },
  { name: "gateSmallWide_teamBlue", label: "gateSmallWide_teamBlue", objUrl: "models/KayKit/Models/obj/gateSmallWide_teamBlue.obj" },
  { name: "gateSmallWide_teamRed", label: "gateSmallWide_teamRed", objUrl: "models/KayKit/Models/obj/gateSmallWide_teamRed.obj" },
  { name: "gateSmallWide_teamYellow", label: "gateSmallWide_teamYellow", objUrl: "models/KayKit/Models/obj/gateSmallWide_teamYellow.obj" },
  { name: "gateSmall_teamBlue", label: "gateSmall_teamBlue", objUrl: "models/KayKit/Models/obj/gateSmall_teamBlue.obj" },
  { name: "gateSmall_teamRed", label: "gateSmall_teamRed", objUrl: "models/KayKit/Models/obj/gateSmall_teamRed.obj" },
  { name: "gateSmall_teamYellow", label: "gateSmall_teamYellow", objUrl: "models/KayKit/Models/obj/gateSmall_teamYellow.obj" },
  { name: "heart_teamBlue", label: "heart_teamBlue", objUrl: "models/KayKit/Models/obj/heart_teamBlue.obj" },
  { name: "heart_teamRed", label: "heart_teamRed", objUrl: "models/KayKit/Models/obj/heart_teamRed.obj" },
  { name: "heart_teamYellow", label: "heart_teamYellow", objUrl: "models/KayKit/Models/obj/heart_teamYellow.obj" },
  { name: "hoop_teamBlue", label: "hoop_teamBlue", objUrl: "models/KayKit/Models/obj/hoop_teamBlue.obj" },
  { name: "hoop_teamRed", label: "hoop_teamRed", objUrl: "models/KayKit/Models/obj/hoop_teamRed.obj" },
  { name: "hoop_teamYellow", label: "hoop_teamYellow", objUrl: "models/KayKit/Models/obj/hoop_teamYellow.obj" },
  { name: "lightning", label: "lightning", objUrl: "models/KayKit/Models/obj/lightning.obj" },
  { name: "plantA_desert", label: "plantA_desert", objUrl: "models/KayKit/Models/obj/plantA_desert.obj" },
  { name: "plantA_forest", label: "plantA_forest", objUrl: "models/KayKit/Models/obj/plantA_forest.obj" },
  { name: "plantB_desert", label: "plantB_desert", objUrl: "models/KayKit/Models/obj/plantB_desert.obj" },
  { name: "plantB_forest", label: "plantB_forest", objUrl: "models/KayKit/Models/obj/plantB_forest.obj" },
  { name: "powerupBlock_teamBlue", label: "powerupBlock_teamBlue", objUrl: "models/KayKit/Models/obj/powerupBlock_teamBlue.obj" },
  { name: "powerupBlock_teamRed", label: "powerupBlock_teamRed", objUrl: "models/KayKit/Models/obj/powerupBlock_teamRed.obj" },
  { name: "powerupBlock_teamYellow", label: "powerupBlock_teamYellow", objUrl: "models/KayKit/Models/obj/powerupBlock_teamYellow.obj" },
  { name: "powerupBomb", label: "powerupBomb", objUrl: "models/KayKit/Models/obj/powerupBomb.obj" },
  { name: "ring_teamBlue", label: "ring_teamBlue", objUrl: "models/KayKit/Models/obj/ring_teamBlue.obj" },
  { name: "ring_teamRed", label: "ring_teamRed", objUrl: "models/KayKit/Models/obj/ring_teamRed.obj" },
  { name: "ring_teamYellow", label: "ring_teamYellow", objUrl: "models/KayKit/Models/obj/ring_teamYellow.obj" },
  { name: "rocksA_desert", label: "rocksA_desert", objUrl: "models/KayKit/Models/obj/rocksA_desert.obj" },
  { name: "rocksA_forest", label: "rocksA_forest", objUrl: "models/KayKit/Models/obj/rocksA_forest.obj" },
  { name: "rocksB_desert", label: "rocksB_desert", objUrl: "models/KayKit/Models/obj/rocksB_desert.obj" },
  { name: "rocksB_forest", label: "rocksB_forest", objUrl: "models/KayKit/Models/obj/rocksB_forest.obj" },
  { name: "slingshot_teamBlue", label: "slingshot_teamBlue", objUrl: "models/KayKit/Models/obj/slingshot_teamBlue.obj" },
  { name: "slingshot_teamRed", label: "slingshot_teamRed", objUrl: "models/KayKit/Models/obj/slingshot_teamRed.obj" },
  { name: "slingshot_teamYellow", label: "slingshot_teamYellow", objUrl: "models/KayKit/Models/obj/slingshot_teamYellow.obj" },
  { name: "spikeRoller", label: "spikeRoller", objUrl: "models/KayKit/Models/obj/spikeRoller.obj" },
  { name: "star", label: "star", objUrl: "models/KayKit/Models/obj/star.obj" },
  { name: "swiperDouble_teamBlue", label: "swiperDouble_teamBlue", objUrl: "models/KayKit/Models/obj/swiperDouble_teamBlue.obj" },
  { name: "swiperDouble_teamRed", label: "swiperDouble_teamRed", objUrl: "models/KayKit/Models/obj/swiperDouble_teamRed.obj" },
  { name: "swiperDouble_teamYellow", label: "swiperDouble_teamYellow", objUrl: "models/KayKit/Models/obj/swiperDouble_teamYellow.obj" },
  { name: "swiperLong_teamBlue", label: "swiperLong_teamBlue", objUrl: "models/KayKit/Models/obj/swiperLong_teamBlue.obj" },
  { name: "swiperLong_teamRed", label: "swiperLong_teamRed", objUrl: "models/KayKit/Models/obj/swiperLong_teamRed.obj" },
  { name: "swiperLong_teamYellow", label: "swiperLong_teamYellow", objUrl: "models/KayKit/Models/obj/swiperLong_teamYellow.obj" },
  { name: "swiper_teamBlue", label: "swiper_teamBlue", objUrl: "models/KayKit/Models/obj/swiper_teamBlue.obj" },
  { name: "swiper_teamRed", label: "swiper_teamRed", objUrl: "models/KayKit/Models/obj/swiper_teamRed.obj" },
  { name: "swiper_teamYellow", label: "swiper_teamYellow", objUrl: "models/KayKit/Models/obj/swiper_teamYellow.obj" },
  { name: "sword_teamBlue", label: "sword_teamBlue", objUrl: "models/KayKit/Models/obj/sword_teamBlue.obj" },
  { name: "sword_teamRed", label: "sword_teamRed", objUrl: "models/KayKit/Models/obj/sword_teamRed.obj" },
  { name: "sword_teamYellow", label: "sword_teamYellow", objUrl: "models/KayKit/Models/obj/sword_teamYellow.obj" },
  { name: "target", label: "target", objUrl: "models/KayKit/Models/obj/target.obj" },
  { name: "targetStand", label: "targetStand", objUrl: "models/KayKit/Models/obj/targetStand.obj" },
  { name: "tileHigh_desert", label: "tileHigh_desert", objUrl: "models/KayKit/Models/obj/tileHigh_desert.obj" },
  { name: "tileHigh_forest", label: "tileHigh_forest", objUrl: "models/KayKit/Models/obj/tileHigh_forest.obj" },
  { name: "tileHigh_teamBlue", label: "tileHigh_teamBlue", objUrl: "models/KayKit/Models/obj/tileHigh_teamBlue.obj" },
  { name: "tileHigh_teamRed", label: "tileHigh_teamRed", objUrl: "models/KayKit/Models/obj/tileHigh_teamRed.obj" },
  { name: "tileHigh_teamYellow", label: "tileHigh_teamYellow", objUrl: "models/KayKit/Models/obj/tileHigh_teamYellow.obj" },
  { name: "tileLarge_desert", label: "tileLarge_desert", objUrl: "models/KayKit/Models/obj/tileLarge_desert.obj" },
  { name: "tileLarge_forest", label: "tileLarge_forest", objUrl: "models/KayKit/Models/obj/tileLarge_forest.obj" },
  { name: "tileLarge_teamBlue", label: "tileLarge_teamBlue", objUrl: "models/KayKit/Models/obj/tileLarge_teamBlue.obj" },
  { name: "tileLarge_teamRed", label: "tileLarge_teamRed", objUrl: "models/KayKit/Models/obj/tileLarge_teamRed.obj" },
  { name: "tileLarge_teamYellow", label: "tileLarge_teamYellow", objUrl: "models/KayKit/Models/obj/tileLarge_teamYellow.obj" },
  { name: "tileLow_desert", label: "tileLow_desert", objUrl: "models/KayKit/Models/obj/tileLow_desert.obj" },
  { name: "tileLow_forest", label: "tileLow_forest", objUrl: "models/KayKit/Models/obj/tileLow_forest.obj" },
  { name: "tileLow_teamBlue", label: "tileLow_teamBlue", objUrl: "models/KayKit/Models/obj/tileLow_teamBlue.obj" },
  { name: "tileLow_teamRed", label: "tileLow_teamRed", objUrl: "models/KayKit/Models/obj/tileLow_teamRed.obj" },
  { name: "tileLow_teamYellow", label: "tileLow_teamYellow", objUrl: "models/KayKit/Models/obj/tileLow_teamYellow.obj" },
  { name: "tileMedium_desert", label: "tileMedium_desert", objUrl: "models/KayKit/Models/obj/tileMedium_desert.obj" },
  { name: "tileMedium_forest", label: "tileMedium_forest", objUrl: "models/KayKit/Models/obj/tileMedium_forest.obj" },
  { name: "tileMedium_teamBlue", label: "tileMedium_teamBlue", objUrl: "models/KayKit/Models/obj/tileMedium_teamBlue.obj" },
  { name: "tileMedium_teamRed", label: "tileMedium_teamRed", objUrl: "models/KayKit/Models/obj/tileMedium_teamRed.obj" },
  { name: "tileMedium_teamYellow", label: "tileMedium_teamYellow", objUrl: "models/KayKit/Models/obj/tileMedium_teamYellow.obj" },
  { name: "tileSlopeLowHigh_desert", label: "tileSlopeLowHigh_desert", objUrl: "models/KayKit/Models/obj/tileSlopeLowHigh_desert.obj" },
  { name: "tileSlopeLowHigh_forest", label: "tileSlopeLowHigh_forest", objUrl: "models/KayKit/Models/obj/tileSlopeLowHigh_forest.obj" },
  { name: "tileSlopeLowHigh_teamBlue", label: "tileSlopeLowHigh_teamBlue", objUrl: "models/KayKit/Models/obj/tileSlopeLowHigh_teamBlue.obj" },
  { name: "tileSlopeLowHigh_teamRed", label: "tileSlopeLowHigh_teamRed", objUrl: "models/KayKit/Models/obj/tileSlopeLowHigh_teamRed.obj" },
  { name: "tileSlopeLowHigh_teamYellow", label: "tileSlopeLowHigh_teamYellow", objUrl: "models/KayKit/Models/obj/tileSlopeLowHigh_teamYellow.obj" },
  { name: "tileSlopeLowMedium._teamRed", label: "tileSlopeLowMedium._teamRed", objUrl: "models/KayKit/Models/obj/tileSlopeLowMedium._teamRed.obj" },
  { name: "tileSlopeLowMedium_desert", label: "tileSlopeLowMedium_desert", objUrl: "models/KayKit/Models/obj/tileSlopeLowMedium_desert.obj" },
  { name: "tileSlopeLowMedium_forest", label: "tileSlopeLowMedium_forest", objUrl: "models/KayKit/Models/obj/tileSlopeLowMedium_forest.obj" },
  { name: "tileSlopeLowMedium_teamBlue", label: "tileSlopeLowMedium_teamBlue", objUrl: "models/KayKit/Models/obj/tileSlopeLowMedium_teamBlue.obj" },
  { name: "tileSlopeLowMedium_teamYellow", label: "tileSlopeLowMedium_teamYellow", objUrl: "models/KayKit/Models/obj/tileSlopeLowMedium_teamYellow.obj" },
  { name: "tileSlopeMediumHigh_desert", label: "tileSlopeMediumHigh_desert", objUrl: "models/KayKit/Models/obj/tileSlopeMediumHigh_desert.obj" },
  { name: "tileSlopeMediumHigh_forest", label: "tileSlopeMediumHigh_forest", objUrl: "models/KayKit/Models/obj/tileSlopeMediumHigh_forest.obj" },
  { name: "tileSlopeMediumHigh_teamBlue", label: "tileSlopeMediumHigh_teamBlue", objUrl: "models/KayKit/Models/obj/tileSlopeMediumHigh_teamBlue.obj" },
  { name: "tileSlopeMediumHigh_teamRed", label: "tileSlopeMediumHigh_teamRed", objUrl: "models/KayKit/Models/obj/tileSlopeMediumHigh_teamRed.obj" },
  { name: "tileSlopeMediumHigh_teamYellow", label: "tileSlopeMediumHigh_teamYellow", objUrl: "models/KayKit/Models/obj/tileSlopeMediumHigh_teamYellow.obj" },
  { name: "tileSmall_desert", label: "tileSmall_desert", objUrl: "models/KayKit/Models/obj/tileSmall_desert.obj" },
  { name: "tileSmall_forest", label: "tileSmall_forest", objUrl: "models/KayKit/Models/obj/tileSmall_forest.obj" },
  { name: "tileSmall_teamBlue", label: "tileSmall_teamBlue", objUrl: "models/KayKit/Models/obj/tileSmall_teamBlue.obj" },
  { name: "tileSmall_teamRed", label: "tileSmall_teamRed", objUrl: "models/KayKit/Models/obj/tileSmall_teamRed.obj" },
  { name: "tileSmall_teamYellow", label: "tileSmall_teamYellow", objUrl: "models/KayKit/Models/obj/tileSmall_teamYellow.obj" },
  { name: "tree_desert", label: "tree_desert", objUrl: "models/KayKit/Models/obj/tree_desert.obj" },
  { name: "tree_forest", label: "tree_forest", objUrl: "models/KayKit/Models/obj/tree_forest.obj" },

  {name: "barrel", label:"barrel", objUrl:"models/LowPolyDungeon/barrel.obj"},
  {name: "brokenbarrel", label:"brokenbarrel", objUrl:"models/LowPolyDungeon/brokenbarrel.obj"},
  {name: "bars", label:"bars", objUrl:"models/LowPolyDungeon/bars.obj"},
  {name: "bladetrap", label:"bladetrap", objUrl:"models/LowPolyDungeon/bladetrap.obj"},
  {name: "brickwall", label:"brickwall", objUrl:"models/LowPolyDungeon/brickwall.obj"},
  {name: "brickwallwithbars", label:"brickwallwithbars", objUrl:"models/LowPolyDungeon/brickwallwithbars.obj"},
  {name: "candle", label:"candle", objUrl:"models/LowPolyDungeon/candle.obj"},
  {name: "floor", label:"floor", objUrl:"models/LowPolyDungeon/floor.obj"},
  {name: "floor2", label:"floor2", objUrl:"models/LowPolyDungeon/floor2.obj"},
  {name: "skull", label:"skull", objUrl:"models/LowPolyDungeon/skull.obj"},
  {name: "sawfloor", label:"sawfloor", objUrl:"models/LowPolyDungeon/sawfloor.obj"},
  {name: "openchest", label:"openchest", objUrl:"models/LowPolyDungeon/openchest.obj"},


];


//constrói o menu de seleção de modelos. cada item é um botão, ao clickar o modelo é carregado
function buildModelMenu(gl) {
  const container = document.getElementById("menu-modelos");
 
  container.innerHTML = "<h2>Seleção de modelos</h2>";
 
  for (const modelDef of availableModels) {
    const button = document.createElement("button");
    button.className = "model-button";
 
    const icon = document.createElement("img");
    icon.className = "model-icon";
    icon.alt = modelDef.label;
    // Placeholder 
    icon.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23444'/%3E%3C/svg%3E";
 
    const labelSpan = document.createElement("span");
    labelSpan.className = "model-label";
    labelSpan.textContent = modelDef.label;
 
    button.appendChild(icon);
    button.appendChild(labelSpan);
 
    button.addEventListener("click", async () => {
      // Se já estiver em loadedModels, loadModel devolve o cache direto, sem rebaixar nem recriar buffers.
      await loadModel(gl, modelDef.name, modelDef.objUrl);
 
      // Nova instância nasce na origem 
      addSceneObject(modelDef.name, [0, 0, 0]);
 
      refreshEditMenu();
    });
 
    container.appendChild(button);
 
    // Geração da thumbnail acontece em segundo plano 
    getModelThumbnail(modelDef).then(dataUrl => {
      if (dataUrl) {
        icon.src = dataUrl;
      }
    });
  }
}

