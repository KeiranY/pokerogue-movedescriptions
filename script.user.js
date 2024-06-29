// ==UserScript==
// @name         PokéRogue Move Descriptions
// @namespace    https://github.com/KeiranY
// @version      2024-06-29
// @description  Extension for PokéRogue that allows you to see move descriptions while holding the stats key (default: shift) during move select
// @author       Keiran Young
// @homepage     https://github.com/KeiranY/
// @updateURL    https://github.com/KeiranY/pokerogue-movedescriptions/raw/master/script.user.js
// @downloadURL  https://github.com/KeiranY/pokerogue-movedescriptions/raw/master/script.user.js
// @match        https://pokerogue.net/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pokerogue.net
// @grant        none
// ==/UserScript==

let game = undefined;
let scene = undefined;
let fightUi = undefined;
let moveDesc = undefined;
let lastCursor = -1;
let styleOptions = {
    fontFamily: "emerald",
    fontSize: 72,
    color: "#f8f8f8",
    padding: {
        bottom: 6
    },
    wordWrap: {
        width: 1340
    }
};

let origButtonStats = undefined;

function buttonStats(pressed = true) {
    origButtonStats(pressed);
    // Check if we're in battle and on the move select menu
    if (scene.getEnemyPokemon() && scene.ui.getMode() === 3) {
        if (fightUi === undefined) {
            fightUi = scene.ui.handlers.find(x => x.constructor.name === "FightUiHandler");
        }
        if (pressed) {
            if (moveDesc !== undefined) {
                if (fightUi.cursor !== lastCursor) {
                    lastCursor = fightUi.cursor;

                    let moveset = scene.currentPhase.getPokemon().moveset;
                    if (lastCursor < moveset.length) {
                        moveDesc.text = moveset[lastCursor].getMove().effect;
                    } else {
                        moveDesc.text = "";
                    }
                }
                return;
            }
            moveDesc = scene.add.text(-7, 0, "", styleOptions);
            moveDesc.setScale(0.166666666666667);
            moveDesc.setShadow(4, 5, "#6b5a73");
            moveDesc.name = "Move Desc";
            // Get move desc
            let moveset = scene.currentPhase.getPokemon().moveset;
            lastCursor = fightUi.cursor;
            if (lastCursor < moveset.length) {
                moveDesc.text = moveset[lastCursor].getMove().effect;

                // Hide Moves
                let movesContainer = scene.ui.getByName("moves");
                for (const m of movesContainer.list) {
                    m.visible = false;
                }
                // Hide cursor
                scene.ui.list.find(x => x.constructor.name === "Image").visible = false;

                movesContainer.add(moveDesc);
            }
        } else {
            if (moveDesc === undefined) return;
            moveDesc.destroy();
            moveDesc = undefined;

            // Unhide Moves
            let movesContainer = scene.ui.getByName("moves");
            for (const m of movesContainer.list) {
                m.visible = true;
            }

            // Unhide cursor
            scene.ui.list.find(x => x.constructor.name === "Image").visible = true;
        }
    }
}


(function() {
    'use strict';

    // Loop waiting for the game to fully load
    function init() {
        // Check that everything we need to start is available
        if (window.Phaser && window.Phaser.Display.Canvas.CanvasPool.pool[0].parent && window.Phaser.Display.Canvas.CanvasPool.pool[0].parent.game.scene.scenes[1].uiInputs) {
            // Grab the Phaser engine Game instance and the PokéRogue Battle Scene
            game = window.Phaser.Display.Canvas.CanvasPool.pool[0].parent.game;
            scene = game.scene.scenes[1];

            // Hook the original "buttonStats" fn that is responsible for showing detail when "stats"/shift is helf
            origButtonStats = scene.uiInputs.buttonStats.bind(scene.uiInputs);
            scene.uiInputs.buttonStats = buttonStats;
        } else {
            console.log("Waiting for Game");
            setTimeout(init, 1000);
        }
    }
    init();

})();
