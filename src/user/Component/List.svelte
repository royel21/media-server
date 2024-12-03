<script>
  import { onMount, onDestroy, afterUpdate } from "svelte";
  import { clamp } from "src/ShareComponent/utils";
  import { fly } from "svelte/transition";
  import { formatTime } from "../Pages/pagesUtils";

  import Pagination from "src/ShareComponent/Pagination.svelte";
  import LazyImage from "./LazyImage.svelte";
  import Icons from "src/icons/Icons.svelte";
  import { scrollItem } from "./fileEvents";

  export let onFilter;
  export let folderName = "";
  export let fileId;
  export let files = [];
  export let hideList;

  let playList;
  let scrollable;
  let list = [];

  const pageData = {
    pg: 0,
    totalPages: 0,
    totalFiles: 0,
  };

  const filePerPage = 100;
  let start = pageData.pg * filePerPage;

  let filter = "";

  const goToPage = (pg) => {
    pageData.pg = clamp(pg.detail - 1, 0, pageData.totalPages - 1);
  };

  const getCover = (Type, Name) => {
    if (folderName) Name = `${folderName}/${Name}`;

    return encodeURI(`/${Type}/${Name}.jpg`);
  };

  const select = (item) => {
    playList.querySelector(".selected")?.classList.remove("selected");
    item?.classList.add("selected");
    scrollItem(item, "auto");
  };

  const selectItem = (dir, e) => {
    let item = playList.querySelector(".selected");
    if (item) {
      let found = dir ? item.nextElementSibling : item.previousElementSibling;
      if (found) {
        select(found);
      }
    }
    e.stopPropagation();
    e.preventDefault();
  };

  const changePage = (e, dir) => {
    pageData.pg = clamp(pageData.pg + dir, 0, pageData.totalPages - 1);
    e.stopPropagation();
    e.preventDefault();
  };

  const handlers = {
    37: (e) => changePage(e, -1),
    39: (e) => changePage(e, 1),
    38: (e) => selectItem(0, e),
    40: (e) => selectItem(1, e),
    13: (e) => {
      e.stopPropagation();
      hideList = true;
      playList.querySelector(".selected")?.click();
    },
  };

  const handleKey = (e) => {
    if (handlers[e.keyCode]) handlers[e.keyCode](e);
  };

  $: if (files.length) {
    pageData.totalFiles = files.length;
    //Calculate Page
    let index = files.findIndex((f) => f.Id === fileId);
    pageData.pg = Math.floor(Math.max(index, 0) / filePerPage);
    pageData.totalPages = Math.ceil(files.length / filePerPage);
  }

  afterUpdate(() => {
    setTimeout(() => {
      let current = document.getElementById(fileId) || playList.querySelector("li:first-child");
      select(current);
    }, 30);
  });

  onMount(() => {
    setTimeout(() => {
      playList.focus();
    }, 0);
  });

  onDestroy(() => {
    document.querySelector(".player-container, .scrollable")?.focus();
  });

  $: onFilter(filter);
  $: if (pageData.pg > -1) {
    start = pageData.pg * filePerPage;
    list = files.slice(start, start + filePerPage);
  }
</script>

<div
  id="play-list"
  bind:this={playList}
  on:keydown={handleKey}
  transition:fly={{ x: "0" }}
  tabindex="-1"
  on:click|stopPropagation|preventDefault={() => {}}
>
  <div id="v-filter">
    <input
      name="clear-filters"
      type="text"
      bind:value={filter}
      placeholder="Filter"
      class="form-control"
      on:keydown|stopPropagation
    />
    <span class="clear-filter" on:click={() => (filter = "")}>
      <Icons name="timescircle" color="black" />
    </span>
  </div>
  <div id="p-list" on:click bind:this={scrollable}>
    <ul>
      {#each list as { Id, Name, CurrentPos, Duration, Type }, i}
        <li id={Id} class={"usn " + (Id === fileId ? "active selected" : "")} on:click tabindex="-1">
          <span class="cover">
            <LazyImage cover={getCover(Type, Name)} />
            <span class="duration">
              {Type.includes("Manga") ? `${CurrentPos + 1}/${Duration}` : formatTime(Duration)}
            </span>
            <span class="f-index duration">#{(start + i + 1).toString().padStart(3, "0")}</span>
          </span>
          <span class="l-name">{Name}</span>
        </li>
      {/each}
    </ul>
  </div>
  {#if pageData.totalPages > 1}
    <div class="b-control" on:keydown|stopPropagation>
      <Pagination page={pageData.pg + 1} totalPages={pageData.totalPages} on:gotopage={goToPage} hideFL={true} />
    </div>
  {/if}
</div>

<style>
  #play-list {
    position: absolute;
    top: 0px;
    right: -0;
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
  #play-list li {
    position: relative;
  }

  #play-list #p-list li {
    display: flex;
    flex-direction: column;
    padding: 0px;
    border-bottom: 1px solid;
    cursor: pointer;
  }

  #play-list #p-list li:last-child {
    border-bottom: none;
  }

  #play-list #p-list li:hover {
    background-color: rgba(20, 101, 50, 0.336);
  }

  #play-list .cover {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    height: 240px;
    width: 100%;
    text-align: center;
  }

  #play-list .l-name {
    display: inline-block;
    padding: 0 4px;
    font-size: 14px;
    text-align: center;
    border-top: 1px solid;
  }

  #play-list .duration {
    position: absolute;
    display: inline-block;
    bottom: 0px;
    right: 0px;
    padding: 0 4px;
    background-color: rgba(0, 0, 0, 0.801);
    border-radius: 0.25rem;
    font-size: 14px;
    font-family: monospace;
  }

  #play-list :global(img) {
    max-height: 100%;
    min-width: 100%;
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

  #play-list .f-index {
    position: absolute;
    left: 2px;
    right: inherit;
  }

  #play-list .active {
    background-color: #007bffab;
  }
  #play-list .selected:not(.active) {
    background-color: #4469917b;
  }
  .b-control {
    text-align: center;
    position: absolute;
    bottom: 0px;
    width: 95%;
  }
  @media screen and (max-width: 600px) {
    #play-list.move {
      bottom: 31px;
    }
  }
</style>
