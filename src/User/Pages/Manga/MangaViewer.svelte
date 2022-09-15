<script>
  import { onDestroy, getContext, createEventDispatcher, afterUpdate } from "svelte";

  import { clamp, isMobile, setfullscreen } from "../Utils";
  import { scrollInView, getEmptyIndex } from "./Utils";
  import { PageObserver, disconnectObvrs, scrollImageLoader } from "./Observers";
  import { onTouchStart, onTouchEnd, onTouchMove, default as controls } from "./MangaTouch";

  import { ToggleMenu } from "../../../ShareComponent/ToggleMenu";
  import MangaConfig from "./MangaConfig.svelte";

  export let file;
  export let KeyMap;
  export let viewer;
  const { NextFile, PrevFile, Fullscreen, SkipForward, SkipBack } = KeyMap;
  const socket = getContext("socket");
  const dispatch = createEventDispatcher();

  let webtoon = localStorage.getItem("webtoon") === "true";
  let config = localStorage.getObject("mangaConfig") || { width: 65, imgAbjust: "fill" };
  let progress = `${file.CurrentPos + 1}/${file.Duration}`;
  let images = [file.Duration];
  let imgContainer;
  let inputPage;

  let viewerState = {
    isLoading: false,
    jumping: false,
    lastId: file?.Id,
  };
  //emptyImage observer
  const loadImages = (pg, toPage, dir = 1) => {
    if (!viewerState.loading && !isNaN(pg) && !isNaN(toPage)) {
      const indices = getEmptyIndex(images, pg, toPage, dir || 1, file.Duration);
      if (indices.length) {
        viewerState.loading = true;
        socket.emit("loadzip-image", { Id: file.Id, indices });
      } else if (viewerState.jumping) {
        scrollInViewAndSetObserver();
      }
    }
  };

  const changePage = (dir, action) => {
    let pg = file.CurrentPos + dir;
    if (pg > -1 && pg < file.Duration) {
      if (webtoon) {
        scrollInView(pg);
      } else if (!viewerState.loading && !images[pg + 6 * dir]) {
        loadImages(pg, 11, dir);
      }
      file.CurrentPos = pg;
    } else {
      viewerState.jumping = true;
      disconnectObvrs(imgContainer);
      action();
    }
  };

  const prevPage = () => changePage(-1, PrevFile.action);
  const nextPage = () => changePage(1, NextFile.action);

  const jumpTo = (val) => {
    val = clamp(val, 1, file.Duration);
    file.CurrentPos = val - 1;
    if (webtoon) {
      viewerState.jumping = true;
      disconnectObvrs(imgContainer);
    }
    loadImages(val - 5, 10);
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

  const setPage = (pg) => {
    file.CurrentPos = pg;
  };

  let scrollInViewAndSetObserver = (delay = 0) => {
    let tout = setTimeout(() => {
      scrollInView(file.CurrentPos);
      PageObserver(setPage, imgContainer, loadImages, viewerState);
      scrollImageLoader(loadImages, imgContainer, file.CurrentPos);
      clearTimeout(tout);
    }, delay);
  };

  Fullscreen.action = () => {
    if (webtoon) {
      disconnectObvrs(imgContainer);
      setfullscreen(viewer);
      scrollInViewAndSetObserver(100);
    } else {
      setfullscreen(viewer);
    }
  };

  const onConfig = (cfg) => (config = cfg);

  const onImageData = (data) => {
    if (data.id === file.Id) {
      if (!data.last) {
        images[data.page] = data.img;
      } else {
        viewerState.loading = false;
        if (viewerState.jumping && webtoon) {
          viewerState.jumping = false;
          scrollInViewAndSetObserver(200);
        }
      }
    } else {
      viewerState.loading = false;
    }
  };

  const onConnect = () => loadImages(file.CurrentPos - 2, 8);
  const onDisconnect = () => (viewerState.loading = false);

  socket.on("connect", onConnect);
  socket.on("image-loaded", onImageData);
  socket.on("disconnect", onDisconnect);

  SkipForward.action = nextPage;
  SkipBack.action = prevPage;

  controls.prevPage = prevPage;
  controls.nextPage = nextPage;
  controls.jumpTo = jumpTo;
  controls.fullScreen = Fullscreen.action;
  controls.nextFile = NextFile.action;
  controls.prevFile = PrevFile.action;
  controls.file = file;

  $: progress = `${parseInt(file.CurrentPos) + 1}/${file.Duration}`;

  $: {
    if (!webtoon) disconnectObvrs(imgContainer);
    controls.webtoon = webtoon;
  }

  //reload on file change
  $: if (file.Id !== viewerState.lastfId) {
    viewerState.jumping = true;
    viewerState.loading = false;
    images = [];
    if (imgContainer) disconnectObvrs(imgContainer);
    loadImages(file.CurrentPos - 2, 8);
    controls.file = file;
  }

  afterUpdate(() => {
    if (file.Id !== viewerState.lastfId) {
      viewerState.lastfId = file.Id;
      scrollInView(file.CurrentPos);
    }
  });

  onDestroy(() => {
    disconnectObvrs(imgContainer);
    socket.off("image-loaded", onImageData);
    socket.off("disconnect", onDisconnect);
    socket.off("connect", onConnect);
  });

  $: localStorage.setItem("webtoon", webtoon);
  $: console.log("width: ", config.width);
</script>

<div id="manga-viewer" tabIndex="0" class:hide={$ToggleMenu}>
  <span class="fullscreen-progress">
    <i class="fas fa-sticky-note" />
    {progress}
  </span>
  <div class="viewer">
    <div
      on:touchstart|passive={onTouchStart}
      on:touchend|passive={onTouchEnd}
      on:mousedown={onTouchStart}
      on:mouseup={onTouchEnd}
      on:touchmove|passive={onTouchMove}
      class="img-current"
      class:webtoon-img={webtoon}
      bind:this={imgContainer}
      style={`width: ${isMobile ? 100 : config.width}%;`}
      tabindex="0"
    >
      {#if !webtoon}
        <img
          class:empty-img={!images[file.CurrentPos]}
          style="object-fit: {config.imgAbjust}"
          src={images[file.CurrentPos] && "data:img/jpeg;base64, " + images[file.CurrentPos]}
          alt="Loading..."
        />
      {:else}
        {#each Array(file.Duration).fill() as _, i}
          <img
            class:empty-img={!images[i]}
            id={i}
            style="object-fit: {config.imgAbjust}"
            src={images[i] ? "data:img/jpeg;base64, " + images[i] : ""}
            alt="Loading... Please Wait"
          />
        {/each}
      {/if}
    </div>
  </div>
  <div class="controls">
    <span id="hide-player" on:click={returnTo}>
      <i class="far fa-times-circle popup-msg" data-title="Close" />
    </span>
    <span class="web-toon">
      <input type="checkbox" name="webtoon" id="webtoon" bind:checked={webtoon} />
      <label for="webtoon">
        {webtoon ? "List" : "Pages"}
        <i class="fas fa-eye" />
      </label>
    </span>
    <span class="prev-page" on:click={prevPage}>
      <i class="fa fa-arrow-circle-left" />
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
      <i class="fa fa-arrow-circle-right" />
    </span>
    <span class="config">
      <MangaConfig {onConfig} {ToggleMenu} />
    </span>
    <span class="btn-fullscr" on:click={Fullscreen.action}>
      <i class="fas fa-expand-arrows-alt popup-msg" data-title="Full Screen" />
    </span>
  </div>
</div>

<style>
  .controls {
    position: fixed;
    right: 0px;
    left: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    height: 34px;
    background-color: rgba(0, 0, 0, 0.8);
    padding: initial;
    transition: 0.3s all;
    z-index: 4;
    pointer-events: all;
    user-select: none;
  }

  #webtoon {
    display: none;
  }

  #webtoon + label {
    display: inline-block;
    position: relative;
    cursor: pointer;
    color: black;
    font-weight: bold;
    transition: all 0.2s;
    margin: 0;
    background-color: white;
    border-radius: 0.25rem;
    padding: 6px 25px 6px 5px;
    line-height: 0.9;
    width: 76px;
    height: 26px;
  }

  #webtoon + label i {
    position: absolute;
    top: 6px;
    right: 4px;
    font-size: 16px;
    font-weight: 600;
  }
  .config {
    position: relative;
  }
  .fullscreen-progress {
    display: block;
    position: absolute;
    opacity: 0;
    bottom: 0;
    left: 4px;
    padding: 2px 8px;
    border-top-right-radius: 0.25rem;
    background-color: rgba(0, 0, 0, 0.8);
    opacity: 1;
    transition: 0.5s all;
    font-size: 16px;
    z-index: 4;
  }
  #manga-viewer .fa-sticky-note {
    font-size: 16px;
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
    display: flex;
    justify-content: center;
    height: 100%;
    width: 100%;
    padding-top: 37px;
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

  #manga-viewer .webtoon-img {
    display: flex;
    flex-direction: column;
    justify-content: initial;
    overflow-y: auto;
    overflow-x: hidden;
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
    min-width: 600px;
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
    content: "Loading Images";
    position: absolute;
    top: 46%;
    font-size: 30px;
    z-index: 2;
  }

  #manga-viewer .controls > span {
    padding: 4px 8px;
    max-height: initial;
  }

  #manga-viewer i {
    font-size: 25px;
    transition: 0.1s all;
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

  :fullscreen #manga-viewer .viewer {
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

  @media screen and (max-width: 600px) {
    #manga-viewer .img-current {
      transform: initial;
      width: 100%;
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
  }
</style>
