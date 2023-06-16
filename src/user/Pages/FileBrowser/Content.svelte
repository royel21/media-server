<script>
  import { getContext, onMount } from "svelte";

  import { navigate } from "svelte-routing";
  import apiUtils from "../../../apiUtils";

  import FilesList from "../../Component/FilesList.svelte";
  import { ProcessFile } from "../../Component/filesUtils";
  import SortBy from "./SortBy.svelte";

  export let page = 1;
  export let filter = "";
  export let id = "";

  let showMore = false;
  let descRef;
  let showConfig = false;

  const menu = document.querySelector("#menu");

  let lastRead = "";
  let folderinfo = { Genres: "" };

  const socket = getContext("socket");

  let segment = window.location.pathname.replace(/(^\/+|\/+$)/g, "").split("/");
  let type = `${segment[0]}/${segment[1]}/${id}`;

  let pathname = localStorage.getItem("return-folder");

  const openFirstLast = async ({ target: { id } }) => {
    const data = await apiUtils.files(["first-last", id, folderinfo.Id]);
    ProcessFile({ id: data.Id, dataset: { type: data.Type } });
  };

  const continueReading = async () => {
    const data = await apiUtils.files(["file-data", lastRead]);
    ProcessFile({ id: lastRead, dataset: { type: data.Type } });
  };

  const exitFolder = () => {
    navigate(pathname, { replace: true, state: "" });
  };

  const onGenres = ({ currentTarget }) => {
    const g = currentTarget.textContent;
    const part = pathname.split("/").slice(1, 3);
    navigate(`/${part[0]}/${part[1]}/1/${g}`);
  };

  const onResetFiles = async () => {
    socket.emit("reset-recent", { Id: folderinfo?.Id });
  };

  const scanfiles = () => {
    socket.emit("scan-dir", { Id: folderinfo?.Id, isFolder: true });
  };

  const setLastRead = (data) => (lastRead = data);
  const setFolderInfo = (data) => (folderinfo = data);

  const onShowMore = () => {
    if (showMore) {
      descRef.scrollTop = 0;
    }
    showMore = !showMore;
  };
  //Toggle File List Config
  const handleClick = (e) => (showConfig = !e);
  onMount(() => {
    menu.style.display = "none";
    return () => {
      menu.style.display = "flex";
    };
  });
</script>

<div id="info">
  <div id="info-content">
    <div id="img-info">
      <span class:completed={folderinfo?.Status}>{folderinfo?.Status ? "Completed" : "On Going"}</span>
      <img src={folderinfo?.Cover} alt="Cover Not Found" />
    </div>
    <div id="name-gen-tag">
      <span id="manga-name"><span>{folderinfo?.Name}</span></span>
      <div class="genres-list">
        <span class="gen-tag">Genres: </span>
        {#each folderinfo?.Genres?.split(", ") || [] as genre}
          <span on:click|preventDefault={onGenres}> {genre}</span>
        {/each}
      </div>
      <div class="m-desc" class:show-more={showMore} on:click={onShowMore} title="Click To Show More">
        <span bind:this={descRef} class="desc-text">
          <span class="gen-tag">Description: </span>
          {folderinfo?.Description}
        </span>
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

<fieldset>
  <legend><span>Files List - <SortBy label="Sort By:" {showConfig} toggleConfig={handleClick} /></span></legend>
  <FilesList title={"Content"} {type} {filter} {page} {id} {setFolderInfo} {setLastRead} {handleClick}>
    <div class="first-controls" slot="controls" on:click={exitFolder}>
      <i class="fas fa-arrow-circle-up" />
    </div>
  </FilesList>
</fieldset>

<style>
  fieldset {
    position: relative;
    text-align: center;
    height: calc(100% - 229px);
    min-height: calc(100% - 229px);
    border-radius: 0.5rem;
    margin: 2px;
    margin-top: 10px;
  }
  legend {
    height: 26px;
    padding: 0 5px;
  }
  legend span {
    display: flex;
    justify-content: space-around;
    margin: 0;
    width: 100%;
  }
  div {
    pointer-events: all;
  }
  i {
    background-color: black;
    border-radius: 50%;
  }
  #info {
    z-index: 999;
    padding: 2px;
    text-align: center;
    padding-top: 5px;
  }
  #img-info {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 140px;
    padding: 4px 4px 0 4px;
    border-right: 1px solid;
  }
  #img-info span {
    display: inline-block;
    position: absolute;
    left: 7px;
    bottom: 7px;
    z-index: 9;
    background-color: darkgreen;
    padding: 0 5px;
    border-radius: 0.25rem;
    font-size: 10px;
    font-weight: 600;
  }

  #img-info span.completed {
    background-color: red;
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
    max-width: 100%;
  }
  img[alt]:after {
    font-size: 16px;
  }
  .m-desc {
    text-align: start;
    height: 54px;
  }
  #name-gen-tag {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-grow: 1;
  }
  .genres-list span {
    cursor: pointer;
  }
  .genres-list span:not(:first-child):not(:last-child)::after {
    content: ", ";
  }
  .genres-list span:hover {
    text-decoration: underline;
  }
  .m-desc .desc-text {
    display: inline-block;
    height: 100%;
    overflow: hidden;
    background-color: #14243d;
    text-align: start;
    padding: 0 5px;
    cursor: pointer;
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
  .m-desc.show-more .desc-text {
    position: absolute;
    left: -1px;
    width: 100.3%;
    overflow: auto;
    z-index: 10;
    border-right: 1px solid;
    border-left: 1px solid;
    border-bottom: 1px solid;
    border-bottom-left-radius: 0.4rem;
    border-bottom-right-radius: 0.4rem;
  }
  .genres-list {
    text-align: start;
    padding: 0 5px;
    min-height: 20%;
    font-size: 14px;
    height: 51px;
  }
  .gen-tag {
    font-size: 1rem;
    font-weight: 600;
  }
  #btn-bar {
    display: flex;
    justify-content: space-evenly;
    padding: 5px 0;
    width: 100%;
  }
  #info-content .btn {
    width: 80px;
  }
  @media screen and (max-width: 600px) {
    fieldset {
      height: calc(100% - 218px);
      min-height: calc(100% - 218px);
    }
    .gen-tag {
      font-size: 1rem;
      font-weight: 600;
    }
    #info-content .btn {
      padding: 0.1rem 0.2rem;
      font-size: 12px;
      width: initial;
    }
    .m-desc .desc-text:hover {
      width: 100.5%;
    }
    #img-info {
      width: 140px;
    }
  }
</style>
