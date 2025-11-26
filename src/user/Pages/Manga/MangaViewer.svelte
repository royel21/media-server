<script>
  import { getContext, createEventDispatcher, afterUpdate, onMount } from "svelte";
  import { clamp } from "@share/utils";
  import { setfullscreen } from "../pagesUtils";
  import { scrollInView, getEmptyIndex } from "./mangaUtils";
  import { disconnectObvrs, PageObserver, scrollImageLoader } from "./Observers";
  import { onTouchStart, onTouchEnd, onTouchMove, default as controls } from "./MangaTouch";

  import { ToggleMenu, updateToggleMenu } from "src/ShareComponent/ToggleMenu";
  import { ConfigStore, updateConfig } from "src/user/Stores/PageConfigStore";
  import MangaConfig from "./MangaConfig.svelte";
  import Icons from "src/icons/Icons.svelte";

  export let file;
  export let KeyMap;
  export let viewer;
  export let changePages;
  export let removeFile;
  export let isManhwa;

  const { NextFile, PrevFile, Fullscreen, SkipForward, SkipBack, GotoStart, GotoEnd, ToggleControlBar } = KeyMap;
  const socket = getContext("socket");
  const User = getContext("User");
  const dispatch = createEventDispatcher();

  let webtoon = $ConfigStore.Viewer.manga.webtoon;
  let config = $ConfigStore.Viewer.manga;
  let progress = "";
  let images = [];
  let inputPage;
  let isFullscreen = false;
  let error;
  let indices = [];
  let showLoop;

  let viewerState = {
    loading: false,
    jumping: false,
    lastId: file?.Id,
  };
  //emptyImage observer
  const loadImages = (pg, toPage, dir = 1) => {
    if (!viewerState.loading && file.Id && !isNaN(pg) && !isNaN(toPage)) {
      const founds = getEmptyIndex(images, pg, toPage, dir || 1, file.Duration).filter((fi) => !indices.includes(fi));
      if (founds.length) {
        viewerState.loading = true;
        socket.emit("loadzip-image", { Id: file.Id, indices: founds });
      }
    }
  };

  const changePage = (dir, action) => {
    const pg = file.CurrentPos + dir;
    if (pg > -1 && pg < file.Duration) {
      if (webtoon) {
        scrollInView(pg);
      }
      if (!viewerState.loading && !images[pg + 2 * dir]) {
        loadImages(pg, 10, dir);
      }
      changePages(pg);
    } else {
      viewerState.jumping = webtoon;
      if (action) action();
    }
  };

  const prevPage = () => changePage(-1, PrevFile.action);
  const nextPage = () => changePage(1, NextFile.action);

  const jumpTo = (val) => {
    val = clamp(val, 1, file.Duration) - 1;

    changePages(val);
    if (webtoon) {
      scrollInView(val);
    }

    viewerState.jumping = webtoon;
    loadImages(val - 5, 10);
    scrollInView(val);
  };

  //Replace Placeholder with current page on focus
  const onInputFocus = () => {
    inputPage.value = file.CurrentPos + 1;
    inputPage.focus();
  };
  //clear Input on focusout and show placeholder
  const onInputBlur = () => (inputPage.value = "");
  //Set page and load image for the next position
  const jumpToPage = () => {
    jumpTo(+inputPage.value);
    onInputBlur();
  };

  const returnTo = () => dispatch("returnBack");

  let tout1;
  let connectObservers = (delay = 0) => {
    clearTimeout(tout1);
    tout1 = setTimeout(() => {
      scrollInView(file.CurrentPos);
      scrollImageLoader(loadImages, viewer);
      viewerState.jumping = false;
    }, delay);
  };

  const onFullScreen = () => {
    if (webtoon) {
      disconnectObvrs(viewer);
      isFullscreen = setfullscreen(viewer);
      connectObservers(100);
    } else {
      isFullscreen = setfullscreen(viewer);
    }
  };

  ConfigStore.subscribe(({ Viewer: { manga } }) => (config = manga));

  // receive data from server
  const onImageData = (data) => {
    if (data.id === file.Id) {
      if (!data.last) {
        indices.push(data.page);
        images[data.page] = data.img;
      } else {
        viewerState.jumping = false;
        viewerState.loading = false;
      }
    }
  };

  controls.prevPage = prevPage;
  controls.nextPage = nextPage;
  controls.jumpTo = jumpTo;
  controls.fullScreen = onFullScreen;
  controls.nextFile = NextFile.action;
  controls.prevFile = PrevFile.action;
  controls.file = file;
  controls.showLoop = (show, x, y) => (showLoop = { show, x, y });

  $: progress = file.Duration ? `${+file.CurrentPos + 1}/${file.Duration}` : "Loading";

  $: if (!webtoon) {
    disconnectObvrs(viewer);
  }

  //reload on file change
  $: if (file.Id && file.Id !== viewerState.lastfId) {
    controls.file = file;
    viewerState.jumping = webtoon;
    viewerState.loading = false;
    images = [];
    indices = [];
    loadImages(file.CurrentPos - 1, 8);
  }

  afterUpdate(() => {
    if (file.Id !== viewerState.lastfId) {
      viewerState.lastfId = file.Id;
      scrollInView(file.CurrentPos);
      PageObserver(changePages, viewer);
      onShow();
    }
    if (webtoon) scrollImageLoader(loadImages, viewer);
  });

  let elements = [];
  const changeOpacity = (op) => elements.forEach((el) => (el.style.opacity = op));

  let tout2;
  const onShow = () => {
    changeOpacity(1);
    clearTimeout(tout2);
    tout2 = setTimeout(() => changeOpacity(0), 2000);
  };

  const onConnect = () => loadImages(file.CurrentPos - 1, 8);
  const onDisconnect = () => {
    viewerState.loading = false;
    if (webtoon) {
      scrollImageLoader(loadImages, viewer);
      PageObserver(changePages, viewer);
    }
  };

  const onError = ({ Id, error: err }) => {
    if (Id === file.Id) {
      viewerState.loading = false;
      error = err;
    }
  };

  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);
  socket.on("image-loaded", onImageData);
  socket.on("manga-error", onError);

  onMount(() => {
    SkipForward.action = nextPage;
    SkipBack.action = prevPage;
    GotoStart.action = () => jumpTo(0);
    GotoEnd.action = () => jumpTo(file.Duration);
    Fullscreen.action = onFullScreen;
    ToggleControlBar.action = (e) => {
      e.preventDefault();
      updateToggleMenu();
    };
    elements = [...document.querySelectorAll("#btn-playlist, .fullscreen-progress, .info")];
    document.addEventListener("touchmove", onShow);
    document.addEventListener("mousemove", onShow);
    return () => {
      socket.off("connect", onConnect);
      socket.off("image-loaded", onImageData);
      socket.off("disconnect", onDisconnect);
      socket.off("manga-error", onError);

      ToggleControlBar.action = null;
      Fullscreen.action = null;
      document.removeEventListener("touchmove", onShow);
      document.removeEventListener("mousemove", onShow);
    };
  });

  $: {
    $ConfigStore.Viewer.manga.webtoon = webtoon;
    updateConfig($ConfigStore);
  }

  $: if (file.CurrentPos) onShow();
  $: webtoon = isManhwa;
