<script>
  import { afterUpdate, getContext, onDestroy } from "svelte";

  import { navigate } from "svelte-routing";
  import apiUtils from "src/apiUtils";

  import FilesList from "src/user/Component/FilesList.svelte";
  import { ProcessFile, getReturnPath } from "../filesUtils";
  import Icons from "src/icons/Icons.svelte";
  import { isValidKey } from "src/ShareComponent/utils";

  export let page = 1;
  export let filter = "";
  export let id = "";
  export let type = "";

  let contents = ["File List", "Details"];
  let currentContent = "File List";

  const menu = document.querySelector("#menu");

  let folderinfo = { Genres: "Loading Info" };

  const socket = getContext("socket");

  let segment = window.location.pathname.replace(/(^\/+|\/+$)/g, "").split("/");
  let typeUrl = `${type}/${segment[1]}/${id}`;

  let pathname = getReturnPath("to-menu");

  const exitFolder = () => {
    navigate(pathname || "/", { replace: true, state: "" });
  };

  const openFirstLast = async ({ target: { id } }) => {
    const data = await apiUtils.files(["first-last", id, folderinfo.Id]);
    if (data.Id) {
      ProcessFile({ id: data.Id, dataset: { type: data.Type } });
    }
  };

  const continueReading = async () => {
    let data;
    if (folderinfo.currentFile) {
      data = await apiUtils.files(["file-data", folderinfo.currentFile]);
    } else {
      data = await apiUtils.files(["first-last", "first", folderinfo.Id]);
    }
    ProcessFile({ id: data.Id, dataset: { type: data.Type } });
  };

  const onGenres = ({ currentTarget }) => {
    const g = currentTarget.textContent || "";
    const part = pathname.split("/").slice(1, 3) || "";
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

  const setFolderInfo = (data) => {
    folderinfo = data;
  };

  const hotkeys = getContext("User").hotkeys;
  const prevTab = hotkeys.find((h) => h.Name === "Prev Tab");
  const nextTab = hotkeys.find((h) => h.Name === "Next Tab");
  const KeyExit = hotkeys.find((key) => key.Name === "Exit");
  const KeyContinue = hotkeys.find((key) => key.Name === "Continue Reading");
  const open = hotkeys.find((key) => key.Name === "Open");

  const onKeydown = (e) => {
    if (isValidKey(e, prevTab)) {
      currentContent = "File List";
      e.preventDefault();
    }

    if (isValidKey(e, nextTab)) {
      currentContent = "Details";
      e.preventDefault();
    }

    if (isValidKey(e, KeyExit)) {
      exitFolder();
    }

    if (isValidKey(e, KeyContinue)) {
      console.log(e.keyCode, isValidKey(e, KeyContinue));
      continueReading(e);
    }

    if (isValidKey(e, open)) {
      ProcessFile(e.target.querySelector(".active"), "Content");
    }
  };

  const focus = () => {
    document.querySelector("#f-content")?.focus();
  };

  afterUpdate(() => (menu.style.display = "none"));
  onDestroy(() => (menu.style.display = "flex"));
</script>

<div id="f-content" class="b-content" on:keydown={onKeydown} tabindex="-1">
  <div class="tabs">
    <div class="return-to" on:click={exitFolder} on:keydown>
      <Icons name="reply" />
    </div>
    {#each contents as content}
      <input id={content} type="radio" name="contents" bind:group={currentContent} value={content} />
      <label for={content}>{content}</label>
    {/each}
  </div>
  {#if currentContent === "Details"}
    <div id="info" use:focus>
      <div id="info-content">
        <div id="img-info">
          <span class="img-d">
            <img src={encodeURI(`/Folder/${folderinfo.FilesType}/${folderinfo?.Name}.jpg`)} alt="Cover Not Found" />
            <span class="d-state" class:completed={folderinfo?.Status}>
              {folderinfo?.Status ? "Completed" : "On Going"}
            </span>
          </span>
          <div id="info-names">
            <div class="manga-name">
              <span class="gen-tag">Name: </span><span>{folderinfo?.Name || "Name: Loading Info"}</span>
            </div>
            <div class="manga-name">
              <span class="gen-tag">Alternative: </span><span>{folderinfo?.AltName || "Name: Loading Info"}</span>
            </div>
            <div class="genres-list">
              <span class="gen-tag">Author(s): </span>
              {#each folderinfo?.Author?.split(", ") || [] as auth}
                <span on:click|preventDefault={onGenres} on:keydown> {auth}</span>
              {/each}
            </div>
            <div class="genres-list">
              <span class="gen-tag">Genres: </span>
              {#each folderinfo?.Genres?.split(", ") as genre}
                <span on:click|preventDefault={onGenres} on:keydown> {genre}</span>
              {/each}
            </div>
          </div>
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
    <FilesList title={"Content"} type={typeUrl} {filter} {page} {id} {setFolderInfo}>
      <div class="first-controls exit" slot="controls" on:click={exitFolder} on:keydown>
        <Icons name="reply" />
      </div>
    </FilesList>
  {/if}
</div>

<style>
  #f-content {
    height: 100%;
    outline: none;
  }
  input[type="radio"] {
    display: none;
  }
  .first-controls {
    background-color: rgb(0 0 0 / 55%);
    height: 32px;
    width: 37px;
    border-radius: 0.25rem;
  }
  .first-controls :global(.icon-reply) {
    top: 1px;
    height: 31px;
    width: 42px;
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
  #info {
    z-index: 999;
    padding: 4px;
    text-align: center;
    padding-top: 5px;
    height: calc(100% - 50px);
  }
  #info-names {
    display: flex;
    flex-direction: column;
  }
  #info-names > div {
    padding: 5px 0;
  }
  #info-names > div:not(:last-child) {
    border-bottom: 1px solid white;
  }
  #info-content {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 700px;
    margin: auto;
    background-color: #14243d;
    border-radius: 0.25rem;
    border: 1px solid white;
  }
  #info-content > div:not(:last-child) {
    padding: 0 4px;
    border-bottom: 1px solid;
  }
  .img-d {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid;
    border-radius: 0.25rem;
    background-color: #030611;
    overflow: hidden;
    margin-right: 10px;
    min-width: max-content;
  }
  #info-content #img-info {
    position: relative;
    display: flex;
    justify-content: left;
    border-bottom: 1px solid;
    min-height: 250px;
    padding: 10px;
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
    max-height: 420px;
    max-width: 100%;
  }
  img[alt]:after {
    font-size: 16px;
  }
  .m-desc {
    font-size: 1.1rem;
    text-align: start;
    flex-grow: 1;
    overflow-y: auto;
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
    overflow: hidden;
    text-align: start;
    padding: 0 5px;
    cursor: pointer;
  }

  .manga-name {
    display: inline-block;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    text-align: start;
    font-size: 1.1rem;
    overflow: auto;
  }

  .genres-list {
    text-align: start;
    font-size: 1.1rem;
    overflow-y: auto;
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
    margin-right: 12px;
  }
  @media screen and (max-width: 800px) {
    #info-content img {
      max-height: 300px;
    }
    .img-d {
      padding: 0;
      height: fit-content;
      margin-top: 20px;
    }
  }
  @media screen and (max-width: 480px) {
    #info-content #img-info {
      display: initial;
      padding: 0;
    }
    #info-content img {
      max-height: 320px;
    }
    #info-names > div {
      max-height: 58px;
      padding: 0 5px;
    }
    .img-d {
      min-width: 0;
      margin: 0;
      padding: 10px 0;
      border: none;
      border-radius: 0;
      border-bottom: 1px solid;
      background-color: transparent;
    }
    .gen-tag {
      font-size: 1.2rem;
      font-weight: 600;
    }
    .m-desc {
      height: calc(100% - 580px);
    }
    .m-desc .desc-text:hover {
      width: 100.5%;
    }
    #btn-bar {
      justify-content: space-evenly;
    }
  }
</style>
