<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import ItemList from "./ItemList.svelte";
  import ModalEdit from "./ModalEdit.svelte";
  import Axios from "Axios";
  import { calRows } from "./Utils";
  const dispatch = createEventDispatcher();
  let page = 1;
  let totalPages = 1;
  let filter = "";
  let fId = "";
  let totalItems = 0;
  let items = [];
  let folder = {};
  let EditModal = false;
  let DeleteModal = false;

  const loadFolders = async pg => {
    let resp = await Axios.get(
      `/api/admin/folders/${page}/${calRows()}/${filter || ""}`
    );

    if (resp.data.folders.length > 0) {
      let data = resp.data;

      fId = data.folders[0].Id;
      items = data.folders;
      totalPages = data.totalPages;
      totalItems = data.totalItems;
      page = pg || 1;
      dispatch("folderid", fId);
    }
  };

  onMount(() => {
    loadFolders(1);
  });

  const onFilter = flt => {
    filter = flt.detail;
    loadFolders(1);
  };

  const gotopage = pg => {
    pg = parseInt(pg.detail);
    page = pg < 1 ? 1 : pg > totalPages ? totalPages : pg;
    loadFolders(pg);
  };

  const itemClick = event => {
    let el = event.target;
    if (el.tagName === "LI") {
      fId = el.id;
      dispatch("folderid", fId);
    } else {
      folder = items.find(f => f.Id === el.closest("li").id);
      let cList = el.classList.toString();
      if (/fa-edit/gi.test(cList)) {
        EditModal = true;
      } else {
        DeleteModal = true;
      }
    }
  };
  const handleSubmit = event => {
    event.preventDefault();
    console.log(event.target.querySelector("input").value);
  };
  const hideModal = () => {
    EditModal = false;
    DeleteModal = false;
  };
</script>

{#if EditModal}
  <ModalEdit
    file={folder}
    title="Folder"
    on:submit={handleSubmit}
    on:click={hideModal} />
{/if}

<ItemList
  title="Folders"
  {fId}
  {items}
  {page}
  {totalPages}
  {totalItems}
  on:filter={onFilter}
  on:gotopage={gotopage}
  on:click={itemClick} />
