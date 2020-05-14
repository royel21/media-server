<script>
  import axios from "axios";
  import { onMount, afterUpdate, getContext } from "svelte";
  import { navigate } from "svelte-routing";

  import PlayList from "../Component/PlayList.svelte";
  import MangaViewer from "../Component/MangaViewer.svelte";
  import VideoPLayer from "../Component/VideoPlayer.svelte";
  import { KeyMap, handleKeyboard } from "./Util";

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
  let fileIndex = 1;

  onMount(async () => {
    let { data } = await axios.post(`/api/viewer/folder`, { id: folderId });
    if (!data.fail) {
      files = data.files;
      fileIndex = files.findIndex((f) => f.Id === fileId);
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
    let { Id, CurrentPos } = file;
    socket.emit("file-update-pos", { Id, CurrentPos });
  };

  const selectFile = ({ target: { id } }) => {
    saveFile();
    files = files;
    navigate(`/${basePath}/${id}`);
  };

  const changeFile = (dir = 0) => {
    fileIndex = files.findIndex((f) => f.Id === fileId) + dir;

    if (fileIndex > -1 && fileIndex < files.length) {
      saveFile();
      navigate(`/${basePath}/${files[fileIndex].Id}`);
    }
  };

  const returnBack = () => {
    saveFile();
    const pathname = localStorage.getItem("content");
    localStorage.setItem("fileId", file.Id);
    navigate(pathname);
  };
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
    file = files.find((f) => f.Id === fileId) || files[0];
  }

  let runningClock;
  window.addEventListener("fullscreenchange", (e) => {
    if (document.fullscreenElement) {
      const clock = document.getElementById("clock");
      if (clock) {
        clock.innerText = new Date().toLocaleTimeString("en-US");
        runningClock = setInterval(() => {
          clock.innerText = new Date().toLocaleTimeString("en-US");
        }, 1000);
      }
    } else {
      clearInterval(runningClock);
    }
    if (
      /(android)|(iphone)/i.test(navigator.userAgent) &&
      file.Type.includes("Video")
    ) {
      if (document.fullscreenElement) {
        window.screen.orientation.lock("landscape");
      } else {
        window.screen.orientation.unlock();
      }
    }
  });
</script>

<style>
  .viewer {
    position: relative;
    height: 100%;
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
  #clock {
    display: none;
    position: fixed;
    right: 0px;
    bottom: -2px;
    z-index: 1;
    pointer-events: none;
    background-color: rgba(0, 0, 0, 0.8);
    padding: 2px 5px;
    border-radius: 0.25rem;
  }
  #files-prog {
    display: none;
    position: fixed;
    left: calc(50% - 20px);
    bottom: -2px;
    padding: 0 5px;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1;
  }
  :fullscreen #files-prog,
  :fullscreen #clock {
    display: inline-block;
  }
</style>

<div class="viewer" bind:this={viewer} on:keydown={handleKeyboard}>
  <span id="files-prog">{`${fileIndex + 1} / ${files.length}`}</span>
  <div class="f-name" bind:this={fileName}>
    <span>{file.Name}</span>
  </div>
  <div id="clock" />
  <PlayList {fileId} {files} on:click={selectFile} />
  {#if file.Type.includes('Manga')}
    <MangaViewer
      {viewer}
      {file}
      on:changefile={changeFile}
      on:returnBack={returnBack}
      {KeyMap} />
  {:else if file.Type.includes('Video')}
    <VideoPLayer {file} {KeyMap} on:returnBack={returnBack} {viewer} />
  {/if}
</div>
