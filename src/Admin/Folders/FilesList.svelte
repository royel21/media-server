<script>
  import {
    onMount,
    onDestroy,
    getContext,
    createEventDispatcher
  } from "svelte";
  import ItemList from "./ItemList.svelte";
  import Axios from "Axios";
  import { calRows } from "./Utils";

  const dispatch = createEventDispatcher();
  export let fId;

  let page = 1;
  let totalPages;
  let totalItems;
  let filter = "";
  let items = [];

  let socket = getContext("socket");

  const loadFiles = async folderId => {
    let resp = await Axios.get(
      `api/admin/folders/files/${folderId}/${page}/${calRows(
        ".list-container"
      )}/${filter || ""}`
    );
    if (resp.data.files) {
      let data = resp.data;
      items = data.files;
      totalPages = data.totalPages;
      totalItems = data.totalItems;
    }
  };

  onMount(async () => {
    socket.on("file-removed", data => {
      if (data.removed) {
        dispatch("loadFiles", 1);
      }
    });
  });

  onDestroy(() => {
    delete socket._callbacks["$file-removed"];
  });

  const removeFile = systemDel => {
    socket.emit("remove-file", { Id: localFile.Id, Del: systemDel });
  };

  const onFilter = flt => (filter = flt);

  const goToPage = pg => {
    pg = parseInt(pg.detail);
    page = pg < 1 ? 1 : pg > totalPages ? totalPages : pg;
    loadFiles(fId);
  };

  $: loadFiles(fId);
</script>

<ItemList
  title="Files"
  fId=""
  {items}
  {page}
  {totalPages}
  {totalItems}
  on:filter={onFilter}
  on:gotopage={goToPage} />
