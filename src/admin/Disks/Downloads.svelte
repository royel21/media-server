<script>
  import { onMount, getContext } from "svelte";
  import apiUtils from "../../apiUtils";
  import Filter from "../../ShareComponent/Filter.svelte";
  import Pagination from "../../ShareComponent/Pagination.svelte";
  import Icons from "../../icons/Icons.svelte";

  let start = 0;

  const socket = getContext("socket");

  const datas = {
    links: [],
    page: 1,
    totalPages: 50,
    totalItems: 0,
    items: 30,
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

  const downloadServer = ({ target: { textContent } }) => {
    // socket.emit("download-server", { name: textContent });
    console.log(textContent);
  };

  const onFilter = ({ detail }) => {
    datas.filter = detail;
    // download(detail);
    loadItems();
  };

  const loadItems = async () => {
    const result = await apiUtils.get(["admin", "downloader", "links", datas.items, datas.page, datas.filter]);

    datas.links = result.links;
    datas.totalPages = result.totalPages;
    datas.totalItems = result.totalItems;
    console.log(result, datas);
  };

  const gotopage = ({ detail }) => {
    datas.page = detail;
    loadItems();
  };

  const excludeLink = async ({ target }) => {
    const id = target.closest(".link").id;
    if (id) {
      const result = await apiUtils.get(["admin", "downloader", "exclude-link", id]);
      if (result.valid) {
        const found = datas.links.findIndex((f) => f.Id === +id);
        if (found) {
          datas.links[found].Exclude = !datas.links[found].Exclude;
        }
      }
    }
  };
  const downloadLink = async ({ target }) => {
    const id = target.closest(".link").id;
    if (id) {
      // await apiUtils.get(["admin", "downloader", "links", datas.items, datas.page, datas.filter]);
      console.log("download", id);
    }
  };
  const editLink = async ({ target }) => {
    const id = target.closest(".link").id;
    if (id) {
      // await apiUtils.get(["admin", "downloader", "links", datas.items, datas.page, datas.filter]);
      console.log("edit", id);
    }
  };
  const removeLink = async ({ target }) => {
    const id = target.closest(".link").id;
    if (id) {
      const result = await apiUtils.get(["admin", "downloader", "remove-link", id]);
      console.log("remove", id, result);
    }
  };

  onMount(() => {
    loadItems();
  });

  $: start = (datas.page - 1) * datas.items;
</script>

<div class="container">
  <div class="d-controls">
    <Filter on:filter={onFilter} filter={datas.filter} />
    <span>
      <Pagination page={datas.page} totalPages={datas.totalPages} on:gotopage={gotopage} />
      <div class="input-group d-items">
        <span class="input-group-text">Items</span><input class="form-control" bind:value={datas.items} k />
      </div>
    </span>
  </div>
  <div class="t-container">
    <div class="d-table">
      <div>
        <span>3650</span>
        <span>Actions</span>
        <span>Server</span>
        <span>Chapter</span>
        <span>Name</span>
        <span>Update</span>
      </div>
      {#each datas.links as link, i}
        <div class="link" id={link.Id}>
          <span>{i + 1 + start}</span>
          <span>
            <span on:click={excludeLink} title="Exclude Link">
              <Icons name="files" box="0 0 464 512" color={link.Exclude ? "firebrick" : "#47f046"} />
            </span>
            <span on:click={downloadLink} title="Download Link">
              <Icons name="download" color="lightblue" />
            </span>
            <span on:click={editLink} title="Edit Link">
              <Icons name="edit" />
            </span>
            <span on:click={removeLink} title="Remove Link">
              <Icons name="trash" color="firebrick" />
            </span>
          </span>
          <span on:click={downloadServer}>{link.Server?.Name}</span>
          <span>{link.LastChapter}</span>
          <span title={link.Name}><span>{link.Name}</span></span>
          <span>{dayfmt.format(new Date(link.Date))}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .d-controls {
    display: flex;
    flex-direction: row;
    margin-bottom: 10px;
    justify-content: space-between;
  }
  .d-controls span:last-child {
    display: flex;
  }
  .d-items {
    width: 108px;
    margin-left: 5px;
  }
  .d-items > * {
    height: 32px;
  }
  .container {
    width: 100%;
    height: 100%;
  }
  .t-container {
    position: relative;
    width: 100%;
    min-height: calc(100% - 37px);
    height: calc(100% - 37px);
    overflow-x: auto;
  }
  .d-table {
    min-width: 850px;
  }
  .d-table > div:first-child {
    position: sticky;
    border: 1px solid;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    background-color: #212529;
    top: 0;
    z-index: 99;
  }
  .d-table > div {
    display: flex;
    flex-direction: row;
  }
  .d-table > div:not(:first-child) {
    border-left: 1px solid;
    border-right: 1px solid;
  }
  .d-table > div:not(:last-child) {
    border-bottom: 1px solid;
  }
  .d-table div > span {
    padding: 0.2rem;
  }
  .d-table div > span:not(:last-child) {
    border-right: 1px solid;
  }
  .d-table div > span:first-child {
    width: 50px;
    text-align: center;
  }
  .d-table div > span:nth-child(2) {
    width: 124px;
  }
  .d-table div > span:nth-child(3) {
    width: 120px;
    cursor: pointer;
  }
  .d-table div > span:nth-child(4) {
    width: 80px;
  }
  .d-table div > span:nth-child(5) {
    white-space: nowrap;
    flex-grow: 1;
    width: 300px;
    overflow-x: hidden;
  }
  .d-table div > span:last-child {
    width: 175px;
  }
  .d-table div:not(:first-child) > span:nth-child(3):hover {
    text-decoration: underline;
  }
</style>
