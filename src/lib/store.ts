import { writable } from 'svelte/store';    

let socket: WebSocket;
const messageStore = writable('');
const connectedStore = writable(false);
const usersStore = writable([]);

const setupWebsocket = async (username: string) => {
    socket = new WebSocket('ws://localhost:8082');

    // Connection opened
    socket.addEventListener('open', function (event) {
        connectedStore.set(true);
        sendMessage("[JOIN_ATTEMPT] " + username);
    });

    socket.addEventListener('close', function (event) {
        connectedStore.set(false);
        //setTimeout(setupWebsocket, 5000);
        //console.log("Attempting reconnection...");
    });

    // Listen for messages
    socket.addEventListener('message', function (event) {
        let message_text: string = "";

        if (event.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = function() {
                message_text = reader.result as string;
            };
            reader.readAsText(event.data);
        } else {
            message_text = event.data;
        }
        
        if (message_text.startsWith("[JOIN_ATTEMPT]")) {
            
        } else if (message_text.startsWith("[JOIN]")) {

        } else {
            messageStore.set(message_text);
        }
    });
}

const sendMessage = (message: string) => {
    if (socket.readyState <= 1) {
        socket.send(message);
    }
}

export default {
    subscribe: messageStore.subscribe,
    sendMessage,
    setupWebsocket,
    connectedSubscribe: connectedStore.subscribe,
    usersSubscribe: usersStore.subscribe,
}

