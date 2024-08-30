<script>
  import Icons from "src/icons/Icons.svelte";
  import Select2 from "../Component/Select2.svelte";
  import { getContext, onMount } from "svelte";
  import Filter from "src/ShareComponent/Filter.svelte";
  import LinkTable from "./LinkTable.svelte";
  import LinkPager from "./LinkPager.svelte";
  import apiUtils from "src/apiUtils";
  import Modal from "./Modal.svelte";
  import Confirm from "../Component/Confirm.svelte";
  import ModalLink from "./ModalLink.svelte";

  const socket = getContext("socket");

  let loading = false;
  let showServerEditor = false;
  let showRemoveConfirm = false;
  let showLinkModal;
  let serverId = localStorage.getItem("server");
  let server = { Id: serverId };
  let servers = [];

  const datas = {
    links: [],
    page: 1,
    totalPages: 0,
    totalItems: 0,
    items: +localStorage.getItem("d-items") || 100,
    filter: "",
  };

  const loadItems = async (first) => {
    const { items, page, filter } = datas;
    const result = await apiUtils.post("admin/downloader/links", {
      items,
      page,
      filter: decodeURIComponent(filter),
      ServerId: server.Id || true,
      first,
    });

    if (result.servers) {
      servers = result.servers;
      server = servers.find((sv) => sv.Id.toString() === serverId) || servers[0] || {};
    }
    if (result.links) {
      datas.links = result.links;
      datas.totalPages = result.totalPages;
      datas.totalItems = result.totalItems;
    }
    loading = false;
  };

  const onChange = () => loadItems();

  const onShowServerEdit = () => (showServerEditor = true);
  const onhideServerEdit = () => (showServerEditor = false);

  const onRemoveServer = async () => {
    const result = await apiUtils.admin(["downloader", "servers-list", "delete", server.Id]);
    if (result.valid) {
      servers = servers.filter((ser) => ser.Id.toString() != server.Id);
      server = servers[0];
      loadItems();
    }
  };

  const onFilter = ({ detail }) => {
    datas.filter = detail;
    datas.page = 1;
    loadItems();
  };

  const stopDownloads = () => {
    datas.running = false;
    socket.emit("download-server", { action: "Exit" });
  };

  const updateRunning = ({ IsRunning }) => {
    datas.running = IsRunning;
    if (!IsRunning && !loading) {
      loadItems();
    }
  };

  const removeLink = async ({ target }) => {
    const id = target.closest(".link").id;
    if (id) {
      const result = await apiUtils.get(["admin", "downloader", "remove-link", id]);
      if (result.valid) {
        loadItems();
      }
    }
  };

  const downloadAll = async () => {
    const result = await apiUtils.post("admin/downloader/links", {
      items: datas.totalItems,
      page: 1,
      filter: decodeURIComponent(datas.filter),
      ServerId: server.Id,
    });
    if (result.links) {
      socket.emit("download-server", {
        datas: result.links.map((lnk) => lnk.Id),
        action: "Add-Download",
      });
    }
  };

  const onNewlink = (newLink) => {
    if (newLink) {
      loadItems();
    }
    showLinkModal = false;
  };

  const updateLinkList = (links) => (datas.links = [...links]);

  onMount(() => {
    loading = true;
    loadItems(true);
    socket.emit("download-server", { action: "is-running" });
    socket.on("is-running", updateRunning);
    return () => {
      socket.off("is-running", updateRunning);
    };
  });

  $: if (server.Id && serverId !== server.Id) {
    datas.page = 1;
    serverId = server.Id;
    localStorage.setItem("server", serverId);
  }
</script>

{#if showLinkModal}
  <ModalLink hide={onNewlink} {servers} />
{/if}

{#if showRemoveConfirm}
  <Confirm text={server.Name} cancel={() => (showRemoveConfirm = false)} acept={onRemoveServer} />
{/if}
{#if showServerEditor}
  <Modal {server} hide={onhideServerEdit} />
{/if}

<div id="srv">
  <div class="d-controls">
    <span class="btn-add" on:click={() => (showLinkModal = true)} on:keydown>
      <Icons name="squareplus" />
    </span>
    <span on:click={downloadAll} title="Download All Link from This Server" on:keydown>
      <Icons name="download" color="lightblue" />
    </span>
    <span title="Open Web Page" class="op-ser-page">
      <a href={`https://${server.Name}`} target="_blank"><Icons name="wolrd" color="forestgreen" /></a>
    </span>
    <span title="Open Server Config" on:click={onShowServerEdit}><Icons name="cog" /></span>
    <Select2 label="Servers" bind:item={server} options={servers} {onChange} />
    <span id="trash" on:click={() => (showRemoveConfirm = true)}><Icons name="trash" box="0 0 495 500" /></span>
  </div>
  <div class="d-controls">
    <Filter on:filter={onFilter} filter={datas.filter}>
      <span class="btns" slot="pre-btn">
        <span
          class="r-list btn-stop"
          title="Stop All Download"
          class:running={datas.running}
          on:click={stopDownloads}
          on:keydown
        >
          <Icons name="stopcircle" color="firebrick" />
        </span>
      </span>
    </Filter>
    <LinkPager {loadItems} {datas} />
  </div>

  <LinkTable {datas} {socket} {updateLinkList} {removeLink} />
</div>

<style>
  #srv :global(.t-container) {
    height: calc(100% - 46px);
  }
  #srv {
    height: calc(100% - 30px);
  }
  #srv .d-controls {
    padding-bottom: 5px;
  }
  #srv .d-controls :global(.icon-trash) {
    width: 28px;
  }
  #srv #trash {
    margin-left: 5px;
  }
  #srv .d-controls:first-child {
    padding-bottom: 0px;
  }
  @media screen and (max-width: 540px) {
    .d-controls .op-ser-page {
      display: none;
    }
  }
</style>
