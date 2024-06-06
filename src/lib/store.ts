import { writable } from 'svelte/store';    

const messageStore = writable('');
const socket = new WebSocket('wss://chat.stormyyy.dev');
const connectedStore = writable(false);


// Connection opened
socket.addEventListener('open', function (event) {
    connectedStore.set(true);
});

socket.addEventListener('close', function (event) {
    connectedStore.set(false);
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

