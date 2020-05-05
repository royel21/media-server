<script>
  import axios from "axios";
  import { onMount, afterUpdate, getContext } from "svelte";
  import { navigate } from "svelte-routing";

  import PlayList from "../Component/PlayList.svelte";
  import MangaViewer from "../Component/MangaViewer.svelte";
  import { KeyMap, handleKeyboard, setfullscreen } from "./Util";

  export let folderId;
  export let fileId;
  const basePath = location.pathname
    .replace(/(^\/+|\/+$)/g, "")
    .split("/")
    .slice(0, 3)
    .join("/");
  const socket = getContext("socket");
  const { Fullscreen, NextFile, PrevFile } = KeyMap;
  let files = [];
  let observer;
  let playList;
  let file = { Type: "" };
  let fileName;
  let viewer;

  onMount(async () => {
    let { data } = await axios.post(`/api/viewer/folder`, { id: folderId });
    if (data.fail) {
      console.log(data.msg);
    } else {
      files = data.files;
    }
    window.addEventListener("beforeunload", saveFile);
    return () => {
      window.removeEventListener("beforeunload", saveFile);
      if (observer) {
        observer.disconnect();
      }
    };
  });

  const saveFile = () => {
    socket.emit("file-update-pos", file);
    console.log("file save", file.Id, file.CurrentPos);
  };

  const selectFile = ({ target: { id } }) => {
    saveFile();
    files = files;
    navigate(`/${basePath}/${id}`);
  };

  const changeFile = (dir = 0) => {
    saveFile();
    let fileIndex = files.findIndex(f => f.Id === fileId) + dir;
    if (fileIndex > -1 && fileIndex < files.length) {
      navigate(`/${basePath}/${files[fileIndex].Id}`);
    }
  };

  const returnBack = () => {
    saveFile();
    const pathname = localStorage.getItem("content");
    localStorage.setItem("fileId", file.Id);
    navigate(pathname);
  };
  Fullscreen.action = () => setfullscreen(viewer);
  NextFile.action = () => changeFile(1);
  PrevFile.action = () => changeFile(-1);

  let lastId;
  let tout;
  $: if (file.Id != lastId) {
    lastId = file.Id;
    clearTimeout(tout);
    fileName.style.opacity = 1;
    tout = setTimeout(() => {
      if (fileName) fileName.style.opacity = 0;
    }, 5000);
  }

  $: if (files.length > 0) {
    file = files.find(f => f.Id === fileId) || files[0];
  }
</script>

<style>
  .viewer {
    height: calc(100% - 37px);
    position: relative;
  }
  .f-name {
    position: absolute;
    top: 5px;
    opacity: 0;
    text-align: center;
    pointer-events: none;
    transition: 1s;
    z-index: 99;
    width: 100%;
  }
  span {
    display: inline-block;
    transition: 5s all;
    max-width: 400px;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 0.25rem;
  }
  @media screen and (max-width: 600px) {
    .viewer {
      height: calc(100% - 66px);
      position: relative;
    }
  }
</style>

<div class="viewer" bind:this={viewer} on:keydown={handleKeyboard}>
  <div class="f-name" bind:this={fileName}>
    <span>{file.Name}</span>
  </div>
  <PlayList {fileId} {files} on:click={selectFile} />
  {#if file.Type.includes('Manga')}
    <MangaViewer
      {file}
      on:changefile={changeFile}
      on:returnBack={returnBack}
      {KeyMap} />
  {:else}
    <div />
  {/if}
</div>
