<script>
  import Icons from "src/icons/Icons.svelte";
  import FilesList from "./FilesList.svelte";
  import FolderDetails from "./FolderDetails.svelte";

  let tab = "tab-1";
  export let folderId;
  export let Path;

  const components = {
    "tab-1": FolderDetails,
    "tab-2": FilesList,
  };
</script>

<div id="folder-data" class="file-list col-6">
  <div class="usn nav nav-tabs">
    <div class="nav-item">
      <input type="radio" bind:group={tab} value="tab-1" id="tab1" />
      <label class="nav-link" for="tab1">
        <Icons name="list" />
        <span id="dirs">Details</span>
      </label>
    </div>
    <div class="nav-item">
      <input type="radio" bind:group={tab} value="tab-2" id="tab2" />
      <label class="nav-link" for="tab2">
        <Icons name="file" />
        <span id="disks">Files</span>
      </label>
    </div>
  </div>
  <svelte:component this={components[tab]} {folderId} {Path} />
</div>

<style>
  #folder-data {
    border-left: 1px solid;
    width: 50%;
    height: 100%;
    min-width: 350px;
  }

  #folder-data :global(.file-list) {
    height: calc(100% - 45px);
  }

  .col-6 {
    flex-grow: 1;
    position: relative;
    width: 51%;
    padding: 0 10px;
  }
  .nav-tabs {
    padding-top: 5px;
    margin: 0;
    max-width: initial;
    border-bottom: 1px solid white;
  }
</style>
