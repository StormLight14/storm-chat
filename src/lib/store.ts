import { writable } from 'svelte/store';    

const messageStore = writable('');
let socket: WebSocket;
const connectedStore = writable(false);

function setupWebsocket() {
    socket = null;
    socket = new WebSocket('wss://chat.stormyyy.dev');
    // Connection opened
    socket.addEventListener('open', function (event) {
        connectedStore.set(true);
    });

    socket.addEventListener('close', function (event) {
        connectedStore.set(false);
        setTimeout(setupWebsocket, 3000);
        console.log("Attempting reconnection...");
    });

    // Listen for messages
    socket.addEventListener('message', function (event) {
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

setupWebsocket();

const sendMessage = (message: string) => {
    if (socket.readyState <= 1) {
        socket.send(message);
    }
}

export default {
    subscribe: messageStore.subscribe,
    sendMessage,
    connectedSubscribe: connectedStore.subscribe
}

