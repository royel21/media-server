<script>
  import { excludeLink, updateLink } from "./utils";
  import { formatDate, nameFromurl } from "./utils";
  import ExcludeChapModal from "./ExcludeChapModal.svelte";
  import Modal from "./Modal.svelte";
  import RenameModal from "./RenameModal.svelte";
  import Icons from "src/icons/Icons.svelte";
  import { onMount } from "svelte";

  export let datas;
  export let updateLinkList;
  export let socket;
  export let servers = false;
  export let removeLink;
  export let IsDownloading = false;

  let start = 0;
  let editor = { show: false };
  let showRenamer = false;
  let showExcludeChapModal;
  let running = false;

  const onExcludeLink = async (e) => updateLinkList(await excludeLink(e, datas));

  export const getLink = (target) => {
    const id = target.closest(".link")?.id;
    return datas.links.find((f) => f.Id === +id);
  };

  const downloadLink = async ({ target }) => {
    const id = target.closest(".link").id;
    if (id) {
      const found = datas.links.find((f) => f.Id === +id);
      if (found) {
        datas.running = true;
        found.IsDownloading = true;
        socket.emit("download-server", {
          datas: [found.Id],
          action: "Add-Download",
        });
        datas.links = [...datas.links];
      }
    }
  };

  const onUpdate = ({ link }) => {
    if (link.remove) {
      updateLinkList(datas.links.filter((f) => f.Id !== link?.Id));
    } else {
      updateLinkList(updateLink(link, datas));
    }
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
    updateLinkList([...datas.links]);
  };

  const downloadServer = ({ target: { dataset } }) => {
    running = true;
    socket.emit("download-server", { server: +dataset.id, action: "Check-Server" });
  };

  const getServName = ({ Name }) => {
    return Name.replace(/manga|manhua|manhwa|scan(s|)|toon/gi, "");
  };

  onMount(() => {
    socket.on("update-download", onUpdate);
    return () => {
      socket.off("update-download", onUpdate);
    };
  });

  $: start = (datas.page - 1) * datas.items;
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

<div class="t-container">
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
            <span on:click={editServer} on:keydown title="Show Site Config"><Icons name="cog" /></span>
            <span data-id={link.ServerId} on:click={downloadServer} on:keydown>{getServName(link.Server)}</span>
          </span>
        {/if}
        <span class="col-chapt">
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
        <span class="col-name" title={link.Name || nameFromurl(link.Url)}>
          {#if !IsDownloading}
            <span on:click={downloadLink} title="Download This Link" on:keydown>
              <Icons name="download" color={link.IsDownloading ? "green" : "lightblue"} />
            </span>
          {/if}
          <span on:click={editLink} title="Edit Link" on:keydown>
            <Icons name="edit" />
          </span>
          <span on:click={onExcludeLink} title="Exclude Link From Group Download" on:keydown>
            <Icons name="files" box="0 0 464 512" color={link.Exclude ? "firebrick" : "#47f046"} />
          </span>
          <span on:click={removeLink} title="Remove Link" on:keydown>
            <Icons name="trash" color="firebrick" />
          </span>
          <a href={link.Url} target="_blank">{link.Name || nameFromurl(link.Url)}</a>
        </span>
        <span class="col-date">{formatDate(new Date(link.Date))}</span>
      </div>
    {/each}
  </div>
</div>
