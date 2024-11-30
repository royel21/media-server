<script>
  import Tabs from "src/ShareComponent/Tabs.svelte";

  import SortConfig from "./SortConfig.svelte";
  import Hotkeys from "./Hotkeys/Hotkeys.svelte";
  import { fade } from "svelte/transition";

  export let tab = "tab-1";

  const tabs = [
    { id: "tab-1", name: "Sorting Config", icon: "filter", component: SortConfig },
    { id: "tab-2", name: "Hotkeys", icon: "keyboard", component: Hotkeys },
  ];
</script>

<div class="modal-config" transition:fade={{ duration: 200 }}>
  <Tabs {tabs} bind:tab />
</div>

<style>
  .modal-config {
    position: fixed;
    top: 40px;
    right: 5px;
    height: 380px;
    width: 400px;
    background-color: #343a40;
    z-index: 9999;
    overflow: hidden;
    border-radius: 0.35rem;
  }
</style>
