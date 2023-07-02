<script>
  import { getContext, onDestroy, onMount } from "svelte";

  import { navigate } from "svelte-routing";
  import apiUtils from "../../../apiUtils";

  import FilesList from "../../Component/FilesList.svelte";
  import { ProcessFile } from "../../Component/filesUtils";
  import SortBy from "./SortBy.svelte";
  import Icons from "../../../icons/Icons.svelte";

  export let page = 1;
  export let filter = "";
  export let id = "";

  let showConfig = false;
  let contents = ["File List", "Details"];
  let currentContent = "File List";

  const menu = document.querySelector("#menu");

  let lastRead = "";
  let folderinfo = { Genres: "Loading Info" };

  const socket = getContext("socket");

  let segment = window.location.pathname.replace(/(^\/+|\/+$)/g, "").split("/");
  let type = `${segment[0]}/${segment[1]}/${id}`;

  let pathname = localStorage.getItem("return-folder");

  const openFirstLast = async ({ target: { id } }) => {
    const data = await apiUtils.files(["first-last", id, folderinfo.Id]);
    ProcessFile({ id: data.Id, dataset: { type: data.Type } });
  };

  const continueReading = async () => {
    const data = await apiUtils.files(["file-data", folderinfo.currentFile]);
    ProcessFile({ id: folderinfo.currentFile, dataset: { type: data.Type } });
  };

  const exitFolder = () => {
    navigate(pathname, { replace: true, state: "" });
  };

  const onGenres = ({ currentTarget }) => {
    const g = currentTarget.textContent;
    const part = pathname.split("/").slice(1, 3);
    if (/mangas|videos|favorites/i.test(pathname)) {
      navigate(`/${part[0]}/${part[1]}/1/${g}`);
    } else {
      navigate(`/1/${g}`);
    }
  };

  const onResetFiles = async () => {
    socket.emit("reset-recent", { Id: folderinfo?.Id });
  };

  const scanfiles = () => {
    socket.emit("scan-dir", { Id: folderinfo?.Id, isFolder: true });
  };

  const setLastRead = (data) => (lastRead = data);

  const setFolderInfo = (data) => {
    folderinfo = data;
  };

  //Toggle File List Config
  const handleClick = (e) => (showConfig = !e);
  onMount(async () => {
    const data = await apiUtils.get(["files", "folder-content", "info", id]);
    if (data.isValid) {
      folderinfo = data;
    }
    console.log(folderinfo);

    menu.style.display = "none";
  });

  onDestroy(() => (menu.style.display = "flex"));
</script>

<div class="tabs">
  <div class="return-to" on:click={exitFolder}>
    <Icons name="reply" />
  </div>
  {#each contents as content}
    <input id={content} type="radio" name="contents" bind:group={currentContent} value={content} />
    <label for={content}>{content}</label>
  {/each}
</div>
{#if currentContent === "Details"}
  <div id="info">
    <div id="info-content">
      <div id="img-info">
        <span class="d-state" class:completed={folderinfo?.Status}>{folderinfo?.Status ? "Completed" : "On Going"}</span
        >
        <span class="img-d"><img src={folderinfo?.Cover} alt="Cover Not Found" /></span>
      </div>
      <div class="manga-name">Name: <span>{folderinfo?.Name || "Name: Loading Info"}</span></div>
      <div class="manga-name alt">Alternative: <span>{folderinfo?.AltName || "Name: Loading Info"}</span></div>
      <div class="genres-list">
        <span class="gen-tag">Genres: </span>
        {#each folderinfo?.Genres?.split(", ") as genre}
          <span on:click|preventDefault={onGenres}> {genre}</span>
        {/each}
      </div>
      <div class="m-desc">
        <span class="desc-text">
          <span class="gen-tag">Description: </span>
          {folderinfo?.Description || "Loading Info"}
        </span>
      </div>
    </div>
  </div>
{/if}
{#if currentContent === "File List"}
  <div id="btn-bar">
    {#if folderinfo.currentFile}
      <button class="btn btn-secondary" on:click={continueReading}>Continue</button>
    {/if}
    <button id="first" class="btn btn-secondary" on:click={openFirstLast}>First</button>
    <button id="last" class="btn btn-secondary" on:click={openFirstLast}>Last</button>
    <button class="btn btn-secondary" on:click={onResetFiles}>Reset All</button>
    <button class="btn btn-secondary" on:click={scanfiles}>Update</button>
  </div>
  <fieldset>
    <legend><span>Files List - <SortBy label="Sort By:" {showConfig} toggleConfig={handleClick} /></span></legend>
    <FilesList title={"Content"} {type} {filter} {page} {id} {setFolderInfo} {setLastRead} {handleClick} />
  </fieldset>
{/if}

<style>
  input[type="radio"] {
    display: none;
  }
  .tabs {
    position: relative;
    display: flex;
    padding-top: 5px;
    text-align: center;
    border-bottom: 1px solid white;
    user-select: none;
    justify-content: center;
  }

  .tabs label {
    font-size: 19px;
    font-weight: 600;
    cursor: pointer;
    color: white;
    transition: 0.3s all;
    margin-bottom: -1px;
    border: 1px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    border-color: #e9ecef #e9ecef #dee2e6;
    padding: 0.45rem;
    user-select: none;
    z-index: 100;
    background-color: radial-gradient(ellipse at center, #14243d 0, #030611 100%);
  }

  input:checked + label {
    background-color: white;
    color: black;
  }

  fieldset {
    position: relative;
    text-align: center;
    height: calc(100% - 95px);
    min-height: calc(100% - 95px);
    border-radius: 0.5rem;
    margin: 0px 2px;
  }
  fieldset :global(.files-list) {
    padding-bottom: 0;
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

  .return-to {
    position: fixed;
    left: 5px;
  }
  .return-to :global(svg) {
    height: 30px;
    width: 38px;
  }

  #info-content {
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: 700px;
    margin: auto;
    background-color: #14243d;
    border-radius: 0.25rem;
    border: 1px solid white;
  }
  #info-content > div:not(:last-child) {
    border-bottom: 1px solid;
  }
  #info {
    z-index: 999;
    padding: 4px;
    text-align: center;
    padding-top: 5px;
  }
  .img-d {
    display: flex;
    align-items: center;
    justify-content: center;
    max-height: 186px;
    min-height: 186px;
    min-width: 150px;
    padding: 1px;
    border: 1px solid;
    border-radius: 0.25rem;
  }
  #img-info {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-bottom: 1px solid;
    min-height: 190px;
  }
  #img-info .d-state {
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
  #img-info .completed {
    background-color: red;
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
    text-align: start;
    padding: 0 5px;
    cursor: pointer;
  }

  .manga-name {
    display: inline-block;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    text-align: start;
    font-size: 1rem;
    height: 54px;
    overflow: hidden;
  }
  .alt {
    height: 80px;
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
    justify-content: center;
    padding: 5px 0;
    width: 100%;
  }
  #btn-bar button {
    margin-right: 15px;
  }
  @media screen and (max-width: 600px) {
    .gen-tag {
      font-size: 1rem;
      font-weight: 600;
    }
    .m-desc .desc-text:hover {
      width: 100.5%;
    }
    #btn-bar {
      justify-content: space-evenly;
    }
  }
</style>
