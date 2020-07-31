<script>
    import axios from "axios";
    import { onMount, afterUpdate, getContext } from "svelte";
    import { navigate } from "svelte-routing";
    import { ToggleMenu } from "../../ShareComponent/ToggleMenu";

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
        let temp = files.findIndex((f) => f.Id === fileId) + dir;

<<<<<<< HEAD
  const changeFile = (dir = 0) => {
    let temp = files.findIndex(f => f.Id === fileId) + dir;

    if (fileIndex > -1 && fileIndex < files.length - 1) {
      fileIndex = temp;
      saveFile();
      navigate(`/${basePath}/${files[fileIndex].Id}`);
    }
  };
=======
        if (fileIndex > -1 && fileIndex < files.length) {
            fileIndex = temp;
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
    NextFile.isctrl = true;
    PrevFile.action = () => changeFile(-1);
    PrevFile.isctrl = true;
>>>>>>> 085197c68f4a3c982f06d588d8b69f293be60a37

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
        fileIndex = files.findIndex((f) => f.Id === fileId);
    }

<<<<<<< HEAD
  $: if (files.length > 0) {
    file = files.find(f => f.Id === fileId) || files[0];
    fileIndex = files.findIndex(f => f.Id === fileId);
  }

  let runningClock;
  window.addEventListener("fullscreenchange", e => {
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
    if (
      /(android)|(iphone)/i.test(navigator.userAgent) &&
      file.Type.includes("Video") &&
      document.fullscreenElement
    ) {
      window.screen.orientation.lock("landscape");
    } else {
      window.screen.orientation.unlock();
=======
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
        if (
            /(android)|(iphone)/i.test(navigator.userAgent) &&
            file.Type.includes("Video") &&
            document.fullscreenElement
        ) {
            window.screen.orientation.lock("landscape");
        } else {
            window.screen.orientation.unlock();
        }
    });

    $: if (fileId) {
        if (socket)
            socket.emit("recent-folder", { CurrentFile: fileId, FolderId: folderId });
>>>>>>> 085197c68f4a3c982f06d588d8b69f293be60a37
    }
</script>

<style>
    .viewer {
        position: relative;
        height: 100%;
    }
    .f-name {
        display: inline-block;
        position: fixed;
        top: 44px;
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
        z-index: 1;
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
    @media screen and (max-width: 600px) {
        .f-name {
            top: 80px;
        }
        .f-name.nomenu {
            top: 10px;
        }
    }
</style>

<div class="viewer" bind:this={viewer} on:keydown={handleKeyboard}>
    <div class="f-name" bind:this={fileName} class:nomenu={$ToggleMenu}>
        <span>{file.Name}</span>
    </div>
    <span class="info" class:top={file.Type.includes('Video')}>
        <span id="files-prog">
            <i class="fas fa-file" />
            {`${fileIndex + 1} / ${files.length}`}
        </span>
        <div id="clock" />
    </span>
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
