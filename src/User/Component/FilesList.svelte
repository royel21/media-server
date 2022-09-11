<script>
  import axios from "axios";
  import { afterUpdate, getContext } from "svelte";
  import { fade } from "svelte/transition";
  import { navigate } from "svelte-routing";

  import { PageConfig } from "../../User/Stores/PageConfigStore";

  import { genUrl, FileTypes, ProcessFile } from "./FilesUtils";
  import { fileKeypress, selectItem, getElIndex, fileClicks } from "./FileEvents";

  import Pagination from "../../ShareComponent/Pagination.svelte";
  import Filter from "../../ShareComponent/Filter.svelte";
  import FavoriteList from "./FavoriteList.svelte";

  export let id = "";
  export let page = 1;
  export let filter = "";
  export let type = "";
  export let title = "";
  export let setLastRead;
  export let setFolderInfo;

  const socket = getContext("socket");
  const baseData = { files: [], totalPages: 0, totalFiles: 0 };
  let pageData = baseData;
  let selected = 0;
  let favClicked = null;

  const cancelToken = axios.CancelToken;
  let cancel;

  const loadContent = async (pg = 1, flt = "", curId = "", config, nType) => {
    const { items, sort } = config[title];
    try {
      if (cancel) {
        cancel();
      }
      let url = genUrl(pg, { items, order: sort || "nu" }, flt, nType || type, curId);

      let { data } = await axios.get(url, {
        cancelToken: new cancelToken(function executor(c) {
          cancel = c;
        }),
      });

      if (typeof data === "object") {
        pageData = data;
        if (data.files[0] && setFolderInfo && setLastRead) {
          setFolderInfo(data.files[0].Folder);
          setLastRead(data.currentFile);
        }
        selected = pageData.files.findIndex((f) => f.Id === data.currentFile) || 0;
      }
    } catch (error) {
      console.log(error);
    }
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
    fileClicks(event);
    selected = getElIndex(target.closest(".file"));
    favClicked = target;
  };

  const removeFile = (event) => {
    pageData.files = pageData.files.filter((f) => f.Id !== event.detail);
    if (pageData.totalPages > 1) {
      if (pageData.files.length === 0) {
        page -= 1;
      }
      loadContent(page, filter || "", $PageConfig);
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
    }

    selectItem(sel);
  });

  $: document.title = `${title} Page ${page || ""}`;

  $: loadContent(page, filter, id, $PageConfig, type);

  $: if (pageData.totalPages && parseInt(page) > pageData.totalPages) {
    navigate(`/${type}/${page - 1}/${filter || ""}`);
  }
  let isContent = location.pathname.includes("content");
</script>

<div class="scroll-container" class:r-content={isContent}>
  <slot name="header" />
  <div class="files-list" on:keydown={handleKeydown} on:click={favClick}>
    {#each pageData.files as { Id, Name, Type, Cover, CurrentPos, Duration, isFav, FileCount, Status }, i}
      <div class="file" id={Id} data-type={Type} tabIndex="0" in:fade>
        <div class="file-info">
          <div class="file-btns">
            <span class="file-btn-left" on:click|stopPropagation={openFile}>
              <i class={"fas fa-" + FileTypes[Type].class} />
            </span>
            <span class="file-progress">
              {#if Type.includes("Folder")}
                {FileCount}
              {:else}
                {FileTypes[Type].formatter(CurrentPos, Duration)}
              {/if}
            </span>
            <FavoriteList {isFav} {type} {Type} {favClicked} favId={id} on:removeFile={removeFile} />
          </div>
          <div class="file-cover" on:dblclick|stopPropagation={openFile}>
            <img src={Cover} alt="No Cover Found" />
            {#if Type.includes("Folder")}
              <span class:completed={Status}>{Status ? "Completed" : "OnGoing"}</span>
            {/if}
          </div>
          <div class="file-name">{Name}</div>
        </div>
      </div>
    {/each}
  </div>
</div>
<div class="controls">
  <slot name="controls" />
  <Filter {filter} on:filter={fileFilter} />
  <Pagination page={parseInt(page || 1)} totalPages={pageData.totalPages} on:gotopage={goToPage} />
  <span class="items">{pageData.totalFiles}</span>
</div>

<style>
  .scroll-container.r-content {
    padding-top: 15px;
    padding-bottom: 40px;
  }
  .file-btn-left {
    cursor: pointer;
  }
  .file-btn-left i {
    pointer-events: none;
  }
  .scroll-container::-webkit-scrollbar-thumb {
    border-radius: 0.4rem;
  }
  .file-cover {
    position: relative;
  }
  .file-cover span {
    display: inline-block;
    width: max-content;
    position: absolute;
    left: 32px;
    bottom: 7px;
    z-index: 99;
    font-size: 11px;
    font-weight: 600;
    padding: 0 5px;
    border-radius: 1.25rem;
    background-color: darkgreen;
  }
  .file-cover .completed {
    background-color: red;
  }
  .file-cover:hover span {
    left: 2px;
    bottom: 2px;
  }
</style>
