<script>
  import { afterUpdate, getContext, onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { navigate } from "svelte-routing";

  import { FileTypes, ProcessFile, getFilesPerPage, getFilesPerRows } from "../Pages/filesUtils";
  import { fileKeypress, selectElementById, selectByTitle } from "./fileEvents";

  import Pagination from "src/ShareComponent/Pagination.svelte";
  import Filter from "src/ShareComponent/Filter.svelte";
  import FavoriteList from "./FavoriteList.svelte";
  import { clamp } from "@share/utils";
  import { getItemsList } from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import LazyImage from "./LazyImage.svelte";
  import { getDate, getLastChap } from "./fileUtils";
  import UserStore from "../Stores/UserStore";
  import { formatSize, isMobile } from "src/utils";
  import { isValidKey } from "@share/utils";

  export let id = "";
  export let page = 1;
  export let filter = "";
  export let type = "";
  export let title = "";
  export let handleClick = null;
  export let onOpen = null;
  export let setFolderInfo = null;

  const { sortTabs } = getContext("User");
  let config = sortTabs.find((st) => st.Name === title);

  let ver = 1;
  let folder;

  const socket = getContext("socket");
  const user = getContext("User");
  const baseData = { files: [], totalPages: 0, totalFiles: 0 };
  const hotkeys = getContext("User").hotkeys;
  const KeyExit = hotkeys.find((key) => key.Name === "Exit");

  let pageData = baseData;

  const loadContent = async (folderId, pg = 1, flt) => {
    if (location.pathname.includes("viewer")) return;
    const { Items, SortBy } = config;
    const tempIem = Items || getFilesPerPage(3);
    const itemsPerRows = getFilesPerRows();
    const itemsPerPage = itemsPerRows * Math.floor(tempIem / itemsPerRows);
    const apiPath = title === "Content" ? `folder-content/${folderId}` : type;
    const search = encodeURIComponent(flt || "");
    let url = `/api/files/${apiPath}/${SortBy}/${pg}/${itemsPerPage}/${search}`;

    const data = await getItemsList(url);

    if (data.valid) {
      pageData = data;

      if (data.folder) {
        folder = data.folder.Name;
        setFolderInfo(data.folder);
      }

      if (pg && data.page && +data.page !== +pg) {
        navigate(`/${type}/${data.page}/${search}`);
      }
    }
  };

  const goToPage = async ({ detail }) => {
    let pg = +detail;
    let { totalPages } = pageData;
    pg = clamp(pg, 1, totalPages);
    const search = encodeURIComponent(filter || "");
    navigate(`/${type}/${pg}/${search}`);
  };

  const fileFilter = ({ detail }) => navigate(`/${type}/${1}/${detail || ""}`);

  const handlerKey = (e) => {
    if (isValidKey(e, KeyExit)) {
      navigate(`/${type}/${1}/`);
    }
  };

  const handleKeydown = (e) => fileKeypress(e, page, goToPage, title, "");

  const openFile = (e) => {
    if (onOpen) onOpen(e);

    const el = e.target.closest(".file");
    ProcessFile(el, "", title);
  };

  const favClick = (event) => {
    if (handleClick) handleClick(event);
    let { target } = event;

    const file = target.closest(".file");
    if (file) {
      selectElementById(file.id, title);
    }
  };

  const removeFile = ({ detail }) => {
    pageData.files = pageData.files.filter((f) => f.Id !== detail);
    if (!pageData.files.length) {
      page -= 1;
      loadContent(id, page, filter);
    } else {
      pageData = pageData;
    }
  };

  afterUpdate(() => selectByTitle(title));

  const reloadDir = (data) => {
    if (data.Id === id && user.Id === data.user) {
      loadContent(id, page, filter).then(() => ver++);
    }
  };

  const getCover = (Type, Name, FilesType) => {
    if (FilesType) {
      return encodeURI(`/Folder/${FilesType}/${Name}.jpg`);
    }

    return encodeURI(`/${Type}/${folder}/${Name}.jpg`);
  };

  let timeOut;
  const onResize = () => {
    if (!isMobile()) {
      clearTimeout(timeOut);
      timeOut = setTimeout(async () => {
        await loadContent(id, page, filter || "");
      }, 300);
    }
  };

  const hideFavList = (e) => {
    if (e.target.classList.contains("fav-star")) return;

    document.querySelectorAll(".fav-list").forEach((el) => {
      el.style.display = "none";
    });
  };

  onMount(() => {
    socket.on("reload", reloadDir);
    window.addEventListener("resize", onResize);
    document.body.addEventListener("click", hideFavList);
    return () => {
      document.body.removeEventListener("click", hideFavList);
      window.removeEventListener("resize", onResize);
      socket.off("reload", reloadDir);
    };
  });

  $: document.title = `${title} Page ${page || ""}`;

  $: {
    config = $UserStore.sortTabs.find((st) => st.Name === title);
    loadContent(id, page, filter || "");
  }
  let isContent = location.pathname.includes("content");
</script>

<div class="scroll-container" class:r-content={isContent} on:keydown={handlerKey} tabindex="0">
  <slot name="header" />
  <div class="files-list" on:keydown={handleKeydown} on:click={favClick} tabindex="0">
    {#each pageData.files as { Id, Name, Type, CurrentPos, Duration, isFav, FilesType, FileCount, LastChapter, Status, CreatedAt, Size, isRaw, EmissionDate }}
      <div class="file" id={Id} data-type={Type} in:fade>
        <div class="file-info">
          <div class="file-cover usn" on:dblclick|stopPropagation={openFile}>
            <LazyImage cover={getCover(Type, Name, FilesType) + `?v=${ver}`} />
            {#if Type === "Folder"}
              <span class="f-status" class:completed={Status}>{Status ? "Completed" : "Ongoing"}</span>
              <span class="f-raw" class:hidden={!isRaw}>Raw</span>
            {/if}
            <span class="f-size">{formatSize(Size)}</span>
            <span class="f-date">{getDate({ Type, EmissionDate, CreatedAt })}</span>
          </div>
          <div class="file-btns usn">
            <span class="file-btn-left" on:click|stopPropagation={openFile} on:keydown>
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
              <FavoriteList {isFav} {type} favId={id} on:removeFile={removeFile} />
            {/if}
          </div>
          <div class="file-name"><span>{Name}</span></div>
        </div>
      </div>
    {/each}
  </div>
</div>
<div class="controls">
  <slot name="controls" />
  <Filter {filter} on:filter={fileFilter} />
  <Pagination page={parseInt(page || 1)} totalPages={pageData.totalPages} on:gotopage={goToPage} />
  <span class="badge">{pageData.totalFiles}</span>
</div>

<style>
  .scroll-container.r-content {
    height: calc(100% - 96px);
    min-height: calc(100% - 90px);
  }
  .file-btn-left {
    cursor: pointer;
  }

  .scroll-container::-webkit-scrollbar-thumb {
    border-radius: 0.4rem;
  }
  .controls :global(#pager) {
    margin: 0 5px;
  }
</style>
