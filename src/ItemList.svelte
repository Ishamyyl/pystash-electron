<script>
  import Item from "./Item.svelte";

  import { search_results as items } from "./stores.js";
</script>

<style>
  div {
    grid-area: items;

    /* grid layout */
    display: grid;
    grid-template-rows: 100px;
    grid-auto-flow: row;
  }
</style>

<div>
  {#each $items as item}
    <Item {item} />
  {/each}
</div>
