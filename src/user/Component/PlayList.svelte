<script>
  import Icons from "src/icons/Icons.svelte";
  import List from "./List.svelte";
  import { ToggleMenu } from "src/ShareComponent/ToggleMenu";

  export let files = [];
  export let fileId;
  export let onFilter;
  export let folderName = "";

  let filter = "";

  let hideList = true;
</script>

<div id="p-bg" class:hidelist={!hideList} on:click|stopPropagation={(e) => (hideList = true)} tabindex="-1">
  <label
    id="btn-playlist"
    class={"show-list" + (!hideList ? " move" : "")}
    class:bottom={$ToggleMenu}
    for="p-hide"
    title="play-list"
    on:click|stopPropagation={(e) => (hideList = !hideList)}
  >
    <span class="p-sort">
      <Icons name="list" width="30px" height="24px" />
    </span>
  </label>
  {#if !hideList}
    <List {files} {folderName} {onFilter} {fileId} on:click bind:hideList bind:filter />
  {/if}
</div>

<style>
  #p-bg.hidelist {
    width: 100%;
  }
  #p-bg {
    display: block;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 0;
    z-index: 10;
  }

  label {
    margin: 0;
  }
  .show-list {
    position: fixed;
    right: 10px;
    bottom: 35px;
    transition: 0.3s all;
    z-index: 11;
    background-color: black;
    padding: 3px 0px 3px 6px;
    border-radius: 0.25rem;
    cursor: pointer;
    z-index: 99;
  }
  .show-list.bottom {
    bottom: 0px;
  }
  .move {
    right: 230px;
    opacity: 1 !important;
  }

  #play-list .p-controls .p-sort {
    margin: 0;
    width: 32px;
    font-size: 30px;
    padding: 0 8px;
    flex-grow: 0;
  }

  .b-control {
    text-align: center;
    position: absolute;
    bottom: 0px;
    width: 100%;
  }
</style>
