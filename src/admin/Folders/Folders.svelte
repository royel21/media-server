<script>
  import FolderList from "./FoldersList.svelte";
  import FolderData from "./FolderData.svelte";

  export let page;
  export let filter;
  export let folderId = "";
  export let dirid;

  const folderid = ({ detail }) => {
    folderId = detail?.Id || "";
  };
</script>

<div class="card bg-dark admin-manager has-files">
  <div class="rows has-files">
    <FolderList on:folderid={folderid} page={parseInt(page) || 1} {dirid} {folderId} {filter} />
    <FolderData {folderId} />
  </div>
</div>

<style>
  :global(.content) {
    overflow: hidden;
  }
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

  @media screen and (max-width: 700px) {
    .card,
    .card.has-files {
      width: initial;
      min-width: 170%;
    }
    .card :global(.file-list:first-child) {
      min-width: 59%;
    }
  }
</style>
