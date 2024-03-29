<script>
  import { afterUpdate } from "svelte";
  import { navigate } from "svelte-routing";
  import { getFilesPerPage, ProcessFile } from "./filesUtils";

  import { clamp } from "../../ShareComponent/utils";
  import { ConfigStore } from "../Stores/PageConfigStore";
  import { ToggleMenu } from "../../ShareComponent/ToggleMenu";
  import { fileKeypress, selectByTitle, selectElementById } from "../Component/fileEvents";

  import api from "../../apiUtils";
  import Filter from "../../ShareComponent/Filter.svelte";
  import Pagination from "../../ShareComponent/Pagination.svelte";
  import Icons from "../../icons/Icons.svelte";
  import LazyImage from "../Component/LazyImage.svelte";

  export let page = 1;
  export let filter = "";
  let title = "Home";
  let reload = true;

  let pageData = { items: [], page: page || 1, totalPages: 0, totalFiles: 0 };

  const loadContent = async (pg, flt = "") => {
    if (reload) {
      const items = $ConfigStore.Home.items || getFilesPerPage(3);
      const data = await api.files(["recents", items, pg, flt]);
      if (data.valid) {
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
    ProcessFile(file, file.dataset.types, title);
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
      loadContent(page, filter);
    }
  };

  const handleClick = ({ currentTarget }) => {
    selectElementById(currentTarget.id, title);
  };

  ToggleMenu.set(false);

  $: $ConfigStore, loadContent(page, filter);

  afterUpdate(() => selectByTitle(title));

  $: document.title = page ? `Home - Page - ${pageData.page}` : "Home";
  const folderIcon = { name: "folderopen", color: "rgb(250, 183, 15);" };
</script>

<div class="scroll-container">
  <div class="title">
    <span>
      <Icons {...folderIcon} name="folder" />
      Last View
    </span>
  </div>
  <div class="files-list" on:keydown={handleKeydown}>
    {#each pageData.items as { Id, Name, Type, Cover, FileCount, FilesType }, i}
      <div class="file" id={Id} data-type={Type} data-types={FilesType} tabIndex="0" on:click={handleClick}>
        <div class="file-info">
          <div class="file-btns">
            <span class="file-btn-left" on:click|stopPropagation={openFolder}>
              <Icons {...folderIcon} />
            </span>
            <span class="file-progress">{FileCount}</span>
            <span class="remove" on:click|stopPropagation={removeRecent}>
              <Icons name="trash" color="rgba(252, 1, 1, 0.856)" />
            </span>
          </div>
          <div class="file-cover" on:dblclick|stopPropagation={openFolder}>
            <LazyImage cover={encodeURI(`/${Type}/${Name}.jpg`)} />
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

  .title {
    top: 0;
    position: sticky;
    padding-top: 5px;
    text-align: center;
    z-index: 9;
  }
  .title span {
    display: inline-block;
    font-size: 1.25rem;
    padding: 0 10px;
    color: black;
    background-color: antiquewhite;
    border-radius: 0.25rem;
    font-family: monospace;
  }
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
</style>
