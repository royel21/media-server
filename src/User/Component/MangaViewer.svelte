<script>
  import {
    beforeUpdate,
    onDestroy,
    getContext,
    createEventDispatcher
  } from "svelte";
  import { IndexOfUndefined } from "../pages/Util";

  export let file;
  export let KeyMap;
  const { NextFile, PrevFile, Fullscreen, SkipForward, SkipBack } = KeyMap;
  const socket = getContext("socket");
  const dispatch = createEventDispatcher();

  let webtoon;
  let progress = `${file.CurrentPos + 1}/${file.Duration}`;
  let images = [file.Duration];
  let tempImages = [];
  let loading = false;
  let lastfId;
  const loadImages = (pg, toPage, dir = 1) => {
    loading = true;
    let i = IndexOfUndefined(images, pg, dir, file.Duration);
    if (i >= file.Duration || i <= -1) return;
    if (dir < 0) {
      i = i - toPage;
      toPage = pg;
    }
    i = i < 0 ? 0 : i;
    console.time("emit");
    socket.emit("loadzip-image", { Id: file.Id, fromPage: i, toPage });
  };

  socket.on("image-loaded", data => {
    if (!data.error) {
      images[data.page] = data.img;
    }
  });

  socket.on("m-finish", () => {
    loading = false;
    console.timeEnd("emit");
  });

  const prevPage = () => {
    let pg = file.CurrentPos - 1;
    if (pg > -1) {
      file.CurrentPos = pg;
      if (!images[pg - 10] && !loading) {
        loadImages(pg, 10, -1);
      }
    } else {
      images = [];
      PrevFile.action();
    }
  };

  const nextPage = () => {
    let pg = file.CurrentPos + 1;
    if (pg < file.Duration) {
      file.CurrentPos = pg;
      if (!images[pg + 10] && !loading) {
        loadImages(pg, 10);
      }
    } else {
      images = [];
      NextFile.action();
    }
  };

  const jumpToPage = () => {};

  const returnTo = () => dispatch("returnBack");

  onDestroy(() => {
    console.log("destroy");
    delete socket._callbacks["$image-loaded"];
    delete socket._callbacks["$m-finish"];
  });

  SkipForward.action = nextPage;
  SkipBack.action = prevPage;
  const onCancelContextM = e => {
    e.preventDefault();
    return false;
  };

  $: progress = `${parseInt(file.CurrentPos) + 1}/${file.Duration}`;
  $: if (file.Id !== lastfId) {
    images = [];
    lastfId = file.Id;
    console.time("emit");
    // socket.emit("loadzip-image", {
    //   Id: file.Id,
    //   fromPage: file.CurrentPos - 5 < 0 ? 0 : file.CurrentPos - 5,
    //   toPage: 10
    // });
  }

  $: if (webtoon) {
    // console.log(images, file.Duration);
  }
</script>

<style>
  #manga-viewer {
    position: relative;
    height: 100%;
    width: 100%;
    outline: none;
  }
  #manga-viewer .img-current,
  #manga-viewer .viewer {
    height: 100%;
    width: 100%;
  }

  #manga-viewer .img-current {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    transform: scaleX(0.65);
    outline: none;
    height: calc(100% - 34px);
    transition: 0.3s all;
  }

  #manga-viewer .webtoon-img {
    min-height: 100%;
  }

  #manga-viewer .img-current img {
    height: 100%;
  }

  #manga-viewer .webtoon-img img {
    height: auto;
    min-height: 100%;
  }

  #manga-viewer .empty-img {
    position: relative;
    color: black;
  }
  .empty-img:before {
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
    left: calc(50% - 108px);
    font-size: 30px;
    z-index: 2;
  }

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
  }

  .fullscreen-progress {
    display: none;
    position: absolute;
    opacity: 0;
    bottom: 0;
    left: 5px;
    padding: 2px 8px;
    border-top-right-radius: 0.25rem;
    background-color: rgba(0, 0, 0, 0.8);
    opacity: 1;
    transition: 0.5s all;
    font-size: 16px;
  }

  :fullscreen #manga-viewer .controls {
    opacity: 0;
  }

  :fullscreen #manga-viewer .controls span {
    transform: translateY(34px);
    transition: 0.3s all;
  }

  :fullscreen #manga-viewer .controls:hover span {
    transform: translateY(0px);
  }

  :fullscreen #manga-viewer .controls:hover {
    opacity: 1;
  }
  :fullscreen .fullscreen-progress {
    display: inline-block;
  }
  #manga-viewer .controls > span {
    padding: 4px 8px;
    max-height: initial;
  }

  #manga-viewer i {
    font-size: 25px;
    transition: 0.1s all;
  }

  #manga-viewer .current-page {
    max-width: 90px;
  }

  #manga-viewer .current-page input {
    height: 25px;
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

  @media screen and (max-width: 600px) {
    #manga-viewer .img-current {
      transform: initial;
    }
    #manga-viewer .controls > span {
      padding: 4px 5px;
    }
    #manga-viewer .img-current:not(.webtoon-img) img,
    #manga-viewer .img-current img {
      height: 100%;
      min-height: initial;
      color: white;
    }
  }
</style>

<div id="manga-viewer" tabIndex="0">
  <span class="fullscreen-progress">{progress}</span>
  <div class="viewer">
    <div class={'img-current ' + (webtoon ? 'webtoon-img' : '')}>
      {#if !webtoon}
        <img
          class:empty-img={!images[file.CurrentPos]}
          src={images[file.CurrentPos] && 'data:img/jpeg;base64, ' + images[file.CurrentPos]}
          alt="Loading Image" />
      {:else}
        {#each Array(file.Duration).fill() as _, i}
          <img
            class:current-image={i === file.CurrentPos}
            class:empty-img={!images[i]}
            id={i}
            src={images[i] ? 'data:img/jpeg;base64, ' + images[i] : ''}
            alt="Loading Image" />
        {/each}
      {/if}
    </div>
  </div>
  <div class="controls">
    <span id="hide-player" on:click={returnTo}>
      <i class="far fa-times-circle popup-msg" data-title="Close" />
    </span>
    <span class="web-toon">
      <input type="checkbox" name="" id="webtoon" bind:checked={webtoon} />
      <label for="webtoon">
        {webtoon ? 'List' : 'Pages'}
        <i class="fas fa-eye" />
      </label>
    </span>
    <span class="prev-page" on:click={prevPage}>
      <i class="fa fa-arrow-circle-left" />
    </span>
    <span class="current-page" on:click={jumpToPage}>{progress}</span>
    <span class="next-page" on:click={nextPage}>
      <i class="fa fa-arrow-circle-right" />
    </span>
    <span class="btn-fullscr" on:click={Fullscreen.action}>
      <i class="fas fa-expand-arrows-alt popup-msg" data-title="Full Screen" />
    </span>
  </div>
</div>
