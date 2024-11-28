<script>
  import { afterUpdate, onDestroy } from "svelte";
  import { navigate } from "svelte-routing";
  import { getFilesPerPage, ProcessFile } from "./filesUtils";

  import { clamp } from "src/ShareComponent/utils";
  import { ConfigStore } from "../Stores/PageConfigStore";
  import { ToggleMenu } from "src/ShareComponent/ToggleMenu";
  import { fileKeypress, selectByTitle, selectElementById } from "../Component/fileEvents";

  import api from "src/apiUtils";
  import Filter from "src/ShareComponent/Filter.svelte";
  import Pagination from "src/ShareComponent/Pagination.svelte";
  import Icons from "src/icons/Icons.svelte";
  import LazyImage from "../Component/LazyImage.svelte";
  import { getLastChap } from "../Component/fileUtils";

  export let page = 1;
  export let filter = "";

  let title = "Home";
  let reload = true;
  let isMounted = true;

  let pageData = { items: [], page: page || 1, totalPages: 0, totalFiles: 0 };

  const loadContent = async (pg, flt = "") => {
    if (reload) {
      const items = $ConfigStore.Home.items || getFilesPerPage(3);
      const data = await api.files(["recents", items, pg, encodeURIComponent(flt)], "home");
      if (data.valid && isMounted) {
        pageData = data;
        if (+pg !== +data.page) {
          reload = false;
          navigate(`/${data.page}/${filter || ""}`);
        }
      }
    } else {
      reload = true;
    }
  };

  const goToPage = async ({ detail }) => navigate(`/${+detail}/${filter || ""}`);

  const openFolder = ({ target }) => {
    const file = target.closest(".file");
    ProcessFile(file, file.dataset.types, title, "mangas");
  };

  const handleKeydown = (event) => fileKeypress(event, pageData.page, goToPage, title);

  const fileFilter = ({ detail }) => navigate(`/${1}/${detail || ""}`);

  const removeRecent = async ({ currentTarget }) => {
    const Id = currentTarget.closest(".file")?.id;
    const result = await api.post("files/recents/remove", { Id });
    if (result.valid) {
      if (document.querySelectorAll(".file").length === 1) {
        page = clamp(page - 1, 1, pageData.totalPages);
      }
      await loadContent(page, filter);
    }
  };

  const handleClick = ({ currentTarget }) => {
    selectElementById(currentTarget.id, title);
  };

  ToggleMenu.set(false);

  $: $ConfigStore, loadContent(page, filter);

  onDestroy(() => {
    isMounted = false;
    api.cancelQuery("home");
  });

  afterUpdate(() => selectByTitle(title));

  $: document.title = page ? `Home - Page - ${pageData.page}` : "Home";
  const folderIcon = { name: "folderopen", color: "rgb(250, 183, 15);" };
</script>

<div class="scroll-container">
  <div class="title">
    <span>
      <Icons {...folderIcon} name="folder" />
      Reading History
    </span>
  </div>
  <div class="files-list" on:keydown={handleKeydown}>
    {#each pageData.items as { Id, Name, Type, LastChapter, FileCount, FilesType, Status, isRaw }, i}
      <div class="file" id={Id} data-type={Type} data-types={FilesType} tabIndex="0" on:click={handleClick} on:keydown>
        <div class="file-info">
          <div class="file-cover" on:dblclick|stopPropagation={openFolder}>
            <LazyImage cover={encodeURI(`/${Type}/${FilesType}/${Name}.jpg`)} />
            <span class="f-status" class:completed={Status}>{Status ? "Completed" : "OnGoing"}</span>
            <span class="f-raw" class:hidden={!isRaw}>Raw</span>
          </div>
          <div class="file-btns">
            <span class="file-btn-left" on:click|stopPropagation={openFolder} on:keydown>
              <Icons {...folderIcon} />
            </span>
            <span class="file-progress">{getLastChap(LastChapter, FilesType, FileCount)}</span>
            <span class="remove" on:click|stopPropagation={removeRecent} on:keydown>
              <Icons name="trash" color="rgba(252, 1, 1, 0.856)" />
            </span>
          </div>
          <div class="file-name">{Name}</div>
        </div>
      </div>
    {/each}
  </div>
</div>
<div class="controls">
  <Filter {filter} on:filter={fileFilter} />
  <Pagination page={pageData.page} totalPages={pageData.totalPages} on:gotopage={goToPage} />
  <span class="items">{pageData.totalFiles}</span>
</div>

<style>
  :global(.icon-folderopen path),
  :global(.icon-folder path) {
    fill: rgb(250, 183, 15);
  }

  .title :global(.icon-folder) {
    height: 30px;
    width: 35px;
  }

  .title {
    padding-top: 10px;
    text-align: center;
  }

  .title span {
    display: inline-block;
    font-size: 1.5rem;
    font-weight: 600;
    padding: 0 10px;
    color: black;
    background-color: antiquewhite;
    border-radius: 0.25rem;
    font-family: monospace;
  }
  .controls {
    pointer-events: none;
  }
</style>
