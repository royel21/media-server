<script>
  import { FileTypes, ProcessFile } from "../Utils";
  import { fileClicks } from "../FileEvents";
  export let type;
  export let files;
  let active = false;
  const handleClick = event => {
    console.log(event.target);
    fileClicks(event.target, ProcessFile);
  };
  console.log("test");
</script>

<style>
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
    max-width: initial;
    max-height: initial;
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
    .file {
      width: 185px;
      min-width: 185px;
    }
    .file-info {
      width: 175px;
    }
  }
</style>

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
