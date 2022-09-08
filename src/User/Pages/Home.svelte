<script>
  import axios from "axios";
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { getFilesPerPage } from "../Component/FilesUtils";
  import { fileKeypress, selectItem, getElIndex, fileClicks } from "../Component/FileEvents";

  import Filter from "../../ShareComponent/Filter.svelte";
  import Pagination from "../../ShareComponent/Pagination.svelte";
  import { updateToggleMenu } from "../../ShareComponent/ToggleMenu";

  let current = 0;
  let filter = "";
  let pageData = { items: [], page: 1, totalPages: 0, totalFiles: 0 };

  const goToPage = async ({ detail }) => {
    const { data } = await axios.get(`/api/files/recents/${getFilesPerPage(3)}/${+detail}`);
    if (data.valid) {
      pageData = data;
    }
  };

  const openFolder = ({ target }) => {
    let file = pageData.items.find((f) => f.Id === target.closest(".file").id);
    localStorage.setItem("content", "/");
    navigate(`/${file.FilesType}/viewer/${file.Id}/${file.CurrentFile}`);
  };

  onMount(() => goToPage({ detail: 1 }));

  const fileFilter = () => {};

  updateToggleMenu();

  document.title = "Home";
</script>

<div class="scroll-container">
  <div class="title">
    <span>
      <i class="fas fa-folder" />
      Last View
    </span>
  </div>
  <div class="files-list">
    {#each pageData.items as { Id, Name, Type, Cover, FileCount, FilesType }, i}
      <div class="file" class:current={i === current} id={Id} data-type={Type} data-types={FilesType} tabIndex="0">
        <div class="file-info">
          <div class="file-btns">
            <span class="file-btn-left" on:click|stopPropagation={openFolder}>
              <i class={"fas fa-folder"} />
            </span>
            <span class="file-progress">{FileCount}</span>
            <span class="remove">
              <i class="fas fa-trash-alt" />
            </span>
          </div>
          <div class="file-cover" on:dblclick|stopPropagation={openFolder}>
            <img src={Cover} alt="No Cover Found" />
          </div>
          <div class="file-name">{Name}</div>
        </div>
      </div>
    {/each}
  </div>
</div>
<div class="controls">
  <slot name="controls" />
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
    z-index: 999;
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