</script>

<div id="manga-viewer" tabIndex="-1" class:hide={$ToggleMenu}>
  <span class="m-loading" class:show-loading={viewerState.loading}>
    <Icons name="sync" box="0 0 512 512" />
  </span>
  <span class="fullscreen-progress">
    <Icons name="stickynote" />
    {progress}
  </span>
  {#if error}
    <div class="error-msg">{error}</div>
  {/if}
  <div class="viewer" class:isFullscreen>
    <div
      class="img-current scrollable"
      class:webtoon-img={webtoon}
      style={`width: ${config.width}%;`}
      on:touchstart|passive={onTouchStart}
      on:touchend|passive={onTouchEnd}
      on:mousedown={onTouchStart}
      on:mouseup={onTouchEnd}
      on:touchmove|passive={onTouchMove}
    >
      {#if !webtoon}
        <img
          class:empty-img={!images[file.CurrentPos]}
          style="object-fit: {config.imgAbjust}"
          src={images[file.CurrentPos] && "data:img/jpeg;base64, " + images[file.CurrentPos]}
          alt={`Loading... Image ${file.CurrentPos ? file.CurrentPos + 1 : ""}`}
        />
      {:else}
        {#each Array(file?.Duration).fill(null) as _, i}
          <img
            class:empty-img={!images[i]}
            id={i}
            style="object-fit: {config.imgAbjust}"
            src={images[i] ? "data:img/jpeg;base64, " + images[i] : ""}
            alt={`Loading... Image ${i + 1}`}
          />
        {/each}
      {/if}
    </div>
  </div>
  <div class="controls usn">
    <span class="h-p popup-msg" on:click={returnTo} data-title="Close">
      <Icons name="timescircle" />
    </span>
    <span class="web-toon" on:click={() => (webtoon = !webtoon)}>
      Read <Icons name={webtoon ? "arrowdown" : "arrowright"} color="black" />
    </span>
    <span class="prev-page" on:click={prevPage}>
      <Icons name="arrowcircleleft" />
    </span>
    <span class="current-page">
      <form action="" on:submit|preventDefault={jumpToPage}>
        <input
          name="page-selector"
          type="number"
          bind:this={inputPage}
          value={""}
          placeholder={progress}
          on:focus={onInputFocus}
          on:blur={onInputBlur}
          on:keydown|stopPropagation
        />
      </form>
    </span>
    <span class="next-page" on:click={nextPage}>
      <Icons name="arrowcircleright" />
    </span>
    <span class="config">
      <MangaConfig {ToggleMenu} />
    </span>
    {#if User.role.includes("Manager")}
      <span class="remove" on:click={removeFile}><Icons name="trash" color="red" /></span>
    {/if}
  </div>
</div>

<style>
  .controls :global(svg:not(.icon-eye)) {
    width: 36px;
    height: 30px;
    top: -2px;
  }
  .remove :global(svg.icon-trash) {
    width: 30px;
    height: 30px;
    top: -2px;
  }

  .controls :global(svg.icon-eye) {
    top: -17px;
    fill: black;
    right: -46px;
  }
  .controls {
    position: fixed;
    right: 0px;
    left: 0;
    bottom: 0;
    margin: 0;
    display: flex;
    justify-content: center;
    height: 34px;
    background-color: rgba(0, 0, 0, 0.8);
    padding: initial;
    transition: 0.3s all;
    z-index: 4;
  }

  #manga-viewer .controls .web-toon {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    cursor: pointer;
    color: black;
    font-weight: bold;
    transition: all 0.2s;
    margin: 0;
    background-color: white;
    border-radius: 0.25rem;
    padding: 0;
    margin-top: 3px;
    line-height: 0.9;
    width: 75px;
    height: 28px;
  }

  .controls .web-toon :global(svg) {
    top: 0;
    height: 23px;
    width: 30px;
  }

  .config {
    position: relative;
  }
  .fullscreen-progress {
    display: block;
    position: fixed;
    opacity: 0;
    top: 0;
    left: 0px;
    padding: 2px 8px;
    border-top-right-radius: 0.25rem;
    background-color: rgba(0, 0, 0, 0.8);
    opacity: 1;
    transition: 0.5s all;
    font-size: 16px;
    z-index: 4;
    user-select: none;
  }
  #manga-viewer .webtoon-img img[alt] {
    position: relative;
    background-color: grey;
  }

  /***************************Manga Viewer**************************************/

  #manga-viewer {
    position: relative;
    height: 100%;
    width: 100%;
    outline: none;
  }

  #manga-viewer .viewer {
    position: relative;
    display: flex;
    justify-content: center;
    height: 100%;
    width: 100%;
    padding-bottom: 33px;
  }
  #manga-viewer .img-current {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 65%;
    min-height: 100%;
    height: 100%;
    outline: none;
  }

  #manga-viewer .img-current img {
    -webkit-user-drag: none;
    width: 100%;
    max-height: 100%;
    max-width: 100%;
    position: relative;
    object-fit: cover;
  }

  #manga-viewer .scrollable {
    display: flex;
    justify-content: initial;
  }

  #manga-viewer .webtoon-img {
    flex-direction: column;
  }

  #manga-viewer .webtoon-img img {
    height: auto;
    width: 100%;
    max-height: initial;
  }

  #manga-viewer .img-current .empty-img {
    position: relative;
    color: black;
    min-height: 100%;
    min-width: 400px;
  }
  .empty-img:not(:last-child) {
    border-bottom: 1px solid black;
  }

  #manga-viewer .empty-img:before {
    display: inline-block;
    position: absolute;
    top: 0;
    left: 0;
    content: " ";
    height: 100%;
    width: 100%;
    z-index: 1;
    background-color: rgb(218, 214, 214);
  }

  #manga-viewer .empty-img:after {
    content: attr(alt);
    position: absolute;
    top: 46%;
    left: calc(50% - 120px);
    font-size: 30px;
    z-index: 2;
  }

  #manga-viewer .controls > span {
    padding: 4px 8px;
    max-height: initial;
  }

  #manga-viewer .current-page input {
    position: relative;
    top: -1px;
    height: 26px;
    max-width: 80px;
    text-align: center;
    min-width: 70px;
    outline: none;
    border: none;
    border-radius: 0.25rem;
  }

  #manga-viewer .viewer.isFullscreen {
    padding: 0;
  }

  :fullscreen #manga-viewer.hide .controls {
    opacity: 0;
  }

  :fullscreen #manga-viewer.hide .controls span {
    transform: translateY(34px);
    transition: 0.3s all;
  }
  img[alt]:after {
    text-align: center;
    top: 50%;
  }

  #manga-viewer.hide .controls {
    bottom: -34px;
  }

  #manga-viewer.hide .viewer {
    padding: 0;
  }

  .webtoon-img img:last-child {
    margin-bottom: 80px;
  }

  .error-msg {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 43%;
    left: 16%;
    z-index: 99;
    width: 68%;
    min-height: 60px;
    padding: 2px 4px;
    border-radius: 0.25rem;
    background: firebrick;
    font-size: 1.3rem;
    pointer-events: none;
  }

  .m-loading {
    display: none;
    position: fixed;
    left: 4px;
    bottom: 36px;
    z-index: 99;
    background-color: rgba(0, 0, 0, 0.582);
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }

  .m-loading :global(svg) {
    top: 3px;
    left: 6px;
    width: 18px;
    height: 24px;
    fill: hwb(165 2% 0%);
    animation: rotate 3s linear infinite;
    transition: all 0.3s;
  }

  .m-loading.show-loading {
    display: inline-block;
  }

  #manga-viewer.hide .m-loading {
    bottom: 2px;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @media screen and (max-width: 900px) {
    #manga-viewer .img-current {
      transform: initial;
      width: 100% !important;
    }
    #manga-viewer .controls > span {
      padding: 4px 5px;
    }
    #manga-viewer .img-current .empty-img {
      width: 100%;
    }
    #manga-viewer .img-current.webtoon-img img:not(.empty-img) {
      height: auto;
    }

    .error-msg {
      left: 0;
      border-radius: 0;
      width: 100%;
    }
  }
</style>
