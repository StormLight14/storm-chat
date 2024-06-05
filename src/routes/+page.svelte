<script lang="ts">
  import store from '../lib/store.ts';
  import { tick } from 'svelte';

  const minUsernameLength = 3;

  let responseMessage: string;
  let messagesContainer: HTMLDivElement;

  let username = "";
  let joined_chat = false;
  let message: string;
  let messages: string[] = [];

  function join() {
    if (username.length >= minUsernameLength) {
      responseMessage = "";
      joined_chat = true;
      store.subscribe(currentMessage => {
        messages = [...messages, currentMessage];
      });
    } else {
      responseMessage = "Username must be at least " + minUsernameLength + " characters.";
    }
  }

  async function sendMessage() {
    if (message.length > 0) {
      let sent_message = username + ": " + message;
      store.sendMessage(sent_message);
      messages.push(sent_message);
      messages = messages; // silly svelte thing
      message = "";
      await tick();
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
</script>

<div class="container">
  <h1>Storm Chat</h1>
  {#if responseMessage}
    <p class="response-message">{responseMessage}</p>
  {/if}
  {#if joined_chat === false}
    <p>Username: </p>
    <form on:submit={join}>
      <input type="text" bind:value={username} minlength="{minUsernameLength}" maxlength="16"/>
      <input type="submit" value="Join Chat"/>
    </form>
  {/if}
  
  {#if joined_chat === true}
    <div class="messages" bind:this={messagesContainer}>
      {#each messages as message}
        <p>{message}</p>
      {/each}
    </div>
    <form on:submit|preventDefault={sendMessage}>
      <input type="text" bind:value={message}/>
      <input type="submit" value="Send"/>
    </form>
  {/if}
</div>

<style>
  .container {
    margin-top: 0;
    margin-bottom: 0;
  }

  .messages {
    max-height: 80vh;
    min-width: 100%;
    flex-shrink: 3;
    overflow-y: scroll;
  }

  .response-message {
    color: red;
  }
</style>