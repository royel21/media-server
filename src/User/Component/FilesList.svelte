<script>
  import { tick, afterUpdate, getContext } from "svelte";
  import { fade } from "svelte/transition";
  import { navigate } from "svelte-routing";
  import axios from "axios";

  import { genUrl, getFilesPerPage, FileTypes, ProcessFile } from "./Utils";
  import {
    fileKeypress,
    selectItem,
    getElIndex,
    fileClicks,
  } from "./FileEvents";

  import Pagination from "../../ShareComponent/Pagination.svelte";
  import Filter from "../../ShareComponent/Filter.svelte";
  import FavoriteList from "../Component/FavoriteList.svelte";

  export let id = "";
  export let page = 1;
  export let filter = "";
  export let type = "";
  export let title = "";
  const socket = getContext("socket");
  let pageData = { files: [], totalPages: 0, totalFiles: 0 };
  let selected = 0;
  let favClicked = null;
  let Mount = false;

  const cancelToken = axios.CancelToken;
  let cancel;

  const loadContent = async (pg = 1, flt = "", curId = "") => {
    try {
      if (cancel) {
        cancel();
      }
      let url = genUrl(pg, { order: "dd", items: 0 }, flt, type, curId);
      let { data } = await axios.get(url, {
        cancelToken: new cancelToken(function executor(c) {
          cancel = c;
        }),
      });
      pageData = data;
    } catch (error) {}
  };

  const goToPage = async (pg, sel) => {
    pg = parseInt(pg.detail);
    let { totalPages } = pageData;
    if (pg < 1 || pg > totalPages || isNaN(pg)) return;
    pg = pg < 1 ? 1 : pg > totalPages ? totalPages : pg;
    navigate(`/${type}/${pg}/${filter || ""}`);
    selected = sel || 0;
  };
  const fileFilter = (event) => {
    filter = event.detail;
    navigate(`/${type}/${1}/${filter || ""}`);
  };

  const handleKeydown = (event) => {
    fileKeypress(event, page, goToPage, ProcessFile, selected);
  };

  const openFile = (event) => {
    ProcessFile(event.target.closest(".file"), socket);
  };

  const favClick = (event) => {
    let { target } = event;
    if (target.tagName !== "I") {
      fileClicks(event);
      selected = getElIndex(target.closest(".file"));
    }
    favClicked = target;
  };

  const removeFile = (event) => {
    pageData.files = pageData.files.filter((f) => f.Id !== event.detail);
    if (pageData.totalPages > 1) {
      if (pageData.files.length === 0) {
        page -= 1;
      }
      loadContent(page, filter || "");
    } else {
      pageData = pageData;
    }
  };

  afterUpdate(() => {
    let sel = selected;
    let id = localStorage.getItem("fileId");
    let el = document.getElementById(id);
    if (id && el) {
      sel = getElIndex(el);
      localStorage.removeItem("fileId");
    }

    selectItem(sel);
  });

  $: document.title = `${title} Page ${page}`;
  $: loadContent(page, filter, id);
  $: if (pageData.totalPages && parseInt(page) > pageData.totalPages) {
    navigate(`/${type}/${page - 1}/${filter || ""}`);
  }
</script>

<style>
  .scroll-container {
    position: relative;
    height: 100%;
    min-height: 100%;
    overflow-y: auto;
    padding-top: 39px;
  }

  .files-list {
    display: flex;
    align-content: flex-start;
    flex-wrap: wrap;
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
    pointer-events: none;
  }

  .file-btn-left {
    cursor: pointer;
  }
  .file-btn-left i {
    pointer-events: none;
  }
  @media screen and (max-width: 420px) {
    .files-list {
      padding-bottom: 70px;
    }
    .scroll-container {
      padding-top: 71px;
    }
  }
</style>

<div class="scroll-container">
  <div class="files-list" on:keydown={handleKeydown} on:click={favClick}>
    {#each pageData.files as { Id, Name, Type, Cover, CurrentPos, Duration, isFav, FileCount }, i}
      <div class="file" id={Id} data-type={Type} tabIndex="0" in:fade>
        <div class="file-info">
          <div class="file-btns">
            <span class="file-btn-left" on:click|stopPropagation={openFile}>
              <i class={'fas fa-' + FileTypes[Type].class} />
            </span>
            <span class="file-progress">
              {#if Type.includes('Folder')}
                {FileCount}
              {:else}{FileTypes[Type].formatter(CurrentPos, Duration)}{/if}
            </span>
            <FavoriteList
              {isFav}
              {type}
              {Type}
              {favClicked}
              favId={id}
              on:removeFile={removeFile} />
          </div>
          <div class="file-cover" on:dblclick|stopPropagation={openFile}>
            <img src={Cover} alt="No Cover Found" />
          </div>
          <div class="file-name">{Name}</div>
        </div>
      </div>
    {/each}
  </div>
</div>
<div class="controls">
  <slot />
  <Filter {filter} on:filter={fileFilter} />
  <Pagination
    page={parseInt(page || 1)}
    totalPages={pageData.totalPages}
    on:gotopage={goToPage} />
  <span class="items">{pageData.totalFiles}</span>
</div>
