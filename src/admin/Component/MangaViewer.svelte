<script>
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import Icons from "src/icons/Icons.svelte";
  import { afterUpdate, getContext, onMount } from "svelte";
  import { getSecuences } from "./util";
  import { FilesStore, MangaRegex } from "../Store/FilesStore";
  import { setfullscreen } from "src/user/Pages/pagesUtils";
  import { map } from "../Utils";

  const CLOSE = 88;
  const PREV_FILE = 37;
  const NEXT_FILE = 39;
  const FULLSCREEN = 13;
  const socket = getContext("socket");

  let file = {};
  let files = [];

  let error = "";
  let current = files.findIndex((f) => f.Id === file.Id);
  let indices = [];
  let currentImg = 0;
  let container;
  let isLoading = false;
  let data = { total: 0, images: [] };
  let modalRef;
  let isFullScreen = false;
  let imgs = [];
  let jumping = false;
  let mangaDir = true;

  let state = {
    jumping: false,
    mangaDir: false,
    changingPage: false,
    pageObserver: null,
  };

  FilesStore.subscribe((data) => {
    if (MangaRegex.test(data.file.Name)) {
      file = data.file;
      files = data.files;
    }
  });

  const hide = () => {
    FilesStore.set({ file: {}, files: [] });
    file = {};
    files = [];
  };

  let observerTimeOut;

  const PageObserver = (scroll = false, time = 100) => {
    if (mangaDir) {
      state.pageObserver?.disconnect();
      imgs = container.querySelectorAll("img");

      if (scroll) {
        imgs[currentImg]?.scrollIntoView();
      }
      clearTimeout(observerTimeOut);
      observerTimeOut = setTimeout(() => {
        state.pageObserver = new IntersectionObserver(
          (entries) => {
            if (state.changingPage) {
              return (state.changingPage = false);
            }

            if (imgs.length) {
              for (let entry of entries) {
                if (entry.isIntersecting) {
                  currentImg = +entry.target.id;
                  if (!isLoading) loadImg();
                }
              }
            }
          },
          { root: container, threshold: 0.01 }
        );
        imgs.forEach((lazyImg) => {
          state.pageObserver.observe(lazyImg);
        });
      }, time);
    }

    return state.pageObserver;
  };

  const changePage = (val, dir) => {
    if (val > -1 && val < data.total) {
      currentImg = val;
      isLoading = true;
      if (mangaDir) {
        state.changingPage = true;
        PageObserver(true);
      }
      loadImg(1);
    } else if (dir) {
      changeFile(dir);
    }
  };

  let changeDirTimeOut;
  const changeMangaDir = () => {
    mangaDir = !mangaDir;
    if (mangaDir) {
      clearTimeout(changeDirTimeOut);
      changeDirTimeOut = setTimeout(() => {
        PageObserver(true, 100);
      }, 100);
    } else {
      state.pageObserver.disconnect();
    }
  };

  const getEmptyIndex = function (arr, from, count, dir) {
    let index = Math.max(0, from);
    let items = [];
    while (items.length < count && index > 0) {
      if (arr[index] === undefined) {
        items.push(index);
      }
      index += dir;
    }
    return items;
  };

  const loadImg = (dir) => {
    isLoading = true;
    const toLoad = getEmptyIndex(data.images, currentImg, 5, dir, data.total);
    socket.emit("loadzip-image", { ...file, indices: toLoad });
  };

  const changeFile = (next) => {
    const nextIndex = current + next;
    if (nextIndex > -1 && nextIndex < files.length) {
      file = files[nextIndex];
      current = nextIndex;
    }
  };

  const onSelectImg = ({ target }) => {
    target.value = currentImg + 1;
  };

  const jumpTop = ({ target }) => {
    changePage(map(target.value - 1, 0, data.total - 1));
  };

  const onChangeFile = ({ target: { id } }) => {
    let next = id === "next" ? 1 : -1;
    changeFile(next);
  };

  const onkeydown = ({ keyCode, ctrlKey }) => {
    if (keyCode === CLOSE) hide();
    if (ctrlKey && keyCode === PREV_FILE) {
      changeFile(-1);
    }
    if (ctrlKey && keyCode === NEXT_FILE) {
      changeFile(1);
    }
    if (keyCode === PREV_FILE) {
      changePage(currentImg - 1, -1);
    }
    if (keyCode === NEXT_FILE) {
      changePage(currentImg + 1, 1);
    }

    if (keyCode === FULLSCREEN) {
      onFullScreen();
    }
  };

  const onImageCount = ({ total }) => {
    if (total) data.total = total;
  };
  // receive data from server
  const onImageData = (d) => {
    if (d.img && d.id === file.Id) {
      indices.push(d.page);
      data.images[d.page] = d.img;
    }

    if (d.last) {
      setTimeout(() => {
        jumping = false;
        isLoading = false;
      }, 100);
    }
  };

  const onFullScreen = () => {
    state.pageObserver?.disconnect();
    isLoading = true;
    isFullScreen = setfullscreen(modalRef);
    setTimeout(() => {
      PageObserver(true);
    }, 150);
    isLoading = false;
    container.focus();
  };

  const onDisconnect = () => {
    isLoading = false;
    jumping = false;
  };

  onMount(() => {
    socket.on("zip-data", onImageCount);
    socket.on("image-loaded", onImageData);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("disconnect", onDisconnect);
      socket.off("zip-data", onImageCount);
      socket.off("image-loaded", onImageData);
    };
  });

  afterUpdate(() => {
    if (file) {
      setTimeout(() => {
        container?.focus();
      }, 300);
    }
  });

  $: current = files.findIndex((f) => f.Id === file.Id);

  $: if (file.Id && data.Id !== file.Id) {
    data = { ...file, total: 0, images: [] };
    currentImg = 0;
    isLoading = true;
    socket.emit("loadzip-image", { ...file, imageCount: true, indices: getSecuences(0, 5) });
    setTimeout(() => {
      PageObserver(true, 100);
    }, 100);
  }
