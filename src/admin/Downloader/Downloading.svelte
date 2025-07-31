<script>
  import { onMount, getContext } from "svelte";
  import apiUtils from "src/apiUtils";
  import Filter from "src/ShareComponent/Filter.svelte";
  import Icons from "src/icons/Icons.svelte";
  import DownloadListModal from "./DownloadListModal.svelte";
  import LinkPager from "./LinkPager.svelte";
  import LinkTable from "./LinkTable.svelte";

  let showDownList = false;
  let isMounted = true;

  const socket = getContext("socket");

  const datas = {
    links: [],
    page: 1,
    totalPages: 0,
    totalItems: 0,
    items: +localStorage.getItem("d-items") || 100,
    filter: "",
  };

  const onFilter = ({ detail }) => {
    datas.filter = detail;
    datas.page = 1;
    loadItems();
  };

  const loadItems = async () => {
    const { items, page, filter } = datas;
    const result = await apiUtils.post("admin/downloader/links", {
      items,
      page,
      filter: decodeURIComponent(filter).replace(/http(s|)\/\//i, ""),
      IsDownloading: true,
      first: true,
    });

    if (result.links && isMounted) {
      datas.links = result.links;
      datas.totalPages = result.totalPages;
      datas.totalItems = result.totalItems;
    }
  };

  const removeLink = async ({ target }) => {
    const Id = target.closest(".link").id;
    datas.links = datas.links.filter((lk) => +lk.Id !== +Id);
    socket.emit("download-server", { action: "Remove", remove: [+Id] });
  };

  const addToDownload = async ({ target }) => {
    socket.emit("download-server", {
      datas: [+target.closest("span").id],
      action: "Add-Download",
    });
  };

  const stopDownloads = () => {
    datas.running = false;
    socket.emit("download-server", { action: "Exit" });
  };

  const loadDownloads = (Id) => {
    socket.emit("download-server", { datas: { Id }, action: "Load-Downloads" });
    showDownList = false;
    datas.running = true;
  };

  const updateDatas = (d, key, link, links) => {
    if (key === "links") {
      if (link?.remove) {
        datas.links = datas.links.filter((f) => f.Id !== link?.Id);
      } else if (links) {
        datas.links = [...datas.links, ...links];
        datas.totalItems = datas.links.length;
      }
    }

    console.log(link, links);

    if (key === "running") {
      datas.running = d;
    }
  };

  const hideDownloadList = () => {
    showDownList = false;
    setTimeout(async () => {
      await loadItems();
    }, 1000);
  };

  onMount(async () => {
    await loadItems();
    socket.on("reload-downloads", loadItems);
    socket.emit("download-server", { action: "is-running" });
    return () => {
      isMounted = false;
      apiUtils.cancelQuery();
    };
  });

  $: localStorage.setItem("d-items", datas.items);
</script>

{#if showDownList}
  <DownloadListModal hide={hideDownloadList} {loadDownloads} {addToDownload} />
{/if}

<div id="downloading" class="container">
  <div class="d-controls">
    <div>
      <span class="d-btn" on:click={() => (showDownList = true)} on:keydown>
        <Icons name="list" />
      </span>
      <span
        class="d-btn btn-stop"
        title="Stop All Download"
        class:running={datas.running}
        on:click={stopDownloads}
        on:keydown
      >
        <Icons name="stopcircle" color="firebrick" />
      </span>
      <Filter on:filter={onFilter} filter={datas.filter} />
    </div>
    <LinkPager {loadItems} {datas} />
  </div>

  <LinkTable {datas} {socket} {updateDatas} {removeLink} servers={true} IsDownloading={true} {loadItems} />
</div>

<style>
  #downloading {
    height: calc(100% - 5px);
  }

  .d-controls :global(#filter-control) {
    max-width: 500px;
  }
</style>
