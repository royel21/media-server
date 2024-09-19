<script>
  import { onMount, getContext } from "svelte";
  import apiUtils from "src/apiUtils";
  import Filter from "src/ShareComponent/Filter.svelte";
  import Icons from "src/icons/Icons.svelte";
  import Modal from "./Modal.svelte";
  import ModalLink from "./ModalLink.svelte";
  import RenameModal from "./RenameModal.svelte";
  import ExcludeChapModal from "./ExcludeChapModal.svelte";
  import ModalServerList from "./ModalServerList.svelte";
  import LinkTable from "./LinkTable.svelte";
  import LinkPager from "./LinkPager.svelte";

  let start = 0;
  let editor = { show: false };
  let servers = {};
  let showLinkModal = false;
  let showRenamer = false;
  let showExcludeChapModal;
  let running = false;
  let showServerList = false;
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

  const loadItems = async (first) => {
    const { items, page, filter } = datas;
    const result = await apiUtils.post("admin/downloader/links", {
      items,
      page,
      filter: decodeURIComponent(filter),
      first,
    });

    if (isMounted) {
      if (result.servers) servers = result.servers;

      if (result.links) {
        datas.links = result.links;
        datas.totalPages = result.totalPages;
        datas.totalItems = result.totalItems;
      }
    }
  };

  const hideModal = () => {
    editor = {};
    datas.links = [...datas.links];
  };

  const onHideServerList = async (reload) => {
    if (reload) await loadItems();
    showServerList = false;
  };

  const onNewlink = (newLink) => {
    if (newLink) {
      loadItems();
    }
    showLinkModal = false;
  };

  const updateLinkList = (links) => (datas.links = [...links]);

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
  const removeLink = async ({ target }) => {
    const id = target.closest(".link").id;
    if (id) {
      const result = await apiUtils.get(["admin", "downloader", "remove-link", id]);
      if (result.valid) {
        loadItems();
      }
    }
  };

  onMount(() => {
    loadItems(true);
    socket.emit("download-server", { action: "is-running" });
    socket.on("is-running", updateRunning);
    return () => {
      isMounted = false;
      apiUtils.cancelQuery();
      socket.off("is-running", updateRunning);
    };
  });

  $: start = (datas.page - 1) * datas.items;
</script>

{#if editor.show}
  <Modal server={editor.server} link={editor.link} hide={hideModal} />
{/if}

{#if showLinkModal}
  <ModalLink hide={onNewlink} {servers} />
{/if}

{#if showRenamer}
  <RenameModal hide={() => (showRenamer = false)} />
{/if}

{#if showServerList}
  <ModalServerList hide={onHideServerList} />
{/if}

{#if showExcludeChapModal}
  <ExcludeChapModal
    linkId={showExcludeChapModal}
    hide={() => {
      showExcludeChapModal = false;
    }}
  />
{/if}

<div id="downloads" class="container">
  <div class="d-controls">
    <div>
      <span class="d-btn btn-add" on:click={() => (showLinkModal = true)} on:keydown>
        <Icons name="squareplus" />
      </span>
      <span class="d-btn r-list btn-stop" title="Stop All Download" class:running on:click={stopDownloads} on:keydown>
        <Icons name="stopcircle" color="firebrick" />
      </span>
      <span class="d-btn r-list" title="Show Rename List" on:click={() => (showRenamer = true)} on:keydown>
        <Icons name="list" />
      </span>
      <Filter on:filter={onFilter} filter={datas.filter} />
    </div>
    <LinkPager {loadItems} {datas} />
  </div>
  <LinkTable {datas} {socket} {updateLinkList} {removeLink} {servers} />
</div>

<style>
  @media screen and (max-width: 540px) {
    .d-controls span:not(.btn-add, .btn-stop) {
      display: none;
    }
  }
</style>
