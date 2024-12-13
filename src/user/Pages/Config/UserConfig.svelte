<script>
  import Tabs from "src/ShareComponent/Tabs.svelte";

  import SortConfig from "./SortConfig.svelte";
  import Hotkeys from "./Hotkeys/Hotkeys.svelte";
  import { fade } from "svelte/transition";

  export let tab = "tab-1";
  export let hide;

  const hideConfig = ({ currentTarget, target }) => {
    if (currentTarget === target) hide();
  };

  const tabs = [
    { id: "tab-1", name: "Sorting Config", icon: "filter", component: SortConfig },
    { id: "tab-2", name: "Hotkeys", icon: "keyboard", component: Hotkeys },
  ];

  const handleKey = (e) => {
    if (e.ctrlKey && e.keyCode === 88) {
      e.stopPropagation();
      hide();
    }
  };

  const focus = (el) => el?.focus();
</script>

<div class="modal-container" on:click={hideConfig}>
  <div class="modal-config" transition:fade={{ duration: 200 }} use:focus tabindex="-1" on:keydown={handleKey}>
    <Tabs {tabs} bind:tab />
  </div>
</div>

<style>
  .modal-config {
    position: fixed;
    top: 40px;
    right: 5px;
    height: 380px;
    width: 400px;
    background-color: #343a40;
    z-index: 999;
    overflow: hidden;
    border-radius: 0.35rem;
  }

  .modal-config :global(#tabs-content) {
    height: calc(100% - 50px);
    padding: 5px 0;
  }
</style>
