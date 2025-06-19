<script>
  import { afterUpdate, getContext, onDestroy } from "svelte";

  import { navigate } from "svelte-routing";
  import apiUtils from "src/apiUtils";

  import FilesList from "src/user/Component/FilesList.svelte";
  import { ProcessFile, getReturnPath } from "../filesUtils";
  import Icons from "src/icons/Icons.svelte";
  import { isValidKey } from "@share/utils";
  import Condition from "./ConditionNF.svelte";
  import DetailEditor from "./DetailEditor.svelte";

  export let page = 1;
  export let filter = "";
  export let id = "";
  export let type = "";

  const User = getContext("User");

  let contents = ["File List", "Details"];
  let currentContent = "File List";
  let showEditor = false;

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
    if (data.EmissionDate) {
      data = { ...data, Year: data.EmissionDate.split("-")[0] };
    }
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
      continueReading(e);
    }

    if (isValidKey(e, open)) {
      ProcessFile(e.target.querySelector(".active"), "Content");
    }
  };

  const focus = () => {
    document.querySelector("#f-content")?.focus();
  };

  const onShowGenresEdit = (e) => {
    showEditor = e?.target.id;
  };

  const update = (data) => (folderinfo = data);

  afterUpdate(() => (menu.style.display = "none"));
  onDestroy(() => (menu.style.display = "flex"));
</script>

{#if showEditor}
  <DetailEditor title={showEditor} hide={onShowGenresEdit} item={folderinfo} {update} />
{/if}

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
            {#if folderinfo?.Year}
              <span class="d-state Year">
                {folderinfo?.Year}
              </span>
            {/if}
          </span>
          <div id="info-names">
            <div class="manga-name">
              <span class="gen-tag">Name: </span><span>{folderinfo?.Name || "Loading Info"}</span>
            </div>
            <div class="manga-name alt-content">
              <span class="gen-tag">Alternative: </span><span>{folderinfo?.AltName || "N/F"}</span>
              {#if User.role.includes("Manager")}
                <span id="AltName" class="btn primary" on:click={onShowGenresEdit}>...</span>
              {/if}
            </div>
            <div class="genres-list">
              <div>
                <span class="gen-tag">Author(s): </span>
                <Condition data={folderinfo?.Author} split=", " on:click={onGenres} />
              </div>
              {#if User.role.includes("Manager")}
                <span id="Author" class="btn primary" on:click={onShowGenresEdit}>...</span>
              {/if}
            </div>
            <div class="genres-list">
              <div>
                <span class="gen-tag">Genres: </span>
                <Condition data={folderinfo?.Genres} split=", " on:click={onGenres} />
              </div>
              {#if User.role.includes("Manager")}
                <span id="Genres" class="btn primary" on:click={onShowGenresEdit}>...</span>
              {/if}
            </div>
          </div>
        </div>
        <div class="m-desc">
          <span class="gen-tag">Description: </span>
          <span class="desc-text">
            {#if folderinfo?.Description}
              {#each folderinfo?.Description.split("\n") as desc}
                <p>{desc}</p>
              {/each}
            {:else}
              Loading Info
            {/if}
          </span>
          {#if User.role.includes("Manager")}
            <span id="Description" class="btn primary" on:click={onShowGenresEdit}>...</span>
          {/if}
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
      {#if User.role.includes("Manager")}
        <button class="btn btn-secondary" on:click={scanfiles}>Update</button>
      {/if}
    </div>
    <FilesList title={"Content"} type={typeUrl} {filter} {page} {id} {setFolderInfo}>
      <div class="first-controls exit" slot="controls" on:click={exitFolder}>
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
  .alt-content {
    max-height: 94px;
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
    width: 100%;
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
    padding-right: 0;
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
    font-size: 14px;
    font-weight: 700;
  }
  #img-info .Year {
    left: initial;
    right: 5px;
    background-color: #3072ec;
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
    position: relative;
    font-size: 1.1rem;
    text-align: start;
    flex-grow: 1;
    overflow-y: auto;
  }

  .m-desc .desc-text p:global(:not(:nth-child(2)):not(:last-child)) {
    margin: 15px 0;
  }
  .m-desc .gen-tag {
    position: sticky;
    top: 0;
    background-color: #000000c7;
    padding: 1px 4px;
    border-radius: 0.25rem;
  }

  #name-gen-tag {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-grow: 1;
  }
  .genres-list :global(span:not(:first-child):not(:last-child)::after) {
    content: ", ";
  }

  .m-desc .desc-text {
    display: inline-block;
    overflow: hidden;
    text-align: start;
    padding: 0 5px;
    cursor: pointer;
  }

  .desc-text :global(.g-item:hover) {
    cursor: initial;
    text-decoration: initial;
  }

  .manga-name {
    position: relative;
    display: inline-block;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    text-align: start;
    font-size: 1.1rem;
    overflow: auto;
  }

  .genres-list {
    position: relative;
    text-align: start;
    font-size: 1.1rem;
    overflow-y: auto;
  }
  .gen-tag {
    font-size: 1.2rem;
    font-weight: 700;
  }

  .manga-name,
  .genres-list {
    width: 100%;
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
  .primary {
    position: absolute;
    top: 2px;
    right: 2px;
    height: 24px;
    color: black;
    line-height: 0.8;
    background-color: rgb(37, 140, 209);
    background-image: linear-gradient(-120deg, #3072ec, #06d7e6, #0dedfd);
  }

  @media screen and (max-width: 800px) {
    #info-content img {
      max-height: 300px;
    }
  }
  @media screen and (max-width: 480px) {
    #info-content #img-info {
      display: initial;
      padding: 0;
    }
    #info-content img {
      max-height: 260px;
    }
    #info-names > div {
      max-height: 58px;
      padding: 0 5px;
    }
    .img-d {
      min-width: 0;
      min-height: 160px;
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
