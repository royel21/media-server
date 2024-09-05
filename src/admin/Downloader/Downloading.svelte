<script>
  import { onMount, getContext } from "svelte";
  import apiUtils from "src/apiUtils";
  import Filter from "src/ShareComponent/Filter.svelte";
  import Icons from "src/icons/Icons.svelte";
  import { updateLink } from "./utils";
  import DownloadListModal from "./DownloadListModal.svelte";
  import LinkPager from "./LinkPager.svelte";
  import LinkTable from "./LinkTable.svelte";

  let start = 0;
  let running = false;
  let showDownList = false;
  let servers = [];

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
      filter: decodeURIComponent(filter),
      IsDownloading: true,
      first: true,
    });

    if (result.links) {
      servers = result.servers;
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

  const onUpdate = ({ link }) => {
    if (link.remove === true || link.IsDownloading === false) {
      datas.links = datas.links.filter((f) => f.Id !== link?.Id);
    } else {
      datas.links = updateLink(link, datas, true);
    }
  };

  const stopDownloads = () => {
    running = false;
    socket.emit("download-server", { action: "Exit" });
  };

  const updateRunning = ({ IsRunning }) => {
    running = IsRunning;
    if (!IsRunning) {
      loadItems();
    }
  };

  const loadDownloads = (Id) => {
    socket.emit("download-server", { datas: { Id }, action: "Load-Downloads" });
    showDownList = false;
    running = true;
  };

  const updateLinkList = (links) => (datas.links = [...links]);

  onMount(() => {
    loadItems();
    socket.on("update-download", onUpdate);
    socket.on("is-running", updateRunning);
    socket.on("reload-downloads", loadItems);
    socket.emit("download-server", { action: "is-running" });
    return () => {
      socket.off("update-download", onUpdate);
      socket.off("is-running", updateRunning);
    };
  });

  $: start = (datas.page - 1) * datas.items;
  $: localStorage.setItem("d-items", datas.items);
</script>

{#if showDownList}
  <DownloadListModal hide={() => (showDownList = false)} {loadDownloads} {addToDownload} />
{/if}

<div id="downloading" class="container">
  <div class="d-controls">
    <div>
      <span class="d-btn" on:click={() => (showDownList = true)} on:keydown>
        <Icons name="list" />
      </span>
      <span class="d-btn btn-stop" title="Stop All Download" class:running on:click={stopDownloads} on:keydown>
        <Icons name="stopcircle" color="firebrick" />
      </span>
      <Filter on:filter={onFilter} filter={datas.filter} />
    </div>
    <LinkPager {loadItems} {datas} />
  </div>

  <LinkTable {datas} {socket} {updateLinkList} {removeLink} {servers} IsDownloading={true} />
</div>

<style>
  #downloading {
    height: calc(100% - 5px);
  }

  .d-controls :global(#filter-control) {
    max-width: 500px;
  }
</style>
