<script>
  import FolderList from "./FoldersList.svelte";
  import FilesList from "./FilesList.svelte";

  let fId = "";
  const folderid = (event) => {
    fId = event.detail;
  };
</script>

<style>
  .rows {
    display: flex;
    flex-direction: row;
    height: 100%;
    min-width: 630px;
  }
  .card {
    padding: 0;
    height: 100%;
  }
  @media screen and (max-width: 630px) {
    .admin-manager {
      overflow-x: auto;
    }
  }
</style>

<div class="card bg-dark admin-manager ">
  <div class="rows">
    <FolderList on:folderid={folderid} />
    <FilesList {fId} />
  </div>
</div>
