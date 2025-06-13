<script>
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import { FilesStore, ImageRegex } from "../Store/FilesStore";
  import Icons from "src/icons/Icons.svelte";
  let errors = [];
  let item = {};
  let items = [];
  let current = 0;

  const changeFile = (next) => {
    const nextIndex = current + next;
    if (nextIndex > -1 && nextIndex < items.length) {
      item = items[nextIndex];
      current = nextIndex;
    }
  };

  const onChangeImg = ({ target }) => {
    changeFile(target.id === "next" ? 1 : -1);
  };

  FilesStore.subscribe(async ({ file, files }) => {
    if (ImageRegex.test(file.Name)) {
      item = { ...file };
      items = files;
    }
  });
  const hide = () => {
    FilesStore.set({ file: {} });
    item = {};
  };

  $: current = items?.findIndex((f) => f.Id === item.Id);
  $: src = item?.Path ? `/api/admin/files/image/${encodeURIComponent(item.Path)}` : "";
</script>

{#if item?.Path !== undefined}
  <Dialog id="img-viewer" {errors} canDrag={true} background={false} btnOk="" btnCancer="">
    <div class="img-content" slot="modal-header">
      <div class="img-name">
        <span>{item.Path}</span>
      </div>
      <div id="next" on:click={onChangeImg}><span>{">"}</span></div>
      <div id="prev" on:click={onChangeImg}><span>{"<"}</span></div>
      <img {src} alt={`Can't display file ${item.Name}`} />
      <span class="btn-close" on:click={hide}>
        <Icons name="timescircle" />
      </span>
      <div class="count"><span>{current + 1}/{items.length}</span></div>
    </div>
  </Dialog>
{/if}

<style>
  :global(#img-viewer) {
    height: 600px;
    width: 600px;
  }
  :global(#img-viewer form) {
    height: 100%;
  }
  :global(#img-viewer .modal-header) {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    height: 100%;
    max-height: 100%;
    user-select: none;
    position: relative;
    border-bottom: none;
  }
  .img-content {
    height: 100%;
    width: 100%;
  }
  #next,
  #prev {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    height: 100%;
    width: 10%;
    font-size: 30px;
    font-weight: bold;
    opacity: 0;
    transition: 0.3s all;
    z-index: 1;
    user-select: none;
  }
  #next:hover,
  #prev:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.2);
  }
  #next:active span,
  #prev:active span {
    transform: scale(1.1);
  }
  #next {
    right: 0;
  }
  #prev {
    left: 0;
  }
  .img-name {
    position: absolute;
    top: 5px;
    width: 100%;
    text-align: center;
  }
  img {
    max-width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
    pointer-events: none;
  }
  .btn-close {
    position: absolute;
    top: 0;
    right: 2px;
    z-index: 9;
  }

  .count {
    position: absolute;
    bottom: 0;
    width: 100%;
    color: white;
    font-weight: 700;
  }
  .count span {
    text-shadow: #fc0 1px 0 10px;
  }
</style>
