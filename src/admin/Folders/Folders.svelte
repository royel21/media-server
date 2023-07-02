<script>
  import FolderList from "./FoldersList.svelte";
  import FilesList from "./FilesList.svelte";

  export let page;
  export let filter;
  export let folderId;
  const folderid = (event) => {
    folderId = event.detail;
  };
</script>

<div class="card bg-dark admin-manager">
  <div class="rows">
    <FolderList on:folderid={folderid} page={parseInt(page) || 1} {folderId} {filter} />
    <FilesList {folderId} />
  </div>
</div>

<style>
  .rows {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 100%;
    min-width: 630px;
  }
  .card {
    padding: 0;
    height: 100%;
    min-width: 795px;
  }
  .rows {
    min-width: 795px;
  }
</style>
