<script>
  import { fade } from "svelte/transition";
  import Select from "../Component/Select.svelte";
  import { onMount } from "svelte";
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";

  export let hide;
  export let loadDownloads;
  let downloadList = [];
  let downloads = [];
  let item = {};

  const getLinks = async (Id) => await apiUtils.get(["admin", "downloader", "downloads", Id]);

  const onChange = async ({ target: { value } }) => {
    item.Id = +value;
    downloads = await getLinks(value);
  };

  const removeDList = async () => {
    const result = await apiUtils.post("admin/downloader/remove-dlist", { Id: item.Id });
    if (result.valid) {
      downloadList = downloadList.filter((dl) => dl.Id != +item.Id);
      if (downloadList.length) {
        downloads = getLinks(downloadList[0].Id);
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
      item.Id = downloadList[0].Id;
      downloads = result.downloads;
    }
  });
</script>

<div class="modal-container" tabindex="-1">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h3>Save Download List</h3>
    </div>
    <div class="modal-body">
      <Select label="Downloads" key="Id" {item} options={downloadList} {onChange} />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn" on:click={hide}>Cancel</button>
      <button type="button" class="btn" on:click={removeDList}>Remove</button>
      <button type="submit" class="btn" on:click={() => loadDownloads(item.Id)}>Load</button>
    </div>
    {#if downloads.length}
      <h4>Links</h4>
      <ol>
        {#each downloads as { Id, Name, Url }}
          <li>
            <span id={"dlink-" + Id} on:click={removeLink}> <Icons name="trash" color="firebrick" /></span>
            <a href={Url} target="_blank">{Name}</a>
          </li>
        {/each}
      </ol>
    {/if}
  </div>
</div>

<style>
  .modal {
    width: 360px;
    outline: none;
  }
  .modal-container :global(.input-control) {
    margin-bottom: 5px;
  }
  .modal-container :global(.input-label) {
    padding-left: 0.35rem;
    text-align: left;
    min-width: 100px;
  }

  h4 {
    text-align: center;
    border-top: 1px solid white;
    border-bottom: 1px solid white;
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
</style>
