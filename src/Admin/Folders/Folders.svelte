<script>
  import FolderList from "./FoldersList.svelte";
  import FilesList from "./FilesList.svelte";

  let fId = "";
  const folderid = event => {
    fId = event.detail;
  };
</script>

<style>
  .rows {
    display: flex;
    flex-direction: row;
    height: 100%;
  }
  .card {
    padding: 0;
    height: 100%;
    min-width: 565px;
  }
</style>

<div id="fd-manager" class="card bg-dark manager">
  <div class="rows">
    <FolderList on:folderid={folderid} />
    <FilesList {fId} />
  </div>
</div>
