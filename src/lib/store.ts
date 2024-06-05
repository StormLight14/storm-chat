import { writable } from 'svelte/store';    

const messageStore = writable('');
const socket = new WebSocket('wss://chat.stormyyy.dev');

let connected = false;

// Connection opened
socket.addEventListener('open', function (event) {
    connected = true;
});

// Listen for messages
socket.addEventListener('message', function (event) {
    const reader = new FileReader();
    reader.onload = function() {
        messageStore.set(reader.result as string);
    }
    reader.readAsText(event.data);
});

const sendMessage = (message: string) => {
	if (socket.readyState <= 1) {
		socket.send(message);
	}
}

export default {
	subscribe: messageStore.subscribe,
	sendMessage
}

