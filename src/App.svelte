<script>
  import ItemList from "./ItemList.svelte";
  import Modal from "./Modal.svelte";

  import { test } from "./stores.js";

  let settings = { poesessid: "" };

  let show_settings_modal = false;
  function toggle_settings_modal(event) {
    show_settings_modal = !show_settings_modal;
  }

  let name = "";
</script>

<style>
  :global(body) {
    background-color: #000;
    background: gray url("../static/teee.png") repeat 0 0;
    animation: shaper_slide 25s linear infinite;
    /* grid layout */
    display: grid;
    padding: 0.5em;
    grid-gap: 0.5em;
    grid:
      "menu menu menu menu" min-content
      "search items items items" 1fr
      / min-content 1fr;
  }
</style>

<button on:click={toggle_settings_modal}>Settings</button>
<p>{$test.test}</p>

{#if show_settings_modal}
  <Modal on:close={toggle_settings_modal}>
    <p slot="header">Settings</p>
    <span slot="closer">Save</span>
    <input type="text" bind:value={settings.poesessid} />
    <br />
  </Modal>
{/if}
