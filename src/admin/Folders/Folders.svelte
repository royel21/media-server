<script>
  import FolderList from "./FoldersList.svelte";
  import FolderData from "./FolderData.svelte";

  export let page;
  export let filter;
  export let folderId = "";
  export let dirid;
  let Path = "";

  const folderid = ({ detail }) => {
    folderId = detail?.Id || "";
    Path = detail?.Path;
  };
</script>

<div class="card bg-dark admin-manager has-files">
  <div class="rows has-files">
    <FolderList on:folderid={folderid} page={parseInt(page) || 1} {dirid} {folderId} {filter} />
    <FolderData {folderId} {Path} />
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
    min-width: 790px;
  }

  @media screen and (max-height: 600px) {
    .card.has-files {
      min-width: initial;
    }
  }

  @media screen and (max-width: 900px) {
    .card :global(#last-page),
    .card :global(#first-page) {
      display: none;
    }
    .card.has-files :global(#next-page) {
      border-top-right-radius: 0.25rem;
      border-bottom-right-radius: 0.25rem;
    }
    .card.has-files :global(#prev-page) {
      border-top-left-radius: 0.25rem;
      border-bottom-left-radius: 0.25rem;
    }
  }
</style>
