<script>
  import { getContext, onDestroy } from "svelte";

  import { navigate } from "svelte-routing";

  import FilesList from "../../Component/FilesList.svelte";
  import { ProcessFile } from "../../Component/FilesUtils";
  import SortBy from "./SortBy.svelte";

  export let page = 1;
  export let filter = "";
  export let id = "";

  const sortBy = [
    { value: "nu", label: "\u2B07 Name" },
    { value: "nd", label: "\u2B06 Name" },
    { value: "du", label: "\u2B07 Date" },
    { value: "dd", label: "\u2B06 Date" },
  ];

  const menu = document.querySelector("#menu");

  let lastRead = "";
  let folderinfo = { Genres: "" };

  const socket = getContext("socket");

  let segment = window.location.pathname.replace(/(^\/+|\/+$)/g, "").split("/");
  let type = `${segment[0]}/${segment[1]}/${id}`;

  let { pathname, folder } = localStorage.getObject("folder");
  localStorage.setItem("fileId", folder);

  const openFirstLast = async ({ target: { id } }) => {
    const { data } = await axios.get(`/api/files/first-last/${id}/${folderinfo.Id}`);
    ProcessFile({ id: data.Id, dataset: { type: data.Type } }, socket);
  };

  const continueReading = async () => {
    const { data } = await axios.get(`/api/files/file-data/${lastRead}`);
    ProcessFile({ id: lastRead, dataset: { type: data.Type } }, socket);
  };

  const exitFolder = () => {
    navigate(pathname, { replace: true });
  };

  const onGenres = ({ currentTarget }) => {
    const g = currentTarget.textContent;
    const part = pathname.split("/").slice(1, 3);
    navigate(`/${part[0]}/${part[1]}/1/${g}`);
  };

  const onResetFiles = async () => {
    await axios.get(`/api/files/reset-recents/${folderinfo.Id}`);
    id = folderinfo.Id;
  };

  const scanfiles = () => {
    socket.emit("scan-dir", { Id: folderinfo.Id, isFolder: true });
  };

  const setLastRead = (data) => (lastRead = data);
  const setFolderInfo = (data) => (folderinfo = data);

  onDestroy(() => (menu.style.display = "flex"));
  menu.style.display = "none";
</script>

<div id="info">
  <div id="info-content">
    <div id="img-info"><img src={folderinfo.Cover} alt="Cover Not Found" /></div>
    <div id="name-gen-tag">
      <span id="manga-name"><span>{folderinfo.Name}</span></span>
      <div class="genres-list">
        <span class="gen-tag">Genres: </span>
        {#each folderinfo.Genres.split(", ") as genre}
          <span on:click|preventDefault={onGenres}> {genre}</span>
        {/each}
      </div>
      <div class="m-desc">
        <span class="desc-text"><span class="gen-tag">Description: </span>{folderinfo.Description || ""}</span>
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
  <legend><span>Files List - <SortBy label="Sort By:" items={sortBy} /></span></legend>
  <FilesList title={"Content"} {type} {filter} {page} {id} {setFolderInfo} {setLastRead}>
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
    position: absolute;
    top: -10px;
    left: calc(50% - 161.1px);
    height: 26px;
    padding: 0 5px;
    font-size: 16px;
    z-index: 999;
    background-color: #14243d;
    border-radius: 0.25rem;
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
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 140px;
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
  .m-desc .desc-text:hover {
    position: absolute;
    left: -1px;
    width: 100.3%;
    height: -moz-available;
    height: -webkit-fill-available;
    height: fill-available;
    overflow: auto;
    z-index: 99;
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
    width: 92px;
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
      padding: 0.255rem 0.25rem;
      font-size: 0.8rem;
      width: initial;
    }
    .m-desc .desc-text:hover {
      width: 100.5%;
    }
  }
</style>