</script>

<div class="viewer" class:hidden={!files.length} class:isFullScreen class:webtoon={!mangaDir}>
  <Dialog bind:ref={modalRef} cancel={hide} btnOk="" btnCancer="" keydown={onkeydown} canDrag={true}>
    <span slot="modal-header" class="f-name"><span>{file.Name}</span></span>
    <div class="manga-container" bind:this={container} tabindex="-1">
      {#if mangaDir}
        {#each Array(data.total).fill(null) as _, i}
          <img
            class:empty-img={!data.images[i]}
            id={i}
            src={data.images[i] ? "data:img/jpeg;base64, " + data.images[i] : ""}
            alt={`Loading... Image ${i + 1}`}
          />
        {/each}
      {:else}
        <img
          class:empty-img={!data.images[currentImg]}
          src={data.images[currentImg] ? "data:img/jpeg;base64, " + data.images[currentImg] : ""}
          alt={`Loading... Image ${currentImg + 1}`}
        />
      {/if}
      <span class="m-loading" class:show-loading={isLoading}>
        <Icons name="sync" box="0 0 512 512" />
      </span>
    </div>
    <div class="error">{error}</div>
    <div class="time-progress" on:mousedown|stopPropagation on:touchstart|passive|stopPropagation>
      {#if files.length > 1}
        <span class="files-count">{`${current + 1}/${files.length}`}</span>
      {/if}
      <span class="manga-dir btn-play" class:rotate={!mangaDir} on:click={changeMangaDir}>
        Read <Icons name="arrowupdown" box="0 0 320 512" />
      </span>
      <span id="prev" class="btn-play" on:click={onChangeFile}>
        <Icons name="arrowcircleleft" box="0 0 512 512" />
      </span>
      <span class="img-selector btn-play">
        <input
          class="input"
          type="number"
          min="1"
          max={data.total}
          on:change={jumpTop}
          placeholder="{currentImg + 1}/{data.total}"
          on:focus={onSelectImg}
          on:blur={({ target }) => (target.value = "")}
          on:keydown|stopPropagation
        />
      </span>
      <span id="next" class="btn-play" on:click={onChangeFile}>
        <Icons name="arrowcircleright" box="0 0 512 512" />
      </span>
      <span class="btn-fullscreen btn-play" on:click={onFullScreen}>
        <Icons name="expandarrow" box="0 0 512 512" />
      </span>
      <span class="close btn-play" on:click={() => hide()}>
        <Icons name="timescircle" box="0 0 512 512" />
      </span>
    </div>
  </Dialog>
</div>

<style>
  .viewer :global(.modal) {
    height: 640px;
    width: 460px;
    max-width: 99%;
    max-height: 90%;
    background-color: black;
    overflow: hidden;
  }

  .viewer.isFullScreen :global(.modal) {
    border: none;
  }

  .f-name {
    white-space: nowrap;
    overflow: hidden;
    padding: 0 5px;
  }
  .viewer :global(form) {
    height: 100%;
  }
  .viewer :global(.modal-body) {
    height: calc(100% - 33px);
  }
  .manga-container {
    position: relative;
    height: calc(100% - 28px);
    max-height: 100%;
    min-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    overflow-x: hidden;
    user-select: none;
  }

  .webtoon .manga-container {
    flex-direction: row;
  }

  .manga-container img {
    width: 100%;
    pointer-events: none;
    object-fit: fill;
  }
  .webtoon img {
    object-fit: fill;
    min-height: initial;
    max-height: 100%;
    min-width: 100%;
  }

  .manga-container .empty-img {
    min-height: 100%;
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
  }
  .empty-img:after {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #fff;
    font-family: "Helvetica";
    font-weight: 700;
    line-height: 2;
    background-color: black;
    content: attr(alt);
    border-bottom: 1px solid;
  }
  .error {
    position: absolute;
  }

  .viewer :global(.modal-footer) {
    display: none;
  }

  .viewer :global(.modal-body) {
    padding: 0;
  }

  .time-progress {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 28px;
    border-top: 1px solid;
  }

  .files-count {
    position: absolute;
    top: 1px;
    left: 4px;
    display: inline-block;
    border-radius: 0.25rem;
    padding: 0 5px;
    background-color: rgba(0, 0, 0, 0.2);
    user-select: none;
  }

  .time-progress :global(svg) {
    pointer-events: none;
  }

  .time-progress .btn-play {
    margin: 0 10px;
  }

  .btn-play :global(svg) {
    top: 3px;
    cursor: pointer;
  }
  .close,
  .btn-fullscreen {
    position: absolute;
  }
  .btn-fullscreen {
    right: 30px;
  }
  .close {
    right: 0px;
  }

  .m-loading {
    display: none;
    position: absolute;
    left: 2px;
    bottom: 2px;
    z-index: 99;
    background-color: rgba(0, 0, 0, 0.582);
    width: 25px;
    height: 25px;
    border-radius: 50%;
  }

  .m-loading :global(svg) {
    top: 4px;
    left: 4px;
    width: 18px;
    height: 18px;
    fill: hwb(165 2% 0%);
    animation: rotate 3s linear infinite;
    transition: all 0.3s;
  }
  .img-selector {
    position: relative;
    top: -2px;
  }
  .img-selector .input {
    text-align: center;
    height: 92%;
  }

  .manga-dir {
    width: 64px;
    line-height: 1.6;
    cursor: pointer;
    user-select: none;
  }
  .manga-dir :global(svg) {
    height: 18px;
    width: 15px;
    margin-left: 2px;
  }
  .rotate :global(svg) {
    transform: rotate(90deg);
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  .show-loading {
    display: inline-block;
  }
  .m-loading.show-loading {
    display: inline-block;
  }
  @media screen and (max-width: 600px) {
    .viewer :global(.modal) {
      height: 490px;
      width: 340px;
    }
    .close,
    .btn-fullscreen {
      margin: 0;
    }
  }

  @media screen and (max-width: 700px) {
    .viewer .manga-container {
      height: calc(100% - 36px);
    }

    .time-progress {
      height: 36px;
    }

    .time-progress .btn-play {
      margin: 0 5px;
    }

    .btn-play :global(svg) {
      width: 20px;
      height: 20px;
    }

    .files-count {
      top: 5px;
    }

    .img-selector {
      height: 25px;
      position: relative;
      top: 0px;
    }
  }

  @media screen and (min-width: 700px) {
    .viewer.isFullScreen img {
      width: 100%;
    }
  }

  @media screen and (min-width: 1000px) {
    .viewer.isFullScreen img {
      width: 70%;
    }
  }

  @media screen and (min-width: 1200px) {
    .viewer.isFullScreen img {
      width: 65%;
    }
  }

  @media screen and (min-width: 1500px) {
    .viewer.isFullScreen img {
      width: 55%;
    }
  }

  @media screen and (min-width: 1700px) {
    .viewer.isFullScreen img {
      width: 50%;
    }
  }
</style>
