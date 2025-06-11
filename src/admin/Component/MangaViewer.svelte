<script>
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import { map } from "../Utils";
  import Icons from "src/icons/Icons.svelte";
  import { MangaStore } from "../Store/MangaStore";
  import { getContext, onMount } from "svelte";
  import { getSecuences } from "./util";

  const VOLKEY = "admin-vol";
  const socket = getContext("socket");

  let file = {};
  let files = [];

  let vol = localStorage.getItem(VOLKEY) || 0.05;
  let error = "";
  let current = files.findIndex((f) => f.Id === file.Id);
  let indices = [];
  let currentImg = 0;
  let container;
  let pageObserver;
  let isLoading = false;
  let data = { total: 0, images: [] };

  MangaStore.subscribe((data) => {
    if (data.files) {
      file = data.file;
      files = data.files;
    }
  });

  export const PageObserver = () => {
    const imgs = container.querySelectorAll("img");
    pageObserver?.disconnect();

    pageObserver = new IntersectionObserver(
      (entries) => {
        if (imgs.length) {
          for (let entry of entries) {
            let img = entry.target;
            if (entry.isIntersecting && img?.src.startsWith("data:img")) {
              currentImg = +img.id;

              if ((isLoading && !data.images[currentImg]) || !data.images[currentImg + 5]) {
                isLoading = true;
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

  const hide = () => {
    file = {};
    files = [];
  };

  const changeFile = ({ target: { id } }) => {
    let next = id === "next" ? 1 : -1;
    const nextIndex = current + next;
    if (nextIndex > -1 && nextIndex < files.length) {
      file = files[nextIndex];
      current = nextIndex;
    }
  };

  const onkeydown = ({ keyCode, ctrlKey }) => {};

  const onImageCount = ({ total }) => {
    if (total) data.total = total;
  };
  // receive data from server
  const onImageData = (d) => {
    if (d.img && d.id === file.Id) {
      indices.push(d.page);
      data.images[d.page] = d.img;
    }

    if (d.last) isLoading = true;
  };

  onMount(() => {
    socket.on("zip-data", onImageCount);
    socket.on("image-loaded", onImageData);

    return () => {
      socket.off("zip-data", onImageCount);
      socket.off("image-loaded", onImageData);
    };
  });

  const onWheel = ({ deltaY }) => {
    let volume = vol;
    volume += deltaY < 0 ? 0.05 : -0.05;
    vol = volume < 0 ? 0 : volume > 1 ? 1 : volume;
  };

  $: current = files.findIndex((f) => f.Id === file.Id);

  $: if (file.Id && data.Id !== file.Id) {
    data = { ...file, total: 0, images: [] };
    currentImg = 0;
    console.log(getSecuences(0, 5));
    isLoading = true;
    socket.emit("loadzip-image", { ...file, imageCount: true, indices: getSecuences(0, 5) });
  }

  $: if (data.total) {
    PageObserver();
  }
</script>

<div class="viewer" on:wheel={onWheel} class:hidden={!files.length}>
  <Dialog cancel={hide} btnOk="" btnCancer="" keydown={onkeydown} canDrag={true} background={false}>
    <span slot="modal-header" class="f-name">{file.Name}</span>
    <div class="manga-container" bind:this={container}>
      {#each Array(data.total).fill(null) as _, i}
        <img
          class:empty-img={!data.images[i]}
          id={i}
          style="object-fit: fill"
          src={data.images[i] ? "data:img/jpeg;base64, " + data.images[i] : ""}
          alt={`Loading... Image ${i + 1}`}
        />
      {/each}
    </div>
    <div class="error">{error}</div>
    <div class="time-progress" on:mousedown|stopPropagation on:touchstart|stopPropagation>
      {#if files.length > 1}
        <span class="files-count">{`${current + 1}/${files.length}`}</span>
      {/if}
      <span id="prev" class="btn-play" on:click={changeFile}>
        <Icons name="arrowcircleleft" />
      </span>
      <span id="next" class="btn-play" on:click={changeFile}>
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
    min-width: 400px;
    max-width: 400px;
    height: max-content;
    background-color: black;
    overflow: hidden;
  }
  .manga-container {
    height: 400px;
    width: 400px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
  }
  .manga-container img {
    height: auto;
    width: 100%;
    max-height: initial;
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
    margin: 0 10px;
  }

  @media screen and (max-width: 600px) {
    .viewer :global(.modal-container .modal) {
      min-width: 95%;
      max-width: 95%;
    }
  }
</style>
