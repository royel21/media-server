<script>
  import { fade } from "svelte/transition";
  import Select from "src/ShareComponent/Select.svelte";
  import { onMount } from "svelte";
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Input from "../Component/Input.svelte";
  import { sortByName } from "src/ShareComponent/utils";
  import Filter from "src/ShareComponent/Filter.svelte";
  import Dialog from "src/ShareComponent/Dialog.svelte";

  export let hide;
  export let loadDownloads;
  export let addToDownload;
  let downloadList = [];
  let downloads = [];
  let item = {};
  let filter = "";
  let temp = { Name: "" };

  const filterDownloads = (dl) => {
    const regx = new RegExp(filter, "i");
    return regx.test(dl.Name) || regx.test(dl.Url);
  };

  const sortList = (a, b) => a.Name.localeCompare(b.Name);
  //nhentai-list
  const getLinks = async (Id) => await apiUtils.get(["admin", "downloader", "downloads", Id]);

  const onCancel = () => {
    if (temp.Name || temp.isNew) {
      temp = { Name: "" };
    } else {
      hide();
    }
  };

  const addNew = () => {
    temp.isNew = true;
  };

  const reloadLinks = async () => {
    const result = await apiUtils.post("admin/downloader/save-downloads", { Name: item.Name });
    downloads = result.downloads.sort(sortByName);
  };

  const updateName = async () => {
    let result = {};
    if (temp.isNew) {
      result = await apiUtils.post("admin/downloader/save-downloads", { Name: temp.Name });
    } else {
      result = await apiUtils.post("admin/downloader/update-dlist-name", { Id: item.Id, Name: temp.Name });
    }

    if (result.error) {
      return (error = result.error);
    }

    if (!temp.isNew) {
      item.Name = temp.Name;
    } else {
      item = { ...result.list };
      downloads = result.downloads;
      downloadList = [...downloadList, result.list].sort(sortList);
    }

    temp = { Name: "" };
  };

  const onChange = async ({ target: { value } }) => {
    const found = downloadList.find((dl) => +dl.Id === +value);
    if (found) {
      item = { ...found };
      downloads = await getLinks(found.Id);
    }
  };

  const removeDList = async () => {
    const result = await apiUtils.post("admin/downloader/remove-dlist", { Id: item.Id });
    if (result.valid) {
      downloadList = downloadList.filter((dl) => dl.Id != +item.Id);
      if (downloadList.length) {
        item = { ...downloadList[0] };
        downloads = await getLinks(item.Id);
      } else {
        downloads = [];
      }
    }
  };

  const removeLink = async ({ currentTarget: { id } }) => {
    const Id = +id.replace("dlink-", "");
    const result = await apiUtils.post("admin/downloader/remove-dlink", { Id });
    if (result.valid) {
      downloads = downloads.filter((dl) => dl.Id !== Id);
    }
  };

  onMount(async () => {
    const result = await apiUtils.get(["admin", "downloader", "download-list"]);
    if (result.DownloadingList.length) {
      downloadList = result.DownloadingList;
      item = { ...downloadList[0] };
      downloads = result.downloads.sort(sortByName);
    }
  });

  let filtered = [];

  $: filter, (filtered = downloads.filter(filterDownloads));
</script>

<Dialog id="server-modal">
  <div class="modal-header" slot="modal-header">
    <h3>Saved Download List <strong>- {downloads.length}</strong></h3>
    <div class="m-controls">
      {#if temp.isNew || temp.Name}
        <Input label="Edit Name" key="Name" item={temp} />
      {:else}
        <span on:click={addNew}><Icons name="squareplus" /></span>
        {#if !temp.isNew}
          <span on:click={() => (temp.Name = item.Name)}><Icons name="edit" /></span>
        {/if}
        <span on:click={removeDList}><Icons name="trash" /></span>
        <span id="sync" on:click={reloadLinks}><Icons name="sync" /></span>
        <Select label="Downloads" key="Id" {item} options={downloadList} {onChange} />
      {/if}
    </div>
  </div>
  <div class="modal-body" slot="modal-body">
    <div class="dl-filter">
      <Filter bind:filter />
    </div>
    <ol>
      {#each filtered as { Id, Name, Url, LinkId }}
        <li>
          <span id={"dlink-" + Id} on:click={removeLink}> <Icons name="trash" color="firebrick" /></span>
          <span id={LinkId} on:click={addToDownload} title="Download This Link" on:keydown>
            <Icons name="download" />
          </span>
          <a href={Url} target="_blank">{Name || Url}</a>
        </li>
      {/each}
    </ol>
  </div>
  <div class="modal-footer" slot="modal-footer">
    {#if temp.Name || temp.isNew}
      <button type="button" class="btn" on:click={updateName}>{temp.isNew ? "Save" : "Update Name"}</button>
    {:else}
      <button type="submit" class="btn" on:click={() => loadDownloads(item.Id)}>Load</button>
    {/if}
    <button type="button" class="btn" on:click={onCancel}>Cancel</button>
  </div>
</Dialog>

<style>
  strong {
    color: black;
  }
  .dl-filter {
    padding: 5px;
  }
  .dl-filter :global(#filter-control) {
    max-width: 100%;
  }

  h3 {
    border-bottom: 1px solid;
  }
  .m-controls {
    display: flex;
    padding: 5px;
  }
  .modal-body {
    display: flex;
    flex-direction: column;
  }
  .modal-footer {
    border-top: 1px solid;
  }

  a:hover {
    display: inline-block;
    cursor: pointer;
    text-decoration: underline;
    width: 100%;
  }

  li {
    white-space: nowrap;
    padding: 2px 5px;
  }

  ol {
    height: 232px;
    overflow-y: auto;
  }

  .btn {
    padding: 2px;
    min-width: 70px;
  }
</style>
