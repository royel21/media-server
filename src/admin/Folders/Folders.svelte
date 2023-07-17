<script>
  import FolderList from "./FoldersList.svelte";
  import FilesList from "./FilesList.svelte";

  export let page;
  export let filter;
  export let folderId;
  let shwFiles = true;

  const folderid = (event) => {
    folderId = event.detail;
  };

  const showFiles = () => {
    shwFiles = !shwFiles;
  };
</script>

<div class="card bg-dark admin-manager" class:has-files={shwFiles}>
  <div class="rows" class:has-files={shwFiles}>
    <FolderList on:folderid={folderid} page={parseInt(page) || 1} {folderId} {filter} {showFiles} />
    {#if shwFiles}<FilesList {folderId} /> {/if}
  </div>
</div>

<style>
  .rows {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 100%;
  }
  .card {
    padding: 0;
    height: 100%;
    width: 100%;
  }
  .card.has-files {
    min-width: 795px;
  }

  .card:not(.has-files) :global(#Folders) {
    min-width: 100%;
  }
  @media screen and (max-width: 600px) {
    .card,
    .rows {
      min-width: 100%;
    }
    .card.has-files {
      min-width: 184%;
    }

    .card.has-files :global(#Folders) {
      width: 55%;
    }
  }
</style>
