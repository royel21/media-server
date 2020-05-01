<script>
  import Pagination from "../../ShareComponent/Pagination.svelte";
  import Filter from "../../ShareComponent/Filter.svelte";
  import { FileTypes, ProcessFile } from "../Utils";
  import { fileClicks } from "../FileEvents";
  export let type;
  export let files;
  export let page;
  export let totalPages;
  export let totalFiles;
  export let filter;

  let active = false;
  const handleClick = event => {
    console.log(event.target);
    fileClicks(event.target, ProcessFile);
  };
  console.log("test");
</script>

<style>
  .files-list {
    display: flex;
    flex-wrap: wrap;
    height: calc(100% - 38px);
    overflow-y: auto;
    padding-bottom: 50px;
  }

  .controls {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 5px 4px 5px;
    z-index: 1;
  }
  .items {
    color: #fff;
    background-color: #007bff;
    padding: 0.25em 0.7em;
    font-size: 75%;
    font-weight: 700;
    line-height: 2;
    border-radius: 0.25rem;
  }
  .file {
    position: relative;
    outline: none;
    background-color: transparent;
    padding: 5px;
    width: 200px;
    min-width: 200px;
    height: 270px;
    transition: 0.2s all;
  }

  .file-info {
    text-align: center;
    width: 190px;
    height: 260px;
    min-height: 260px;
    padding: 5px;
    background-color: rgba(52, 58, 64, 0.99);
    border-radius: 5px;
    cursor: pointer;
    overflow: hidden;
  }

  .file-info:hover {
    position: absolute;
    height: fit-content;
    box-shadow: 0 0 10px;
    z-index: 1;
  }

  .file-btns {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.4em;
    height: 26px;
    z-index: 1;
    user-select: none;
    cursor: initial;
  }

  .file-progress {
    font-size: 14px;
    font-family: monospace;
    font-weight: 600;
    pointer-events: none;
    height: fit-content;
  }
  [data-type="Folder"] .file-progress {
    display: inline-block;
    padding: 2px 5px;
    border: 1px solid;
    border-radius: 0.25rem;
  }

  .file-btn-left:empty {
    display: none;
  }
  .file-btns i {
    cursor: pointer;
  }

  .file-del {
    color: brown;
  }

  .file-cover {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 183px;
    overflow: hidden;
  }
  .file-cover img {
    max-width: 190px;
    max-height: 180px;
    pointer-events: none;
    position: relative;
    user-select: none;
  }

  .file-cover:hover > img {
    max-width: none;
    max-height: none;
  }

  .file-cover img[alt]:after {
    position: absolute;
    top: -3px;
    left: -1px;
    background-color: rgba(52, 58, 64, 0.99);
    font-family: "Helvetica";
    font-weight: 300;
    content: attr(alt);
    border-radius: 5px;
    padding: 2px 5px;
    min-width: 100%;
  }

  .file-name {
    position: relative;
    text-align: center;
    user-select: text;
  }

  .file-name:hover,
  .file-info:hover .file-name {
    display: inline-block;
    z-index: 999;
    top: 5px;
    line-height: 1.5;
  }

  .file-btns i:active {
    transform: scale(1.3);
  }
  @media screen and (max-width: 420px) {
    .files-list {
      padding-bottom: 70px;
    }
    .file {
      width: 185px;
      min-width: 185px;
    }
    .file-info {
      width: 175px;
    }
  }
</style>

<div class="files-list" on:keydown>
  {#each files as { Id, Name, Type, Cover, CurrentPos, Duration, isFav, FileCount }}
    <div
      class="file"
      id={Id}
      data-type={Type}
      tabIndex="0"
      on:click={handleClick}>
      <div class="file-info">
        <div class="file-btns">
          <span class="file-btn-left">
            <i class={'fas fa-' + FileTypes[Type].class} />
          </span>
          <span class="file-progress">
            {#if Type.includes('Folder')}
              {FileCount}
            {:else}{FileTypes[Type].formatter(CurrentPos || 0, Duration)}{/if}
          </span>
          <span class="file-btn-left">
            {#if Type !== 'Folder'}
              {#if type === 'favorites'}
                <i class="fas fa-trash-alt text-danger" />
              {:else if isFav}
                <i class="fas fa-star text-warning" />
              {:else}
                <i class="far fa-star" />
              {/if}
            {/if}
          </span>
        </div>
        <div class="file-cover">
          <img src={Cover} alt="No Cover Found" />
        </div>
        <div class="file-name">{Name}</div>
      </div>
    </div>
  {/each}
</div>
<div class="controls">
  <Filter {filter} on:filter />
  <Pagination {page} {totalPages} on:gotopage />
  <span class="items">{totalFiles}</span>
</div>
