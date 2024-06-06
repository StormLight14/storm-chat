<script lang="ts">
  import store from '../lib/store.ts';
  import { tick } from 'svelte';

  const minUsernameLength = 3;

  let responseMessage: string;
  let messagesContainer: HTMLDivElement;

  let username = "";
  let username_submitted = false;
  let message: string;
  let messages: string[][] = [];

  let connected = false;
  store.connectedSubscribe(currentConnected => {
    connected = currentConnected;
    if (connected === false) {
      connectionFailed();
    } else {
      responseMessage = "";
    }
  });

  function join() {
    if (username.length >= minUsernameLength) {
      username_submitted = true;
      if (connected === true) {
        responseMessage = "";
      }
      store.subscribe(currentMessage => {
        messages = [...messages, formatMessage(currentMessage)];
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      });
    } else {
      responseMessage = "Username must be at least " + minUsernameLength + " characters.";
    }
  }

  function connectionFailed() {
    responseMessage = "There was a problem connecting to the server. Attempting reconnection..."
  }

  async function sendMessage() {
    if (message.length > 0) {
      let sent_message = username + ": " + message;
      store.sendMessage(sent_message);
      messages.push(formatMessage(sent_message));
      messages = messages; // silly svelte thing
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
  <h1>Storm Chat</h1>
  {#if responseMessage}
    <p class="response-message">{responseMessage}</p>
  {/if}
  {#if connected === false || username_submitted === false}
    <p>Username: </p>
    <form on:submit={join}>
      <input type="text" bind:value={username} minlength="{minUsernameLength}" maxlength="16"/>
      <input type="submit" value="Join Chat"/>
    </form>
  {/if}
  
  {#if connected === true && username_submitted === true}
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
    <form on:submit|preventDefault={sendMessage}>
      <input type="text" class="message-input" bind:value={message}/>
      <input type="submit" value="Send"/>
    </form>
  {/if}
</div>

<style>
  :root {
    --surface-1: #45475a;
    --subtext-1: #bac2de;
    --subtext-0: #a6adc8;
    --red: #f38ba8;
    --text: #cdd6f4;
    --bg-color: #1e1e2e;
  }

  root.light {
    --surface-1: #bcc0cc;
    --subtext-1: #5c5f77;
    --subtext-0: #6c6f85;
    --red: #d20f39;
    --text: #4c4f69;
    --bg-color: #eff1f5;
  }

  :root {
    background-color: var(--bg-color);
    color: var(--text);
  }

  .container {
    margin: 0;
  }

  .messages {
    max-height: 80vh;
    min-width: 100%;
    overflow-y: scroll;
  }

  .message {
    color: var(--subtext-);
  }

  form {
    display: flex;
    align-items: center;
    width: 100%;
    margin: 0;
  }

  input {
    border-width: 0;
    border-radius: 3px;
    height: 25px;
    color: var(--text);
    background-color: var(--surface-1);
  }

  .message-input {
    width: 100%;
  }

  input[type=submit] {
    text-align: center;
    margin-left: 5px;
  }

  p {
    margin-top: 0;
  }

  .message-container {
    margin-top: 0;
    margin-bottom: 0;
    width: 100%;
    display: flex;
  }

  .response-message {
    color: #f38ba8;
  }
</style>