<script>
  import { afterUpdate } from "svelte";
  import { navigate } from "svelte-routing";
  import { getFilesPerPage, ProcessFile } from "../Component/filesUtils";

  import { clamp } from "../../ShareComponent/utils";
  import { PageConfig } from "../Stores/PageConfigStore";
  import { ToggleMenu } from "../../ShareComponent/ToggleMenu";
  import { fileKeypress, selectByTitle, selectElementById } from "../Component/fileEvents";

  import api from "../../apiUtils";
  import Filter from "../../ShareComponent/Filter.svelte";
  import Pagination from "../../ShareComponent/Pagination.svelte";

  export let page = 1;
  export let filter = "";
  let title = "Home";

  let pageData = { items: [], page: page || 1, totalPages: 0, totalFiles: 0 };

  const loadContent = async (pg, flt = "") => {
    pg = clamp(pg, 1, pageData.totalPages);
    const items = $PageConfig.Home.items || getFilesPerPage(3);
    const data = await api.files(["recents", items, pg, flt]);
    if (data.valid) pageData = data;
  };

  const goToPage = async ({ detail }) => navigate(`/${+detail}/${filter || ""}`);

  const openFolder = ({ target }) => {
    const file = target.closest(".file");
    ProcessFile(file, file.dataset.types);
  };

  const handleKeydown = (event) => fileKeypress(event, pageData.page, goToPage, title);

  const fileFilter = ({ detail }) => navigate(`/${1}/${detail || ""}`);

  const removeRecent = async ({ currentTarget }) => {
    const Id = currentTarget.closest(".file")?.id;
    const result = await api.post("files/recents/remove", { Id });
    if (result.valid) loadContent(page, filter);
  };

  const handleClick = ({ currentTarget }) => {
    selectElementById(currentTarget.id, title);
  };

  ToggleMenu.set(false);

  $: $PageConfig, loadContent(page, filter);

  afterUpdate(() => selectByTitle(title));

  $: document.title = page ? `Home - Page - ${pageData.page}` : "Home";
</script>

<div class="scroll-container">
  <div class="title">
    <span>
      <i class="fas fa-folder" />
      Last View
    </span>
  </div>
  <div class="files-list" on:keydown={handleKeydown}>
    {#each pageData.items as { Id, Name, Type, Cover, FileCount, FilesType }, i}
      <div class="file" id={Id} data-type={Type} data-types={FilesType} tabIndex="0" on:click={handleClick}>
        <div class="file-info">
          <div class="file-btns">
            <span class="file-btn-left" on:click|stopPropagation={openFolder}>
              <i class={"fas fa-folder"} />
            </span>
            <span class="file-progress">{FileCount}</span>
            <span class="remove" on:click|stopPropagation={removeRecent}>
              <i class="fas fa-trash-alt" />
            </span>
          </div>
          <div class="file-cover" on:dblclick|stopPropagation={openFolder}>
            <img src={Cover} alt="Cover Not Found" />
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
  .fas:active {
    transform: scale(1.2);
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
