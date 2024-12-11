<script>
  import { onMount } from "svelte";
  import { excludeLink, updateLink } from "./utils";
  import { formatDate, nameFromurl } from "./utils";
  import ExcludeChapModal from "./ExcludeChapModal.svelte";
  import Modal from "./Modal.svelte";
  import RenameModal from "./RenameModal.svelte";
  import Icons from "src/icons/Icons.svelte";

  import { showConsoleStore, updateConsole } from "../Store/ConsoleStore";

  export let datas;
  export let updateDatas;
  export let socket;
  export let servers = false;
  export let removeLink;
  export let IsDownloading = false;
  export let loadItems;

  let start = 0;
  let editor = { show: false };
  let showRenamer = false;
  let showExcludeChapModal;
  let running = false;

  const onExcludeLink = async (e) => updateDatas(await excludeLink(e, datas));

  export const getLink = (target) => {
    const id = target.closest(".link")?.id;
    return datas.links.find((f) => f.Id === +id);
  };

  const downloadLink = async ({ target }) => {
    const id = target.closest(".link").id;
    if (id) {
      const found = datas.links.find((f) => f.Id === +id);
      if (found) {
        running = true;
        found.IsDownloading = true;
        socket.emit("download-server", {
          datas: [found.Id],
          action: "Add-Download",
        });
        datas.links = [...datas.links];
      }
    }
  };

  const onUpdate = (data) => {
    if (data.link) updateDatas(updateLink(data.link, datas), "links", data.link);
    if (data.text) updateConsole(data);
  };

  const editServer = ({ target }) => {
    const link = getLink(target);
    if (link) {
      editor = { show: true, server: servers[link.ServerId] };
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
    updateDatas([...datas.links]);
  };

  const downloadServer = ({ target: { dataset } }) => {
    running = true;
    socket.emit("download-server", { server: +dataset.id, action: "Check-Server" });
  };

  const getServName = ({ Name }) => {
    return Name.replace(/manga|manhua|manhwa|scan(s|)|toon/gi, "");
  };

  const changePage = (e) => {
    if (e.altKey) {
      e.preventDefault();
      if ([37, 39].includes(e.keyCode)) {
        const dir = e.keyCode === 37 ? -1 : 1;
        if (datas.page + dir > 0 && datas.page + dir <= datas.totalPages) {
          datas.page += dir;
          loadItems();
        }
      }
      if ([35, 36].includes(e.keyCode)) {
        datas.page = e.keyCode === 36 ? 1 : datas.totalPages;
        loadItems();
      }
    }
  };

  const focus = (e) => {
    setTimeout(() => {
      e?.focus();
    }, 0);
  };

  const updateRunning = ({ IsRunning }) => {
    if (!IsRunning && running) {
      loadItems();
    }
    running = IsRunning;
  };

  const handleActon = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      const type = e.target.id;
      if (type === "dwn") {
        downloadLink(e);
      } else {
        downloadServer(e);
      }
    }
  };

  onMount(() => {
    const dmanager = document.querySelector(".d-manager");

    dmanager.addEventListener("keydown", changePage);

    socket.on("link-update", onUpdate);
    socket.on("is-running", updateRunning);
    return () => {
      dmanager.removeEventListener("keydown", changePage);
      socket.off("link-update", onUpdate);
      socket.off("is-running", updateRunning);
    };
  });

  $: start = (datas.page - 1) * datas.items;
  $: updateDatas(running, "running");
</script>

{#if editor.show}
  <Modal server={editor.server} link={editor.link} hide={hideModal} />
{/if}

{#if showRenamer}
  <RenameModal hide={() => (showRenamer = false)} />
{/if}

{#if showExcludeChapModal}
  <ExcludeChapModal
    linkId={showExcludeChapModal}
    hide={() => {
      showExcludeChapModal = false;
    }}
  />
{/if}

<div class="t-container" class:hasconsole={$showConsoleStore} tabindex="-1" use:focus={focus}>
  <div class="d-table">
    <div>
      <span class="col-count">{datas.totalItems}</span>
      {#if servers}
        <span class="col-serv">Server</span>
      {/if}
      <span class="col-chapt">Chapter</span>
      <span class="col-name">Name</span>
      <span class="col-date">Update</span>
    </div>
    {#each datas.links as link, i}
      <div class="link" id={link.Id}>
        <span class="col-count">{i + 1 + start}</span>
        {#if servers}
          <span class="col-serv">
            <span on:click={editServer} title="Show Site Config"><Icons name="cog" /></span>
            <a id="serv" href="javascript(0)" on:keydown={handleActon}>
              <span data-id={link.ServerId} on:click={downloadServer}>{getServName(link.Server)}</span>
            </a>
          </span>
        {/if}
        <span class="col-chapt">
          <span class="ex-cfg" on:click={() => (showExcludeChapModal = link.Name)} title="Show Exclude Chapt List ">
            <Icons name="cog" />
          </span>
          <span title={link.LastChapter}>{link.LastChapter}</span>
        </span>
        <span class="col-name" title={link.Name || nameFromurl(link.Url)}>
          {#if !IsDownloading}
            <a id="dwn" href="javascript(0)" on:keydown={handleActon}>
              <span on:click={downloadLink} title="Download This Link">
                <Icons name="download" color={link.IsDownloading ? "green" : "lightblue"} />
              </span>
            </a>
          {/if}
          <span on:click={editLink} title="Edit Link">
            <Icons name="edit" />
          </span>
          <span on:click={onExcludeLink} title="Exclude Link From Group Download">
            <Icons name="files" box="0 0 464 512" color={link.Exclude ? "firebrick" : "#47f046"} />
          </span>
          <span on:click={removeLink} title="Remove Link">
            <Icons name="trash" color="firebrick" />
          </span>
          <a href={link.Url} target="_blank" tabindex="-1">{link.Name || nameFromurl(link.Url)}</a>
        </span>
        <span class="col-date">{formatDate(new Date(link.Date))}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .hasconsole {
    height: calc(100% - 170px);
  }

  #serv:focus {
    text-decoration: underline;
  }
  #dwn:focus :global(svg) {
    filter: drop-shadow(0px 0px 4px rgb(0 255 0 / 0.9));
  }
</style>
