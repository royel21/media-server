<script>
  import { fade } from "svelte/transition";
  import Select from "../Component/Select.svelte";
  import { onMount } from "svelte";
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Input from "../Component/Input.svelte";

  export let hide;
  export let loadDownloads;
  export let addToDownload;
  let downloadList = [];
  let downloads = [];
  let item = {};
  let temp = { Name: "" };

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
    downloads = result.downloads;
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
      item = result.list;
      downloads = result.downloads;
      downloadList = [...downloadList, result.list].sort(sortList);
    }

    temp = { Name: "" };
  };

  const onChange = async ({ target: { value } }) => {
    item = downloadList.find((dl) => +dl.Id === +value);
    downloads = await getLinks(value);
  };

  const removeDList = async () => {
    const result = await apiUtils.post("admin/downloader/remove-dlist", { Id: item.Id });
    if (result.valid) {
      downloadList = downloadList.filter((dl) => dl.Id != +item.Id);
      if (downloadList.length) {
        item = downloadList[0];
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
      item = downloadList[0];
      downloads = result.downloads;
    }
  });
</script>

<div class="modal-container" tabindex="-1">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
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
    <div class="modal-body">
      {#if downloads.length}
        <ol>
          {#each downloads as { Id, Name, Url, LinkId }}
            <li>
              <span id={"dlink-" + Id} on:click={removeLink}> <Icons name="trash" color="firebrick" /></span>
              <span id={LinkId} on:click={addToDownload} title="Download This Link" on:keydown>
                <Icons name="download" />
              </span>
              <a href={Url} target="_blank">{Name || Url}</a>
            </li>
          {/each}
        </ol>
      {/if}
    </div>
    <div class="modal-footer">
      <button type="button" class="btn" on:click={onCancel}>Cancel</button>
      {#if temp.Name || temp.isNew}
        <button type="button" class="btn" on:click={updateName}>{temp.isNew ? "Save" : "Update Name"}</button>
      {:else}
        <button type="submit" class="btn" on:click={() => loadDownloads(item.Id)}>Load</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .modal {
    width: 500px;
    outline: none;
    padding: 0;
  }
  strong {
    color: black;
  }
  h3 {
    border-bottom: 1px solid;
  }
  .m-controls {
    display: flex;
    padding: 5px;
    border-bottom: 1px solid;
  }
  .modal-container :global(svg) {
    transform: scale(1.1);
  }
  .modal-body {
    display: flex;
    flex-direction: column;
    padding: 4px;
  }
  .modal-footer {
    border-top: 1px solid;
  }
  .modal-container :global(.input-control) {
    margin-bottom: 5px;
  }
  .modal-container :global(.input-label) {
    padding-left: 0.35rem;
    text-align: left;
    min-width: 100px;
  }

  a:hover {
    display: inline-block;
    cursor: pointer;
    text-decoration: underline;
    width: 100%;
  }

  li {
    white-space: nowrap;
    overflow-x: hidden;
  }

  ol {
    height: 232px;
    overflow-y: auto;
  }

  .btn {
    padding: 2px;
    min-width: 70px;
  }

  #sync {
    margin-left: 5px;
  }

  .modal-body :global(.icon-sync) {
    fill: blue;
  }

  @media screen and (max-width: 600px) {
    .modal {
      width: 400px;
    }
  }
</style>
