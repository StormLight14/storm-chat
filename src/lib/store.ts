import { writable } from 'svelte/store';    

let socket: WebSocket;
const messageStore = writable('');
const connectedStore = writable(false);

const setupWebsocket = async (username: string) => {
    socket = new WebSocket('ws://localhost:8082');

    // Connection opened
    socket.addEventListener('open', function (event) {
        connectedStore.set(true);
        sendMessage("[JOINED]: " + username);
    });

    socket.addEventListener('close', function (event) {
        connectedStore.set(false);
        setTimeout(setupWebsocket, 5000);
        console.log("Attempting reconnection...");
    });

    // Listen for messages
    socket.addEventListener('message', function (event) {
        let message_text: string;

        if (event.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = function() {
                messageStore.set(reader.result as string);
            };
            reader.readAsText(event.data);
        } else {
            messageStore.set(event.data);
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
    connectedSubscribe: connectedStore.subscribe
}

