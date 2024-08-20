<script>
  import { afterUpdate } from "svelte";

  export let showMenu;
  export let onMenuClick;
  let ref;

  let left = showMenu.e?.pageX;
  let top = showMenu.e?.pageY;

  afterUpdate(() => {
    const h = document.body.offsetHeight;
    const w = document.body.offsetWidth;

    if (top + ref.offsetHeight > h) {
      top = top - ref.offsetHeight;
    }

    if (left + ref.offsetWidth > w) {
      top = top - ref.offsetWidth;
    }
  });

  $: if (showMenu) {
    left = showMenu.e?.pageX;
    top = showMenu.e?.pageY;
  }
</script>

<div bind:this={ref} id="c-menu" style={`left: ${left}px; top:${top}px`} on:click={onMenuClick}>
  <div id="scanDirectory">Add to Directories</div>
  <div id="remFolder">Rename Folder</div>
  <div id="cleanupVideos">Clean Videos</div>
  <div id="moveToDir">Move To Directory</div>
  <div id="removeDFolder">Delete Folder</div>
</div>

<style>
  #c-menu {
    z-index: 300;
    position: fixed;
    width: max-content;
    background-color: rgb(95, 91, 91);
    cursor: pointer;
    border-radius: 0.25rem;
  }
  #c-menu div {
    padding: 2px 5px;
  }
  #c-menu div:not(:last-child) {
    border-bottom: 1px solid;
  }
  #c-menu div:hover {
    background-color: #add8e647;
  }
</style>
