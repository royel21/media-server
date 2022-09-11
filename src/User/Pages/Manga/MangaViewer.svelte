<script>
  import { onDestroy, getContext, createEventDispatcher } from "svelte";

  import { setfullscreen } from "../Utils";
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
  let progress = `${file.CurrentPos + 1}/${file.Duration}`;
  let images = [file.Duration];
  let loading = false;
  let lastfId;
  let imgContainer;
  let isObserver = false;
  let inputPage;
  let jumping = false;
  let config = {
    width: window.innerWidth < 600 ? 100 : localStorage.getItem("mWidth") || 65,
    imgAbjust: "fill",
  };
  //emptyImage observer
  let indices = [];
  const loadImages = (pg, toPage, dir = 1) => {
    if (loading) return;
    indices = getEmptyIndex(images, pg, toPage, dir, file.Duration, indices);
    if (indices.length > 0) {
      socket.emit("loadzip-image", { Id: file.Id, indices });
      loading = true;
    } else if (jumping) {
      scrollInViewAndSetObserver();
    }
  };

  socket.on("image-loaded", (data) => {
    if (!data.last) {
      images[data.page] = data.img;
    } else {
      loading = false;
      indices = [];
      if (jumping && webtoon) {
        jumping = false;
        scrollInViewAndSetObserver(100);
      }
    }
  });

  const prevPage = () => {
    let pg = file.CurrentPos - 1;
    if (pg > -1) {
      if (webtoon) {
        scrollInView(pg);
      } else {
        if (!images[pg - 7] && !loading) {
          loadImages(pg, 8, -1);
        }
      }
      file.CurrentPos = pg;
    } else {
      jumping = true;
      PrevFile.action();
    }
  };

  const nextPage = () => {
    let pg = file.CurrentPos + 1;
    if (pg < file.Duration) {
      if (webtoon) {
        scrollInView(pg);
      } else {
        if (!images[pg + 7] && !loading) {
          loadImages(pg, 8);
        }
      }
      file.CurrentPos = pg;
    } else {
      jumping = true;
      disconnectObvrs(imgContainer);
      NextFile.action();
    }
  };

  const onInputFocus = () => {
    inputPage.value = file.CurrentPos + 1;
  };

  const onInputBlur = () => {
    inputPage.value = "";
  };
  const jumpToPage = (event) => {
    let val = parseInt(inputPage.value);
    if (isNaN(val)) return onInputFocus();
    val < 0 ? 0 : val >= file.Duration ? file.Duration - 1 : val;
    file.CurrentPos = val - 1;
    if (webtoon) {
      jumping = true;
      disconnectObvrs(imgContainer);
    }
    loadImages(val - 5, 10);
    onInputBlur();
  };
  const returnTo = () => dispatch("returnBack");

  SkipForward.action = nextPage;
  SkipBack.action = prevPage;

  const setPage = (pg) => {
    file.CurrentPos = pg;
  };

  let scrollInViewAndSetObserver = (delay = 0) => {
    let tout = setTimeout(() => {
      scrollInView(file.CurrentPos);
      PageObserver(setPage, imgContainer, loadImages);
      scrollImageLoader(loadImages, imgContainer, file.CurrentPos);
      clearTimeout(tout);
    }, delay);
  };

  Fullscreen.action = () => {
    if (webtoon) {
      disconnectObvrs(imgContainer);
      setfullscreen(viewer);
      scrollInViewAndSetObserver(200);
    } else {
      setfullscreen(viewer);
    }
  };

  const onConfig = ({ detail }) => {
    config = detail;
  };

  $: progress = `${parseInt(file.CurrentPos) + 1}/${file.Duration}`;

  $: if (file.Id !== lastfId) {
    jumping = true;
    images = [];
    lastfId = file.Id;
    if (imgContainer) {
      disconnectObvrs(imgContainer);
    }
    indices = getEmptyIndex(images, file.CurrentPos - 2, 8, 1, file.Duration);
    socket.emit("loadzip-image", {
      Id: file.Id,
      indices,
    });

    controls.file = file;
  }

  $: if (webtoon) {
    controls.webtoon = webtoon;
    if (!isObserver) {
      isObserver = true;
      scrollInViewAndSetObserver();
    }
  } else if (isObserver) {
    controls.webtoon = webtoon;
    isObserver = false;
    disconnectObvrs(imgContainer);
  }

  $: {
    localStorage.setItem("webtoon", webtoon);
  }

  controls.prevPage = prevPage;
  controls.nextPage = nextPage;
  controls.fullScreen = Fullscreen.action;
  controls.nextFile = NextFile.action;
  controls.prevFile = PrevFile.action;
  controls.file = file;
  onDestroy(() => {
    delete socket._callbacks["$image-loaded"];
    disconnectObvrs(imgContainer);
  });
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
      class={"img-current" + (webtoon ? " webtoon-img" : "")}
      bind:this={imgContainer}
      style="width: {config.width}%;"
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
          type="text"
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
      <MangaConfig {config} on:mconfig={onConfig} {ToggleMenu} />
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
    z-index: 1;
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
    z-index: 1;
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
