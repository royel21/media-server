<script>
  import { getContext, onDestroy } from "svelte";
  import InputControl from "./InputControl.svelte";
  import apiUtils from "src/apiUtils";

  const User = getContext("User");

  const items = User.hotkeys.sort((a, b) => a.Id - b.Id);

  onDestroy(async () => {
    await apiUtils.post("users/update-hotkeys", { hotkeys: items });
  });
</script>

<div id="hotkey-config">
  {#each items as item}
    <InputControl bind:item />
  {/each}
</div>

<style>
  #hotkey-config {
    color: white;
    height: 97%;
    overflow-y: auto;
  }
</style>
