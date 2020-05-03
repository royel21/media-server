<script>
  import { onMount, tick, afterUpdate } from "svelte";
  import { navigate } from "svelte-routing";
  import Axios from "axios";

  import { genUrl, getFilesPerPage, FileTypes, ProcessFile } from "../Utils";
  import { fileKeypress, selectItem, getElementIndex } from "../FileEvents";

  import Pagination from "../../ShareComponent/Pagination.svelte";
  import Filter from "../../ShareComponent/Filter.svelte";
  import FavoriteList from "../Component/FavoriteList.svelte";

  export let id = "";
  export let page = 1;
  export let filter = "";
  export let type = "";
  export let title = "";
  let selected = 0;

  let Mount = false;
  let pageData = { files: [], totalPages: 0, totalFiles: 0 };

  const cancelToken = Axios.CancelToken;
  var cancel;

  const loadContent = async (pg = 1, flt = "", favId = "") => {
    try {
      if (cancel) {
        cancel();
      }
      let url = genUrl(pg, { order: "nu", items: 0 }, flt, type, favId);
      let resp = await Axios.get(url, {
        cancelToken: new cancelToken(function executor(c) {
          cancel = c;
        })
      });
      pageData = resp.data;
    } catch (error) {}
  };

  const goToPage = async (pg, sel) => {
    pg = parseInt(pg.detail);
    let { totalPages } = pageData;
    if (pg < 1 || pg > totalPages || isNaN(pg)) return;
    pg = pg < 1 ? 1 : pg > totalPages ? totalPages : pg;

    navigate(`/${type}/${pg}/${filter || ""}`);
    if (sel !== undefined) {
      await tick();
      selected = sel;
    }
  };
  const fileFilter = event => {
    filter = event.detail;
    navigate(`/${type}/${1}/${filter || ""}`);
  };

  const handleKeydown = event => {
    fileKeypress(event, page, goToPage, ProcessFile, selected);
  };

  const openFile = event => {
    ProcessFile(event.target.closest(".file"));
  };

  onMount(async () => {
    loadContent(page || 1, filter || "");
    Mount = true;
  });

  afterUpdate(() => {
    let sel = selected;
    let id = localStorage.getItem("fileId");
    let el = document.getElementById(id);
    if (["mangas", "videos"].includes(type)) {
      if (id && el) {
        sel = getElementIndex(el);
        localStorage.removeItem("fileId");
      }
    }
    selectItem(sel);
  });

  let favClicked = null;
  const favClick = event => {
    favClicked = event.target;
    if (favClicked.tagName !== "I") {
      selected = getElementIndex(favClicked.closest(".file"));
    }
  };
  const removeFile = event => {
    pageData.files = pageData.files.filter(f => f.Id !== event.detail);
    pageData = pageData;
  };
  $: document.title = `${title} Page ${page}`;
  $: if (Mount) loadContent(page || 1, filter || "", id);
</script>

<style>
  .controls {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 5px 4px 5px;
    z-index: 1;
    pointer-events: none;
  }

  .file-btn-left {
    cursor: pointer;
  }
  .file-btn-left i {
    pointer-events: none;
  }
</style>

<div class="files-list" on:keydown={handleKeydown} on:click={favClick}>
  {#each pageData.files as { Id, Name, Type, Cover, CurrentPos, Duration, isFav, FileCount }, i}
    <div class="file" id={Id} data-type={Type} tabIndex="0">
      <div class="file-info">
        <div class="file-btns">
          <span class="file-btn-left" on:click|stopPropagation={openFile}>
            <i class={'fas fa-' + FileTypes[Type].class} />
          </span>
          <span class="file-progress">
            {#if Type.includes('Folder')}
              {FileCount}
            {:else}{FileTypes[Type].formatter(CurrentPos || 0, Duration)}{/if}
          </span>
          <FavoriteList
            {isFav}
            type={'Mangas'}
            {Type}
            {favClicked}
            favId={id}
            on:removeFile />
        </div>
        <div class="file-cover" on:dblclick|stopPropagation={openFile}>
          <img src={Cover} alt="No Cover Found" />
        </div>
        <div class="file-name">{Name}</div>
      </div>
    </div>
  {/each}
</div>
<div class="controls">
  <slot />
  <Filter {filter} on:filter={fileFilter} />
  <Pagination
    page={parseInt(page || 1)}
    totalPages={pageData.totalPages}
    on:gotopage={goToPage} />
  <span class="items">{pageData.totalFiles}</span>
</div>
