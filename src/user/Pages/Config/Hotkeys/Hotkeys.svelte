<script>
  import InputControl from "./InputControl.svelte";
  import { HotkeysStore, save, restore, update } from "src/admin/Store/HotkeysStore.js";

  const keys = Object.keys($HotkeysStore);
</script>

<div id="u-config">
  <fieldset>
    <legend>Hotkeys</legend>
    <section>
      {#each keys as key}
        <InputControl {key} item={$HotkeysStore[key]} onChange={update} />
      {/each}
    </section>
    <div class="btn-bar">
      <button class="btn" on:click={restore}>Load Default</button>
      <button class="btn" on:click={save}> Save </button>
    </div>
  </fieldset>
</div>

<style>
  @import "./config.css";
</style>
