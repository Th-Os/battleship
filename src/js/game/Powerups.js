import "../../scss/powerups.scss";

import Shield from "./Shield.js";
import Scan from "./Scan.js";
import Bomb from "./Bomb.js";
import Missile from "./Missile.js";

var App = App || {};
App.Powerups = function(controller, playerMap, opponentMap, container, settings) {
    "use strict";
    /* eslint-env browser */

    const that = {};
    const powerups = {
        shield: new Shield(controller, playerMap, opponentMap, settings.shield),
        scan: new Scan(controller, playerMap, opponentMap, settings.scan),
        bomb: new Bomb(controller, playerMap, opponentMap, settings.bomb),
        missile: new Missile(controller, playerMap, opponentMap, settings.missile)
    };

    let powerup;

    function init() {
        const list = document.createElement("ul");
        container.appendChild(list);
        const powerupsArray = Object.keys(powerups);
        const random = Math.random() * powerupsArray.length;
        const index = Math.floor((random === 4) ? 3 : random);
        powerupsArray.splice(index, 1);
        powerupsArray.forEach(createPowerUpButton.bind(undefined, list));
    }

    function createPowerUpButton(list, type) {
        const button = document.createElement("li");
        const buttonIcon = document.createElement("span");
        const buttonTitle = document.createElement("span");
        const buttonCount = document.createElement("span");
        button.id = type;
        buttonIcon.classList.add("icon");
        buttonTitle.classList.add("title");
        buttonTitle.innerHTML = settings[type].title;
        buttonCount.classList.add("count");
        buttonCount.innerHTML = settings[type].count;
        button.appendChild(buttonIcon);
        button.appendChild(buttonTitle);
        button.appendChild(buttonCount);
        button.addEventListener("click", toggleSelection);
        list.appendChild(button);
    }

    function toggleSelection(e) {
        if(controller.hasTurn()) {
            const current = e.currentTarget;
            const doSelect = !powerup || current.id !== powerup.getType();
            if(powerup) {
                deselect();
            }
            if(doSelect) {
                select(current);
            }
        }
    }

    function handleKeyDown(e) {
        if(e.keyCode === 27) {
            window.removeEventListener("keydown", handleKeyDown);
            deselect();
        }
    }

    function select(current) {
        current.classList.add("selected");
        powerup = powerups[current.id];
        powerup.show();
        window.addEventListener("keydown", handleKeyDown);
    }

    function deselect() {
        document.getElementById(powerup.getType()).classList.remove("selected");
        powerup.hide();
        powerup = undefined;
    }

    function done() {
        const button = document.getElementById(powerup.getType());
        const indicator = button.querySelector(".count");
        const count = parseInt(indicator.innerHTML) - 1;
        indicator.innerHTML = count;
        if(count < 1) {
            button.classList.add("disabled");
            button.removeEventListener("click", toggleSelection);
        }
        deselect();
    }

    function active() {
        return powerup;
    }

    that.active = active;
    that.done = done;

    init();
    return that;
};

export default App.Powerups;
