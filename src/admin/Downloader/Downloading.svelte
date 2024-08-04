<script>
  import { onMount, getContext } from "svelte";
  import apiUtils from "src/apiUtils";
  import Filter from "src/ShareComponent/Filter.svelte";
  import Pagination from "src/ShareComponent/Pagination.svelte";
  import Icons from "src/icons/Icons.svelte";
  import Modal from "./Modal.svelte";
  import ExcludeChapModal from "./ExcludeChapModal.svelte";
  import { excludeLink, updateLink } from "./utils";
  import DownloadListModal from "./DownloadListModal.svelte";

  let start = 0;
  let editor = { show: false };
  let showExcludeChapModal;
  let running = false;
  let showDownList = false;

  const socket = getContext("socket");

  const datas = {
    links: [],
    page: 1,
    totalPages: 0,
    totalItems: 0,
    items: +localStorage.getItem("d-items") || 100,
    filter: "",
  };

  const dayfmt = new Intl.DateTimeFormat("en-GB", {
    year: "2-digit",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    second: "2-digit",
    minute: "numeric",
    hour12: true,
  });

  const nameFromurl = (url = "") => {
    const part = url.split("/");
    let name = "";
    while (!name && part.length) name = part.pop();
    return name.replaceAll("-", " ");
  };

  const getLink = (target) => {
    const id = target.closest(".link")?.id;
    return datas.links.find((f) => f.Id === +id);
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
    });

    if (result.links) {
      datas.links = result.links;
      datas.totalPages = result.totalPages;
      datas.totalItems = result.totalItems;
    }
  };

  const gotopage = ({ detail }) => {
    datas.page = detail;
    loadItems();
  };

  const removeLink = async ({ target }) => {
    const Id = target.closest(".link").id;
    datas.links = datas.links.filter((lk) => +lk.Id !== +Id);
    socket.emit("download-server", { action: "Remove", remove: [+Id] });
  };

  const changeItems = ({ keyCode }) => {
    if (keyCode === 13) {
      datas.page = 1;
      loadItems();
    }
  };

  const editLink = async ({ target }) => {
    const link = getLink(target);
    if (link) {
      editor = { show: true, link };
    }
  };

  const hideModal = () => {
    editor = {};
    datas.links = [...datas.links];
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

  const onExcludeLink = async (e) => {
    datas.links = await excludeLink(e, datas);
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

{#if editor.show}
  <Modal server={editor.server} link={editor.link} hide={hideModal} />
{/if}

{#if showDownList}
  <DownloadListModal hide={() => (showDownList = false)} {loadDownloads} {addToDownload} />
{/if}

{#if showExcludeChapModal}
  <ExcludeChapModal
    linkId={showExcludeChapModal}
    hide={() => {
      showExcludeChapModal = false;
    }}
  />
{/if}

<div class="container">
  <div class="d-controls">
    <Filter on:filter={onFilter} filter={datas.filter}>
      <span class="btns" slot="pre-btn">
        <span class="btn-add" on:click={() => (showDownList = true)} on:keydown>
          <Icons name="list" />
        </span>
        <span class="r-list btn-stop" title="Stop All Download" class:running on:click={stopDownloads} on:keydown>
          <Icons name="stopcircle" color="firebrick" />
        </span>
      </span>
    </Filter>
    <span>
      <Pagination page={datas.page} totalPages={datas.totalPages} on:gotopage={gotopage} />
      <div class="input-group d-items">
        <span class="input-group-text"><Icons name="list" color="black" /></span>
        <input type="number" class="form-control" bind:value={datas.items} on:keydown={changeItems} />
      </div>
    </span>
  </div>
  <div class="t-container">
    <div class="d-table">
      <div>
        <span>{datas.totalItems}</span>
        <span>Server</span>
        <span>Chapter</span>
        <span>Name</span>
        <span>Update</span>
      </div>
      {#each datas.links as link, i}
        <div class="link" id={link.Id}>
          <span>{i + 1 + start}</span>
          <span>
            <span data-id={link.ServerId} on:keydown>{link.Server?.Name.split(".")[0]}</span>
          </span>
          <span>
            <span
              class="ex-cfg"
              on:click={() => (showExcludeChapModal = link.Name)}
              on:keydown
              title="Show Exclude Chapt List "
            >
              <Icons name="cog" />
            </span>
            <span title={link.LastChapter}>{link.LastChapter}</span>
          </span>
          <span title={link.Name || nameFromurl(link.Url)}>
            <span on:click={removeLink} title="Remove Link" on:keydown>
              <Icons name="trash" color="firebrick" />
            </span>
            <span on:click={editLink} title="Edit Link" on:keydown>
              <Icons name="edit" />
            </span>
            <span on:click={onExcludeLink} title="Exclude Link From Group Download" on:keydown>
              <Icons name="files" box="0 0 464 512" color={link.Exclude ? "firebrick" : "#47f046"} />
            </span>
            <a href={link.Url} target="_blank">{link.Name || nameFromurl(link.Url)}</a>
          </span>
          <span>{dayfmt.format(new Date(link.Date))}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  @import "./styles.css";

  .d-controls .r-list :global(svg),
  .d-controls .btns :global(svg) {
    height: 32px;
    width: 35px;
    top: -1px;
  }

  .d-controls :global(.icon-list) {
    top: initial;
  }

  .d-table div > span:first-child {
    width: 50px;
    text-align: center;
    border-left: 1px solid;
  }
  .d-table div > span:nth-child(2) {
    width: 110px;
    cursor: pointer;
  }
  .d-table div > span:nth-child(3) {
    width: 80px;
    overflow: hidden;
    white-space: nowrap;
  }
  .d-table div > span:nth-child(4) {
    white-space: nowrap;
    flex-grow: 1;
    width: 300px;
    overflow-x: hidden;
  }
  .d-table div > span:last-child {
    width: 180px;
  }

  span a:hover {
    cursor: pointer;
    text-decoration: underline;
  }
  .d-table div:not(:first-child) > span:nth-child(3):hover {
    text-decoration: underline;
  }

  .d-controls :global(#filter-control) {
    max-width: 500px;
  }
</style>
