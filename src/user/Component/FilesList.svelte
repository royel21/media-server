<script>
  import { afterUpdate, getContext, onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { navigate } from "svelte-routing";

  import { ConfigStore } from "src/user/Stores/PageConfigStore";

  import { FileTypes, ProcessFile, getFilesPerPage } from "../Pages/filesUtils";
  import { fileKeypress, selectElementById, selectByTitle } from "./fileEvents";

  import Pagination from "src/ShareComponent/Pagination.svelte";
  import Filter from "src/ShareComponent/Filter.svelte";
  import FavoriteList from "./FavoriteList.svelte";
  import { clamp } from "src/ShareComponent/utils";
  import { getItemsList } from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import LazyImage from "./LazyImage.svelte";
  import { getLastChap } from "./fileUtils";

  export let id = "";
  export let page = 1;
  export let filter = "";
  export let type = "";
  export let title = "";
  export let handleClick;
  export let useSlot = false;
  export let onOpen;
  export let setFolderInfo;

  const dateFormat = { year: "numeric", month: "short", day: "numeric" };

  let ver = 1;
  let folder;
  let lastId = id;

  const socket = getContext("socket");
  const user = getContext("User");
  const baseData = { files: [], totalPages: 0, totalFiles: 0 };
  let pageData = baseData;
  let favClicked = null;

  const loadContent = async (pg = 1, flt = "") => {
    const { items, sort } = $ConfigStore[title];
    const itemsPerPage = items || getFilesPerPage(3);
    const apiPath = title === "Content" ? `folder-content/${id}` : type;

    let url = `/api/files/${apiPath}/${sort}/${pg}/${itemsPerPage}/${flt || ""}`;

    const data = await getItemsList(url);

    if (data.valid) {
      pageData = data;

      if (data.folder) {
        folder = data.folder.Name;
        setFolderInfo(data.folder);
      }

      if (pg && data.page && +data.page !== +pg) {
        navigate(`/${type}/${data.page}/${filter || ""}`);
      }
    } else {
      console.log(data.error);
    }
  };

  const goToPage = async ({ detail }) => {
    let pg = +detail;
    let { totalPages } = pageData;
    pg = clamp(pg, 1, totalPages);
    navigate(`/${type}/${pg}/${filter || ""}`);
    loadContent(pg, filter);
  };

  const fileFilter = ({ detail }) => {
    console.log("filter", detail);
    navigate(`/${type}/${1}/${detail || ""}`);
    loadContent(1, detail);
  };

  const handleKeydown = (event) => fileKeypress(event, page, goToPage, title);

  const openFile = ({ target }) => {
    const el = target.closest(".file");
    ProcessFile(el, "", title);
  };

  const favClick = (event) => {
    if (handleClick) handleClick(event);
    let { target } = event;
    if (target.closest(".fav-icon")) {
      favClicked = target;
    } else {
      favClicked = false;
    }

    const file = target.closest(".file");
    if (file) {
      selectElementById(file.id, title);
    }
  };

  const removeFile = ({ detail }) => {
    pageData.files = pageData.files.filter((f) => f.Id !== detail);
    if (!pageData.files.length) {
      page -= 1;
      loadContent(page, filter || "");
    } else {
      pageData = pageData;
    }
  };

  afterUpdate(() => selectByTitle(title));

  const reloadDir = (data) => {
    if (data.Id === id && user.Id === data.user) {
      loadContent(page, filter).then(() => ver++);
    }
  };

  const getCover = (Type, Name, FilesType) => {
    if (FilesType) {
      return encodeURI(`/Folder/${FilesType}/${Name}.jpg`);
    }

    return encodeURI(`/${Type}/${folder}/${Name}.jpg`);
  };

  onMount(() => {
    ConfigStore.subscribe((value) => {
      loadContent(page, filter, value);
    });
    socket.on("reload", reloadDir);
    return () => {
      socket.off("reload", reloadDir);
    };
  });

  $: document.title = `${title} Page ${page || ""}`;

  $: if (lastId !== id) {
    lastId = id;
    loadContent();
  }

  let isContent = location.pathname.includes("content");
</script>

<div class="scroll-container" class:r-content={isContent}>
  <slot name="header" />
  <div class="files-list" on:keydown={handleKeydown} on:click={favClick}>
    {#each pageData.files as { Id, Name, Type, CurrentPos, Duration, isFav, FilesType, FileCount, LastChapter, Status, CreatedAt, Size, isRaw }}
      <div class="file" id={Id} data-type={Type} tabIndex="0" in:fade>
        <div class="file-info">
          <div class="file-btns usn">
            <span class="file-btn-left" on:click|stopPropagation={onOpen || openFile} on:keydown>
              <Icons name={FileTypes[Type].class} height="22px" color={FileTypes[Type].color} />
            </span>
            <span class="file-progress">
              {#if Type.includes("Folder")}
                {getLastChap(LastChapter, FilesType, FileCount)}
              {:else}
                {FileTypes[Type].formatter(CurrentPos, Duration)}
              {/if}
            </span>
            {#if Type === "Folder"}
              {#if useSlot}
                <slot name="file-action" file={{ Id, Name, Type }} />
              {:else}
                <FavoriteList {isFav} {type} {favClicked} favId={id} on:removeFile={removeFile} />
              {/if}
            {/if}
          </div>
          <div class="file-cover usn" on:dblclick|stopPropagation={onOpen || openFile}>
            <LazyImage cover={getCover(Type, Name, FilesType) + `?v=${ver}`} />
            {#if Type.includes("Folder")}
              <span class="f-status" class:completed={Status}>{Status ? "Completed" : "OnGoing"}</span>
              <span class="f-raw" class:hidden={!isRaw}>Raw</span>
            {:else}
              <span class="file-date">
                <span>{(Size / 1025 / 1024).toFixed(2)}mb</span>
                <span>{new Date(CreatedAt)?.toLocaleDateString("en-us", dateFormat)}</span>
              </span>
            {/if}
          </div>
          <div class="file-name" title={Type !== "Folder" ? Name : ""}>{Name}</div>
        </div>
      </div>
    {/each}
  </div>
</div>
<div class="controls">
  <slot name="controls" />
  <Filter {filter} on:filter={fileFilter} maxWidth="250px" />
  <Pagination page={parseInt(page || 1)} totalPages={pageData.totalPages} on:gotopage={goToPage} />
  <span class="items">{pageData.totalFiles}</span>
</div>

<style>
  .scroll-container.r-content {
    height: calc(100% - 96px);
    min-height: calc(100% - 90px);
    padding-bottom: 90px;
  }
  .file-btn-left {
    cursor: pointer;
  }

  .scroll-container::-webkit-scrollbar-thumb {
    border-radius: 0.4rem;
  }
  .file-cover {
    position: relative;
  }
  .file-cover > span {
    display: flex;
    justify-content: space-between;
    width: 100%;
    position: absolute;
    bottom: 0px;
    z-index: 1;
    font-size: 1rem;
    font-weight: 600;
    padding: 0 4px;
    background-color: #303030ba;
  }
  .file-cover .f-status {
    display: inline-block;
    width: auto;
    left: 0;
    border-top-right-radius: 0.25rem;
    background-color: #05a100;
  }
  .file-cover .completed {
    background-color: red;
  }
  .file-cover .f-raw {
    display: inline-block;
    position: absolute;
    width: inherit;
    right: 0;
    left: initial;
    bottom: 0px;
    background-color: red;
    border-top-left-radius: 20%;
  }

  .file-cover .f-raw.hidden {
    display: none;
  }
</style>
