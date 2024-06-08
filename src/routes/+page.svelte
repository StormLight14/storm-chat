<script lang="ts">
  import store from '../lib/store.ts';
  import '../app.scss';
  import { tick } from 'svelte';

  const allowedChars = "abcdefghijklmnopqrstuvwxyz";
  const minUsernameLength = 3;

  let responseMessage: string;
  let messagesContainer: HTMLDivElement;

  let username: string = "";
  let usernameSubmitted = false;
  let message: string;
  let messages: string[][] = [];

  let users: string[];
  let address: string = "wss://chat.stormyyy.dev";

  let connected = false;
  let showConnected = false;
  store.connectedSubscribe(currentConnected => {
    connected = currentConnected;
    if (connected === false) {
      usernameSubmitted = false;
    }
  });
  store.usersSubscribe(currentUsers => {
    users = currentUsers;
  });

  function join() {
    if (username.length >= minUsernameLength) {
      for (let i = 0; i < username.length; i++) {
        if (!allowedChars.includes(username[i].toLowerCase())) {
          responseMessage = "Username must only contain letters A-Z.";
          return;
        } else {
          responseMessage = "";
        }
      }
      store.setupWebsocket(address, username);
      usernameSubmitted = true;
      if (connected === true) {
        responseMessage = "";
      } else {
        showConnected = true;
      }
      store.subscribe(currentMessage => {
        if (currentMessage.startsWith("[SERVER_RESPONSE]")) {
          responseMessage = currentMessage.split(" ").slice(1).join(" ");
        } else {
          messages = [...messages, formatMessage(currentMessage)];
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      });
    } else {
      responseMessage = "Username must be at least " + minUsernameLength + " characters.";
    }
  }

  async function sendMessage() {
    if (message.length > 0) {
      let sent_message = username + ": " + message;
      store.sendMessage(sent_message);
      messages.push(formatMessage(sent_message));
      messages = messages; // silly svelte thing to show the change
      message = "";
      await tick();
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  function formatMessage(msg: string): string[] {
    let split_msg = msg.split(": ")
    let sent_user = split_msg[0];
    let sent_msg = split_msg[1];

    if (sent_user && sent_msg) {
      return [sent_user, sent_msg]
    } else {
      return ["", ""]
    }
  }
</script>

<div class="container">
  {#if usernameSubmitted === false}
    <h1>Storm Chat</h1>
  {/if}
  
  {#if responseMessage}
    <p class="response-message">{responseMessage}</p>
  {:else if !connected && showConnected}
    <p class="response-message">Can't connect to the server.</p>
  {/if}
  {#if connected === false || usernameSubmitted === false}
    <form class="login-form" on:submit={join}>
      <p>Server Address: </p>
      <input type="text" bind:value={address}/>
      <p>Username: </p>
      <input type="text" bind:value={username} minlength="{minUsernameLength}" maxlength="16"/>
      <button type="submit">Join Chat</button>
    </form>
  {/if}
  
  {#if connected === true && usernameSubmitted === true}
    <div class="messages" bind:this={messagesContainer}>
      {#each messages as message}
        {#if message[0]}
          <div class="message-container">
            <p class="username">{message[0]}:&nbsp;</p>
            <p class="message">{message[1]}</p>
          </div>
        {/if}
      {/each}
    </div>
    <div>
      
    </div>
    <form class="message-input" on:submit|preventDefault={sendMessage}>
      <input type="text" bind:value={message}/>
      <button type="submit">Send</button>
    </form>
  {/if}
</div>