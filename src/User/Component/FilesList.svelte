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

  const socket = getContext("socket");
  const baseData = { files: [], totalPages: 0, totalFiles: 0 };
  let pageData = baseData;
  let selected = 0;
  let favClicked = null;
  let folder = { Genres: "" };
  let lastRead = "";

  const cancelToken = axios.CancelToken;
  let cancel;

  const loadContent = async (pg = 1, flt = "", curId = "", config, nType) => {
    try {
      if (cancel) {
        cancel();
      }
      let url = genUrl(pg, { items: config.items, order: config.order[title] || "nu" }, flt, nType || type, curId);

      let { data } = await axios.get(url, {
        cancelToken: new cancelToken(function executor(c) {
          cancel = c;
        }),
      });

      if (typeof data === "object") {
        pageData = data;
        if (data.files[0]) {
          folder = data.files[0].Folder;
        }
        lastRead = data.currentFile;
        selected = pageData.files.findIndex((f) => f.Id === lastRead) || 0;
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

  const openFirstLast = async ({ target: { id } }) => {
    const { data } = await axios.get(`/api/files/first-last/${id}/${folder.Id}`);
    ProcessFile({ id: data.Id, dataset: { type: data.Type } }, socket);
  };

  const continueReading = async () => {
    const { data } = await axios.get(`/api/files/file-data/${lastRead}`);
    ProcessFile({ id: lastRead, dataset: { type: data.Type } }, socket);
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

  const scanfiles = () => {
    socket.emit("scan-dir", { Id: folder.Id, isFolder: true });
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

  const onResetFiles = async () => {
    await axios.get(`/api/files/reset-recents/${folder.Id}`);
    await loadContent(page, filter, id, $PageConfig, type);
  };

  $: document.title = `${title} Page ${page || ""}`;

  $: loadContent(page, filter, id, $PageConfig, type);

  $: if (pageData.totalPages && parseInt(page) > pageData.totalPages) {
    navigate(`/${type}/${page - 1}/${filter || ""}`);
  }
  let isContent = location.pathname.includes("content");
</script>

{#if isContent}
  <div id="info">
    <div id="info-content">
      <div id="img-info"><img src={folder.Cover} alt="Place Holder" /></div>
      <div id="name-gen-tag">
        <span id="manga-name"><span>{folder.Name}</span></span>
        <div class="genres-list">
          <span class="gen-tag">Genres: </span>
          {#each folder.Genres.split(", ") as genre}
            {" "}<a href="/"> {genre}</a>
          {/each}
        </div>
        <div class="m-desc">
          <span class="desc-text"><span class="gen-tag">Description: </span>{folder.Description || ""}</span>
        </div>
        <div id="btn-bar">
          {#if lastRead}
            <button class="btn btn-secondary" on:click={continueReading}>Continue</button>
          {/if}
          <button id="first" class="btn btn-secondary" on:click={openFirstLast}>First</button>
          <button id="last" class="btn btn-secondary" on:click={openFirstLast}>Last</button>
          <button class="btn btn-secondary" on:click={onResetFiles}>Reset All</button>
          <button class="btn btn-secondary" on:click={scanfiles}>Update</button>
        </div>
      </div>
    </div>
  </div>
{/if}
<div class="scroll-container" class:r-content={isContent}>
  <slot name="header" />
  <div class="files-list" on:keydown={handleKeydown} on:click={favClick}>
    {#each pageData.files as { Id, Name, Type, Cover, CurrentPos, Duration, isFav, FileCount }, i}
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
    padding-top: 0;
    height: calc(100% - 251px);
    min-height: calc(100% - 251px);
    padding-bottom: 40px;
  }
  .file-btn-left {
    cursor: pointer;
  }
  .file-btn-left i {
    pointer-events: none;
  }
  #info {
    z-index: 999;
    padding: 2px;
    text-align: center;
    padding-top: 40px;
  }
  #img-info {
    padding: 4px 4px 0 4px;
    border-right: 1px solid;
  }
  #info-content {
    position: relative;
    display: flex;
    justify-content: center;
    max-width: 700px;
    margin: auto;
    background-color: #14243d;
    border-radius: 0.25rem;
    border: 1px solid white;
  }
  #info img {
    max-height: 186px;
  }
  .m-desc {
    text-align: start;
    height: 54px;
  }
  .m-desc .desc-text {
    display: inline-block;
    height: 100%;
    overflow: hidden;
    background-color: #14243d;
    text-align: start;
    padding: 0 5px;
  }
  .m-desc .desc-text:hover {
    position: absolute;
    left: -1px;
    width: 100.5%;
    height: 300px;
    overflow: auto;
    z-index: 99;
    border-right: 1px solid;
    border-left: 1px solid;
    border-bottom: 1px solid;
    border-bottom-left-radius: 0.4rem;
    border-bottom-right-radius: 0.4rem;
  }
  #name-gen-tag {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-grow: 1;
  }
  #manga-name {
    display: inline-block;
    font-family: cursive;
    text-align: start;
    font-size: 1rem;
    height: 54px;
    overflow: hidden;
  }
  #manga-name:hover span {
    position: absolute;
  }
  #manga-name span {
    display: inline-block;
    background-color: #14243d;
    padding: 0 5px;
  }
  #name-gen-tag > *:not(:last-child) {
    border-bottom: 1px solid;
    width: 100%;
  }
  .genres-list {
    text-align: start;
    padding: 0 5px;
    min-height: 20%;
  }
  .gen-tag {
    font-size: 1rem;
    font-weight: 600;
  }
  .genres-list a {
    cursor: pointer;
  }
  .genres-list a:hover {
    text-decoration: underline;
  }
  #btn-bar {
    display: flex;
    justify-content: space-evenly;
    padding: 5px 0;
    width: 100%;
  }
  #info-content .btn {
    width: 92px;
  }
  @media screen and (max-width: 600px) {
    #info {
      padding-top: 70px;
    }
    .gen-tag {
      font-size: 1rem;
      font-weight: 600;
    }
    #info-content .btn {
      padding: 0.255rem 0.25rem;
      font-size: 0.8rem;
      width: initial;
    }
    .scroll-container.r-content {
      padding-top: 0;
      height: calc(100% - 251px);
      min-height: calc(100% - 251px);
      padding-bottom: 40px;
    }
  }
</style>
