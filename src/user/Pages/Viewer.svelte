<script>
  import { onMount, getContext, onDestroy } from "svelte";
  import { navigate } from "svelte-routing";

  import { ToggleMenu } from "src/ShareComponent/ToggleMenu";

  import apiUtils from "src/apiUtils";
  import PlayList from "../Component/PlayList.svelte";
  import MangaViewer from "./Manga/MangaViewer.svelte";
  import VideoPLayer from "./Video/VideoPlayer.svelte";
  import { KeyMap, mapKeys, handleKeyboard, isVideo, showFileName } from "./pagesUtils";
  import Icons from "src/icons/Icons.svelte";
  import { getReturnPath } from "./filesUtils";
  import { isMobile } from "src/utils";

  export let folderId;
  export let fileId;
  export let type = "";

  let lastId = fileId;
  const menu = document.querySelector("#menu");

  const basePath = `${type}/viewer/${folderId}`;

  const socket = getContext("socket");
  const User = getContext("User");

  const { NextFile, PrevFile, Exit, ShowList } = KeyMap;
  let files = [];
  let playList = [];
  let file = { Name: "", Type: "", Cover: "" };
  let viewer;
  let fileIndex = -1;
  let folderName = "";
  let isManhwa = false;

  const saveFile = async () => {
    let { Id, CurrentPos } = file;
    await apiUtils.post("files/file-update", { Id, CurrentPos });
  };

  const onFilter = (val) => {
    playList = files.filter((f) => f.Name.toLocaleLowerCase().includes(val.toLocaleLowerCase()));
  };

  const selectFile = async ({ target: { id } }) => {
    await saveFile();
    navigate(`/${basePath}/${id}`);
  };

  const changeFile = async (dir = 0) => {
    if (playList.length) {
      let temp = playList.findIndex((f) => f.Id === file.Id) + dir;
      if (temp > -1 && temp < playList.length) {
        if (playList[temp].Id) {
          await saveFile();
          navigate(`/${basePath}/${playList[temp].Id}`);
        }
      }
    }
  };

  const returnBack = async () => {
    await saveFile();
    let path = getReturnPath("open-folder");
    if (!path) {
      path = `/${type}/content/${folderId}`;
    }
    navigate(path);
  };

  let runningClock;

  const onFullScreen = async (e) => {
    const clock = document.getElementById("clock");
    if (document.fullscreenElement) {
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
    if (isMobile()) {
      if (isVideo(file) && document.fullscreenElement) {
        await window.screen.orientation?.lock("landscape");
      } else {
        await window.screen.orientation?.unlock();
      }
    }
  };

  window.addEventListener("fullscreenchange", onFullScreen);

  mapKeys(User.hotkeys);

  onDestroy(() => {
    menu.style.display = "flex";
    window.removeEventListener("fullscreenchange", onFullScreen);
  });

  const changePages = (page) => {
    file.CurrentPos = page;
  };

  const removeFile = async () => {
    socket.emit("file-work", { action: "removeFile", data: { Id: [fileId], Del: true, viewer: true } });
  };

  const onFileRemove = (data) => {
    if (data.viewer) {
      const temp = playList[fileIndex];
      if (temp) {
        files = files.filter((f) => f.Id !== temp.Id);
        playList = playList.filter((f) => f.Id !== temp.Id);
        if (playList.length) {
          fileId = playList[fileIndex ? fileIndex - 1 : 0].Id;
          navigate(`/${basePath}/${fileId}`, { replace: true });
        } else {
          returnBack();
        }
      }
    }
  };

  const getFolderName = () => {
    if (file.Name.includes(folderName)) {
      return "";
    }
    return folderName + " -";
  };
  NextFile.action = () => changeFile(1);
  PrevFile.action = () => changeFile(-1);
  Exit.action = returnBack;
  ShowList.action = () => {
    document.querySelector("#btn-playlist")?.click();
  };

  setTimeout(() => {
    document.body.addEventListener("keydown", handleKeyboard);
  }, 50);

  onMount(async () => {
    socket.on("file-removed", onFileRemove);

    let data = await apiUtils.post(`viewer/folder`, { id: folderId });
    if (!data.fail) {
      isManhwa = data.isManhwa;
      folderName = data.Name;
      window.title = folderName;
      playList = files = data.files;
    }
  });

  onDestroy(() => {
    document.body.removeEventListener("keydown", handleKeyboard);
    socket.off("file-removed", onFileRemove);
  });

  const focus = (el) => el.focus();

  menu.style.display = "none";

  $: if (playList.length) {
    fileIndex = playList.findIndex((f) => f.Id === fileId);
    file = playList[fileIndex];
  }

  $: if (file.Id != lastId) {
    lastId = file.Id;
    showFileName();

    socket?.emit("recent-folder", { CurrentFile: fileId, FolderId: folderId });
  }
</script>

<div class="viewer" bind:this={viewer} class:video={isVideo(file)} tabindex="-1" use:focus>
  <div class="f-name" class:nomenu={$ToggleMenu}>
    <div class="name-c">
      <span>{`${getFolderName()} ${file.Name}`}</span>
    </div>
  </div>
  <span class="info" class:top={isVideo(file)}>
    <span id="files-prog">
      <Icons name="file" />
      {`${fileIndex + 1} / ${playList.length}`}
    </span>
    <div id="clock" />
  </span>
  <PlayList {fileId} files={playList} on:click={selectFile} {onFilter} {folderName} />
  {#if isVideo(file)}
    <VideoPLayer {file} {KeyMap} on:returnBack={returnBack} {viewer} {removeFile} />
  {:else}
    <MangaViewer
      {viewer}
      bind:file
      {isManhwa}
      on:changefile={changeFile}
      on:returnBack={returnBack}
      {changePages}
      {KeyMap}
      {removeFile}
    />
  {/if}
</div>

<style>
  .viewer {
    position: relative;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .f-name {
    display: flex;
    position: fixed;
    top: 10px;
    opacity: 0;
    justify-content: center;
    pointer-events: none;
    z-index: 99;
    width: 100%;
  }
  .name-c {
    max-width: 750px;
    border-radius: 0.25rem;
    padding: 4px 10px;
    background-color: rgba(0, 0, 0, 0.8);
  }
  :fullscreen .f-name {
    top: 5px;
  }

  .info {
    display: inline-block;
    position: fixed;
    right: 0px;
    top: 0px;
    pointer-events: none;
    border-radius: 0.25rem 0 0 0;
    z-index: 4;
    padding: 2px 5px;
    background-color: rgba(0, 0, 0, 0.8);
    user-select: none;
  }
  :fullscreen .top {
    font-size: 12px;
    bottom: initial;
    top: 0;
    border-radius: 0 0 0 0.25rem;
  }
  :fullscreen .top :global(.file) {
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

  .video :global(#btn-playlist) {
    display: none;
  }
  :global(#btn-playlist),
  :global(.fullscreen-progress),
  .f-name,
  .info {
    transition: 1s opacity;
  }

  @media screen and (max-width: 600px) {
    .name-c {
      max-width: calc(100% - 30px);
    }
  }
</style>
