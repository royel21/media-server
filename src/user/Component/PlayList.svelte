<script>
  import { clamp } from "../../ShareComponent/utils";
  import { afterUpdate } from "svelte";

  import Pagination from "../../ShareComponent/Pagination.svelte";
  import { ToggleMenu } from "../../ShareComponent/ToggleMenu";
  import { formatTime } from "../Pages/pagesUtils";
  import Icons from "../../icons/Icons.svelte";
  import LazyImage from "./LazyImage.svelte";

  export let files = [];
  export let fileId;
  export let onFilter;

  let filter = "";

  let list = [];
  const pageData = {
    pg: 0,
    totalPages: 0,
    totalFiles: 0,
  };
  const filePerPage = 100;

  let playList;
  let hideList = true;

  const goToPage = (pg) => {
    pageData.pg = clamp(pg.detail - 1, 0, pageData.totalPages - 1);
  };

  $: onFilter(filter);

  $: if (files.length) {
    pageData.totalFiles = files.length;
    //Calculate Page
    let index = files.findIndex((f) => f.Id === fileId);
    pageData.pg = Math.floor(Math.max(index, 0) / filePerPage);
    pageData.totalPages = Math.ceil(files.length / filePerPage);
  }

  afterUpdate(() => {
    const start = pageData.pg * filePerPage;
    list = files.slice(start, start + filePerPage);

    let current = document.getElementById(fileId);
    playList.scroll({ top: Math.max(current?.offsetTop - 250, 0) });
  });
</script>

<label class={"show-list" + (!hideList ? " move" : "")} for="p-hide" style="bottom: 35px" title="play-list">
  <span class="p-sort">
    <Icons name="list" width="30px" height="24px" />
  </span>
</label>
<div id="p-bg" class:hidelist={!hideList} on:click|stopPropagation={(e) => (hideList = true)} tabindex="-1" />
<input name="show-hide-play-list" type="checkbox" id="p-hide" bind:checked={hideList} />
<div id="play-list" class:move={!$ToggleMenu}>
  <div id="v-filter">
    <input name="clear-filters" type="text" bind:value={filter} placeholder="Filter" class="form-control" />
    <span class="clear-filter" on:click={() => (filter = "")}>
      <Icons name="timescircle" />
    </span>
  </div>
  <div id="p-list" bind:this={playList}>
    <ul>
      {#each list as { Id, Name, Cover, CurrentPos, Duration, Type }}
        <li id={Id} class={"usn " + (Id === fileId ? "active" : "")} on:click>
          <span class="cover">
            <LazyImage cover={Cover} />
            <span class="duration">
              {Type.includes("Manga") ? `${CurrentPos + 1}/${Duration}` : formatTime(Duration)}
            </span>
          </span>
          <span class="l-name">{Name}</span>
        </li>
      {/each}
    </ul>
  </div>
  {#if pageData.totalPages > 1}
    <div class="b-control">
      <Pagination page={pageData.pg + 1} totalPages={pageData.totalPages} on:gotopage={goToPage} hideFL={true} />
    </div>
  {/if}
</div>

<style>
  #p-bg.hidelist {
    display: block;
  }

  #p-bg {
    display: none;
    position: absolute;
    top: 0;
    right: 220px;
    bottom: 34px;
    width: 100%;
    z-index: 10;
  }

  label {
    margin: 0;
  }
  .show-list {
    position: fixed;
    right: 5px;
    bottom: 40px;
    transition: 0.3s all;
    z-index: 11;
    background-color: black;
    padding: 3px 0px 3px 6px;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  .move {
    right: 230px;
  }
  input[type="checkbox"] {
    display: none;
  }

  #play-list {
    position: absolute;
    top: 0px;
    right: 0;
    bottom: 0;
    width: 220px;
    background-color: black;
    border-left: 2px solid;
    transition: 0.3s all;
    z-index: 11;
    overflow: hidden;
  }
  #p-list {
    overflow-y: auto;
    height: calc(100% - 31px);
    overflow-x: hidden;
    padding-bottom: 35px;
  }

  #p-hide:checked + #play-list {
    width: 0;
    border: none;
  }

  #p-hide:checked + #play-list .p-controls .form-control {
    display: none;
  }

  #play-list .p-controls .p-sort {
    margin: 0;
    width: 32px;
    font-size: 30px;
    padding: 0 8px;
    flex-grow: 0;
  }

  #play-list .p-controls .form-control {
    display: inline-block;
    height: 30px;
    margin: 0 4px;
  }

  #play-list ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  #play-list #p-list li {
    display: flex;
    flex-direction: column;
    padding: 4px;
    border-bottom: 1px solid;
    height: 225px;
    cursor: pointer;
  }

  #play-list #p-list li:last-child {
    border-bottom: none;
  }

  #play-list #p-list li:hover {
    background-color: rgba(20, 101, 50, 0.5);
  }

  .active {
    background-color: darkslategrey;
  }

  #play-list .cover {
    position: relative;
    pointer-events: none;
    width: 100%;
    text-align: center;
  }

  #play-list .l-name {
    display: inline-block;
    padding-left: 5px;
    font-size: 14px;
    text-align: center;
  }

  #play-list .duration {
    position: absolute;
    display: inline-block;
    right: 0px;
    bottom: 8px;
    padding: 0 4px;
    background-color: black;
    border-radius: 0.25rem;
    font-size: 13px;
  }

  #play-list :global(img) {
    max-height: 185px;
  }

  #play-list #p-list::-webkit-scrollbar {
    width: 10px;
  }

  #play-list #v-filter {
    flex-grow: 1;
  }
  #play-list #v-filter .form-control {
    border-radius: 0;
    padding: 0.2rem 0.5rem;
  }
  #play-list .clear-filter {
    right: 6px;
    top: 0px;
  }

  #p-items {
    display: inline-block;
    padding: 0 8px;
  }
  li * {
    pointer-events: none;
  }
  li > span:last-child {
    display: inline-block;
    height: max-content;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.625;
  }
  .b-control {
    text-align: center;
    position: absolute;
    bottom: 0px;
    width: 100%;
  }
  @media screen and (max-width: 600px) {
    #p-list::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }

    #play-list.move {
      bottom: 31px;
    }
  }
</style>
