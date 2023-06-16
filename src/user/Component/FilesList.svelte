<script>
  import { afterUpdate, getContext, onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { navigate } from "svelte-routing";

  import { PageConfig } from "../../user/Stores/PageConfigStore";

  import { FileTypes, ProcessFile, getFilesPerPage } from "./filesUtils";
  import { fileKeypress, selectElementById, selectByTitle } from "./fileEvents";

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
  export let useSlot = false;
  export let onOpen;

  let ver = 1;
  let folder;

  const socket = getContext("socket");
  const user = getContext("User");
  const baseData = { files: [], totalPages: 0, totalFiles: 0 };
  let pageData = baseData;
  let favClicked = null;

  const loadContent = async (pg = 1, flt = "", config) => {
    const { items, sort } = config[title];
    const itemsPerPage = items || getFilesPerPage(3);
    const apiPath = title === "Content" ? `folder-content/${id}` : type;
    let url = `/api/files/${apiPath}/${sort}/${pg}/${itemsPerPage}/${flt.replace("%", "")}`;

    const data = await getItemsList(url);

    if (data.valid) {
      pageData = data;

      if (data.files[0] && setFolderInfo && setLastRead) {
        setFolderInfo(data.folder);
        folder = data.folder.Name;
        setLastRead(data.folder.currentFile);
      }
    } else {
      console.log(data.error);
    }
  };

  const goToPage = async ({ detail }, sel) => {
    let pg = +detail;
    let { totalPages } = pageData;
    pg = clamp(pg, 1, totalPages);
    navigate(`/${type}/${pg}/${filter || ""}`);
  };

  const fileFilter = ({ detail }) => {
    navigate(`/${type}/${1}/${detail || ""}`);
  };

  const handleKeydown = (event) => fileKeypress(event, page, goToPage, title);

  const openFile = ({ target }) => {
    const el = target.closest(".file");
    localStorage.setItem(title, el.id);
    ProcessFile(el);
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
      loadContent(page, filter || "", $PageConfig);
    } else {
      pageData = pageData;
    }
  };

  afterUpdate(() => selectByTitle(title));

  const reloadDir = (data) => {
    if (data.Id === id && user.Id === data.user) {
      loadContent(page, filter, $PageConfig).then(() => ver++);
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

  $: type && loadContent(page, filter, $PageConfig);

  let isContent = location.pathname.includes("content");
</script>

<div class="scroll-container" class:r-content={isContent}>
  <slot name="header" />
  <div class="files-list" on:keydown={handleKeydown} on:click={favClick}>
    {#each pageData.files as { Id, Name, Type, CurrentPos, Duration, isFav, FileCount, Status }}
      <div class="file" id={Id} data-type={Type} tabIndex="0" in:fade>
        <div class="file-info">
          <div class="file-btns usn">
            <span class="file-btn-left" on:click|stopPropagation={onOpen || openFile}>
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
              {#if useSlot}
                <slot name="file-action" file={{ Id, Name, Type }} />
              {:else}
                <FavoriteList {isFav} {type} {favClicked} favId={id} on:removeFile={removeFile} />
              {/if}
            {/if}
          </div>
          <div class="file-cover usn" on:dblclick|stopPropagation={onOpen || openFile}>
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
