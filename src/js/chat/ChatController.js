import "../../scss/chat.scss";

var App = App || {};
App.ChatController = function(app) {
    "use strict";
    /* eslint-env browser */

    const that = {};

    let chat,
        username,
        conversation,
        messageInput,
        login,
        loginInput,
        loginListener;

    function init() {
        chat = document.querySelector(".bs-chat");
        conversation = document.querySelector("#bs-chat-conversation");
        messageInput = document.querySelector("#bs-chat-input");
        login = document.querySelector("#bs-chat-login");
        loginInput = login.querySelector("input");

        loginListener = loginInput.addEventListener("keypress", onLoginInput);
        messageInput.addEventListener("keypress", onMessageInput);
    }

    function addMessage(type, username, message) {
        const li = document.createElement("li");
        const messageNode = document.createElement("span");
        messageNode.className = "message";
        li.className = type;
        if(type !== "system") {
            const usernameNode = document.createElement("span");
            usernameNode.className = "username";
            usernameNode.innerHTML = username + ": ";
            messageNode.appendChild(usernameNode);
        }
        messageNode.appendChild(document.createTextNode(message));
        li.appendChild(messageNode);
        conversation.appendChild(li);
        updateScrollPosition();
    }

    function updateScrollPosition() {
        const actualChatHeight = chat.offsetHeight - messageInput.offsetHeight;
        if(conversation.offsetHeight > actualChatHeight) {
            const chatWindow = chat.querySelector(".window");
            chatWindow.scrollTop = conversation.offsetHeight - actualChatHeight;
        }
    }

    function onLog(data) {
        addMessage("system", undefined, data);
    }

    function onMessage(data) {
        addMessage("opponent", data.username, data.message);
    }

    function onMessageInput(e) {
        if(e.keyCode === 13) {
            const message = messageInput.value;
            if(message !== "") {
                addMessage("player", username, message);
                app.send(message);
                messageInput.value = "";
            }
        }
    }

    function onLoginInput(e) {
        if(e.keyCode === 13) {
            username = loginInput.value;
            if(username !== "") {
                app.login(username);
                loginInput.removeEventListener("keypress", loginListener);
                login.style.display = "none";
            }
        }
    }

    that.onLog = onLog;
    that.onMessage = onMessage;

    init();
    return that;
};

export default App.ChatController;
