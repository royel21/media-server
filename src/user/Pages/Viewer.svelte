<script>
  import { onMount, getContext, onDestroy } from "svelte";
  import { navigate } from "svelte-routing";

  import { ToggleMenu } from "../../ShareComponent/ToggleMenu";

  import PlayList from "../Component/PlayList.svelte";
  import MangaViewer from "./Manga/MangaViewer.svelte";
  import VideoPLayer from "./Video/VideoPlayer.svelte";
  import { KeyMap, handleKeyboard, isMobile, isVideo, isManga, showFileName, sortFileByName } from "./pagesUtils";
  import apiUtils from "../../apiUtils";

  export let folderId;
  export let fileId;
  let lastId = fileId;
  const menu = document.querySelector("#menu");

  const basePath = location.pathname
    .replace(/(^\/+|\/+$)/g, "")
    .split("/")
    .slice(0, 3)
    .join("/");
  const socket = getContext("socket");
  const { NextFile, PrevFile } = KeyMap;
  let files = [];
  let playList = [];
  let file = { Name: "", Type: "", Cover: "" };
  let viewer;
  let fileIndex = 1;
  let filters = { filter: "" };
  let folderName = "";

  const saveFile = () => {
    let { Id, CurrentPos } = file;
    socket.emit("file-update-pos", { Id, CurrentPos });
  };

  const selectFile = ({ target: { id } }) => {
    saveFile();
    if (filters.filter) {
      playList = files.filter((f) => f.Name.contains(filters.filter));
    } else {
      playList = files;
    }

    navigate(`/${basePath}/${id}`);
  };

  const changeFile = (dir = 0) => {
    if (playList.length) {
      let temp = playList.findIndex((f) => f.Id === fileId) + dir;
      if (temp > -1 && temp < playList.length) {
        fileIndex = temp;
        saveFile();
        navigate(`/${basePath}/${playList[fileIndex].Id}`);
      }
    }
  };

  const returnBack = () => {
    saveFile();
    const pathname = localStorage.getItem("content");
    localStorage.setItem("fileId", file.Id);
    navigate(pathname);
  };

  NextFile.action = () => changeFile(1);
  NextFile.isctrl = true;
  PrevFile.action = () => changeFile(-1);
  PrevFile.isctrl = true;

  onMount(async () => {
    let data = await apiUtils.post(`viewer/folder`, { id: folderId });
    if (!data.fail) {
      folderName = data.Name;
      playList = files = data.files.sort(sortFileByName);
      window.title = playList[0]?.Cover?.split("/")[2] || "";
    }
  });
  $: if (file.Id != lastId) {
    lastId = file.Id;
    showFileName();
    socket?.emit("recent-folder", { CurrentFile: fileId, FolderId: folderId });
  }

  const clearFilter = () => {
    playList = files;
  };

  $: if (playList.length > 0) {
    file = playList.find((f) => f.Id === fileId) || playList[0];
    fileIndex = playList.findIndex((f) => f.Id === fileId);
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
      clock.innerText = "";
    }
    if (isMobile && isVideo(file) && document.fullscreenElement) {
      window.screen.orientation.lock("landscape");
    } else {
      window.screen.orientation.unlock();
    }
  });

  onDestroy(() => (menu.style.display = "flex"));

  menu.style.display = "none";
</script>

<div class="viewer" bind:this={viewer} on:keydown={handleKeyboard}>
  <div class="f-name" class:nomenu={$ToggleMenu}>
    <span>{`${folderName} - ${file.Name}`}</span>
  </div>
  <span class="info" class:top={isVideo(file)}>
    <span id="files-prog">
      <i class="fas fa-file" />
      {`${fileIndex + 1} / ${playList.length}`}
    </span>
    <div id="clock" />
  </span>
  <PlayList {fileId} files={playList} on:click={selectFile} {filters} on:clearfilter={clearFilter} />
  {#if isManga(file)}
    <MangaViewer {viewer} {file} on:changefile={changeFile} on:returnBack={returnBack} {KeyMap} />
  {:else if isVideo(file)}
    <VideoPLayer {file} {KeyMap} on:returnBack={returnBack} {viewer} />
  {/if}
</div>

<style>
  .viewer {
    position: relative;
    height: 100%;
  }
  .f-name {
    display: inline-block;
    position: fixed;
    top: 10px;
    opacity: 0;
    text-align: center;
    pointer-events: none;
    z-index: 99;
    width: 100%;
    transition: 5s opacity;
  }
  :fullscreen .f-name {
    top: 5px;
  }
  .f-name span {
    max-width: 400px;
    border-radius: 0.25rem;
    padding: 4px 10px;
    background-color: rgba(0, 0, 0, 0.8);
  }
  .info {
    display: inline-block;
    position: fixed;
    right: 0px;
    bottom: 0px;
    pointer-events: none;
    border-radius: 0.25rem 0 0 0;
    z-index: 4;
    padding: 2px 5px;
    background-color: rgba(0, 0, 0, 0.8);
  }
  :fullscreen .top {
    font-size: 12px;
    bottom: initial;
    top: 0;
    border-radius: 0 0 0 0.25rem;
  }
  :fullscreen .top .fas {
    font-size: 16px;
  }
  #clock {
    display: inline-block;
    border-left: 1px solid;
    padding-left: 5px;
  }
  #clock:empty {
    display: none;
  }
</style>
