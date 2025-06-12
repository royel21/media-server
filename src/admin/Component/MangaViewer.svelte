<script>
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import Icons from "src/icons/Icons.svelte";
  import { getContext, onMount } from "svelte";
  import { getSecuences } from "./util";
  import { FilesStore, MangaRegex } from "../Store/FilesStore";

  const CLOSE = 88;
  const PREV_FILE = 37;
  const NEXT_FILE = 39;
  const socket = getContext("socket");

  let file = {};
  let files = [];

  let error = "";
  let current = files.findIndex((f) => f.Id === file.Id);
  let indices = [];
  let currentImg = 0;
  let container;
  let pageObserver;
  let isLoading = false;
  let data = { total: 0, images: [] };

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

  const PageObserver = () => {
    const imgs = container.querySelectorAll("img");
    pageObserver?.disconnect();

    pageObserver = new IntersectionObserver(
      (entries) => {
        if (imgs.length) {
          for (let entry of entries) {
            let img = entry.target;
            if (entry.isIntersecting) {
              const dir = currentImg > +img.id ? -1 : 1;
              currentImg = +img.id;

              let next = Math.max((currentImg + 3) * dir, 0);

              const needLoad = !data.images[next] || !data.images[currentImg];

              if (!isLoading && needLoad) {
                isLoading = true;
                const toLoad = getEmptyIndex(data.images, currentImg, 5, dir, data.total);
                socket.emit("loadzip-image", { ...file, indices: toLoad });
              }
            }
          }
        }
      },
      { root: container, threshold: 0.01 }
    );
    imgs.forEach((lazyImg) => {
      pageObserver.observe(lazyImg);
    });

    return pageObserver;
  };

  const changeFile = (next) => {
    const nextIndex = current + next;
    if (nextIndex > -1 && nextIndex < files.length) {
      file = files[nextIndex];
      current = nextIndex;
    }
  };

  const onChangeFile = ({ target: { id } }) => {
    let next = id === "next" ? 1 : -1;
    changeFile(next);
  };

  const onkeydown = ({ keyCode, ctrlKey }) => {
    if (keyCode === CLOSE) hide();
    if (keyCode === NEXT_FILE) {
      changeFile(1);
    }

    if (keyCode === PREV_FILE) {
      changeFile(-1);
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
      isLoading = false;
    }
  };

  const onDisconnect = () => {
    isLoading = false;
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

  $: current = files.findIndex((f) => f.Id === file.Id);

  $: if (file.Id && data.Id !== file.Id) {
    data = { ...file, total: 0, images: [] };
    currentImg = 0;
    isLoading = true;
    socket.emit("loadzip-image", { ...file, imageCount: true, indices: getSecuences(0, 5) });
    container?.focus();
  }

  $: if (data.total) {
    PageObserver();
  }
</script>

<div class="viewer" class:hidden={!files.length}>
  <Dialog cancel={hide} btnOk="" btnCancer="" keydown={onkeydown} canDrag={true} background={false}>
    <span slot="modal-header" class="f-name">{file.Name}</span>
    <div class="manga-container" bind:this={container} tabindex="-1">
      {#each Array(data.total).fill(null) as _, i}
        <img
          class:empty-img={!data.images[i]}
          id={i}
          style="object-fit: contain"
          src={data.images[i] ? "data:img/jpeg;base64, " + data.images[i] : ""}
          alt={`Loading... Image ${i + 1}`}
        />
      {/each}
      <span class="m-loading" class:show-loading={isLoading}>
        <Icons name="sync" box="0 0 512 512" />
      </span>
    </div>
    <div class="error">{error}</div>
    <div class="time-progress" on:mousedown|stopPropagation on:touchstart|stopPropagation>
      {#if files.length > 1}
        <span class="files-count">{`${current + 1}/${files.length}`}</span>
      {/if}
      <span id="prev" class="btn-play" on:click={onChangeFile}>
        <Icons name="arrowcircleleft" />
      </span>
      <span id="next" class="btn-play" on:click={onChangeFile}>
        <Icons name="arrowcircleright" />
      </span>
      <span class="close btn-play" on:click={() => hide()}>
        <Icons name="timescircle" />
      </span>
      {#if data.total > 0}
        <span class="img-count">{currentImg + 1}/{data.total}</span>
      {/if}
    </div>
  </Dialog>
</div>

<style>
  .viewer :global(.modal-container .modal) {
    width: 540px;
    height: max-content;
    background-color: black;
    overflow: hidden;
  }
  .manga-container {
    position: relative;
    height: 600px;
    min-width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    overflow-x: hidden;
  }
  .manga-container img {
    height: auto;
    width: 100%;
    max-height: initial;
    user-select: none;
  }

  .manga-container .empty-img {
    position: relative;
    color: black;
    min-height: 100%;
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
    height: 28px;
  }

  .img-count,
  .time-progress > .files-count {
    position: absolute;
    top: 1px;
    left: 4px;
    display: inline-block;
    border-radius: 0.25rem;
    padding: 0 5px;
    background-color: rgba(0, 0, 0, 0.2);
    user-select: none;
  }

  .img-count {
    left: initial;
    right: 1px;
  }

  .time-progress :global(svg) {
    pointer-events: none;
  }

  .btn-play :global(svg) {
    top: 3px;
    cursor: pointer;
  }

  #next {
    margin: 0 20px;
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
    .viewer :global(.modal-container .modal) {
      min-width: 99%;
      max-width: 99%;
    }
  }
</style>
