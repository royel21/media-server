<script>
  import { afterUpdate, getContext, onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { navigate } from "svelte-routing";

  import { PageConfig } from "../../user/Stores/PageConfigStore";

  import { genUrl, FileTypes, ProcessFile } from "./FilesUtils";
  import { fileKeypress, selectItem, getElIndex } from "./FileEvents";

  import Pagination from "../../ShareComponent/Pagination.svelte";
  import Filter from "../../ShareComponent/Filter.svelte";
  import FavoriteList from "./FavoriteList.svelte";
  import { clamp } from "../../ShareComponent/utils";
  import { getItemsList } from "../../apiUtils";

  export let id = "";
  export let page = 1;
  export let filter = "";
  export let type = "";
  export let title = "";
  export let setLastRead;
  export let setFolderInfo;
  export let handleClick;
  let ver = 1;
  let folder;

  let selected = +localStorage.getItem(title) || 0;

  const socket = getContext("socket");
  const user = getContext("User");
  const baseData = { files: [], totalPages: 0, totalFiles: 0 };
  let pageData = baseData;
  let favClicked = null;

  const loadContent = async (pg = 1, flt = "", curId = "", config, nType) => {
    const { items, sort } = config[title];
    let url = genUrl(pg, { items, order: sort || "nu" }, flt, nType || type, curId);

    const data = await getItemsList(url);

    if (data.valid) {
      pageData = data;

      if (data.files[0] && setFolderInfo && setLastRead) {
        setFolderInfo(data.folder);
        folder = data.folder.Name;
        setLastRead(data.folder.currentFile);
      }
      selected = pageData.files.findIndex((f) => f.Id === data.currentFile) || 0;
    } else {
      console.log(data.error);
    }
  };

  const goToPage = async ({ detail }, sel) => {
    let pg = +detail;
    let { totalPages } = pageData;
    pg = clamp(pg, 1, totalPages);
    navigate(`/${type}/${pg}/${filter || ""}`);
    selected = sel;
  };

  const fileFilter = ({ detail }) => {
    navigate(`/${type}/${1}/${detail || ""}`);
  };

  const handleKeydown = (event) => fileKeypress(event, page, goToPage, title);

  const openFile = ({ target }) => {
    const el = target.closest(".file");
    localStorage.setItem(title, el.id);
    ProcessFile(target.closest(".file"), socket);
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
      localStorage.setItem(title, file.id);
      selected = getElIndex(file);
      selectItem(selected);
    }
  };

  const removeFile = ({ detail }) => {
    pageData.files = pageData.files.filter((f) => f.Id !== detail);
    if (!pageData.files.length) {
      page -= 1;
      loadContent(page, filter || "", $PageConfig);
    } else {
      pageData = pageData;
    }
  };

  afterUpdate(() => {
    let sel = 0;
    let id = localStorage.getItem(title);
    let el = document.getElementById(id);
    if (el) {
      sel = getElIndex(el);
    }
    selectItem(sel);
  });

  const reloadDir = (data) => {
    if (data.Id === id && user.Id === data.user) {
      loadContent(page, filter, id, $PageConfig, type).then(() => ver++);
    }
  };

  const getCover = (Type, Name) => {
    if (folder) Name = `${folder}/${Name}`;

    return encodeURI(`/${Type}/${Name}.jpg`);
  };

  onMount(() => {
    socket.on("reload", reloadDir);
    return () => {
      socket.off("reload", reloadDir);
    };
  });

  $: document.title = `${title} Page ${page || ""}`;

  $: loadContent(page, filter, id, $PageConfig, type);

  let isContent = location.pathname.includes("content");
</script>

<div class="scroll-container" class:r-content={isContent}>
  <slot name="header" />
  <div class="files-list" on:keydown={handleKeydown} on:click={favClick}>
    {#each pageData.files as { Id, Name, Type, CurrentPos, Duration, isFav, FileCount, Status }, i}
      <div class="file" id={Id} data-type={Type} tabIndex="0" in:fade>
        <div class="file-info">
          <div class="file-btns usn">
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
            {#if Type === "Folder"}
              <FavoriteList {isFav} {type} {favClicked} favId={id} on:removeFile={removeFile} />
            {/if}
          </div>
          <div class="file-cover usn" on:dblclick|stopPropagation={openFile}>
            <img src={getCover(Type, Name) + `?v=${ver}`} alt="No Cover Found" />
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
  <Filter {filter} on:filter={fileFilter} maxWidth="250px" />
  <Pagination page={parseInt(page || 1)} totalPages={pageData.totalPages} on:gotopage={goToPage} />
  <span class="items">{pageData.totalFiles}</span>
</div>

<style>
  .scroll-container.r-content {
    padding-top: 15px;
    padding-bottom: 0px;
    height: calc(100% - 44px);
    min-height: calc(100% - 44px);
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
    z-index: 1;
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
