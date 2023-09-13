<script>
  import { onMount, getContext } from "svelte";
  import apiUtils from "../../apiUtils";
  import Filter from "../../ShareComponent/Filter.svelte";
  import Pagination from "../../ShareComponent/Pagination.svelte";

  const socket = getContext("socket");
  const datas = {
    links: [],
    page: 1,
    totalPages: 50,
    totalItems: 0,
    items: 10,
    filter: "",
  };
  let server = "";

  const download = () => {
    socket.emit("download-server", { name: datas.filter });
    console.log("send", { name: server });
  };

  const onFilter = ({ detail }) => {
    datas.filter = detail;
    download(detail);
  };

  const loadItems = async () => {
    const result = await apiUtils.get(["admin", "downloader", "links", datas.items, datas.page, datas.filter]);
    console.log(result);
  };

  const gotopage = (pg) => {
    console.log(pg);
  };

  onMount(() => {
    loadItems();
  });
</script>

<div class="container">
  <div class="controls">
    <Filter on:filter={onFilter} filter={datas.filter} />
    <span>
      <Pagination page={datas.page} totalPages={datas.totalPages} on:gotopage={gotopage} />
      <div class="input-group items">
        <span class="input-group-text">Items</span><input class="form-control" bind:value={datas.items} k />
      </div>
    </span>
  </div>
  <div class="t-container">
    <table id="dir-list" class="table table-dark table-hover table-bordered">
      <thead>
        <tr>
          <th>{datas.totalItems}</th>
          <th>Actions</th>
          <th>Server</th>
          <th>Chapter</th>
          <th>Name</th>
          <th>Update</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>items</td>
          <td>items</td>
          <td>items items items</td>
          <td>items items items</td>
          <td>items items items</td>
          <td>10/6/2023 04:53</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<style>
  .controls {
    display: flex;
    flex-direction: row;
    margin-bottom: 10px;
    justify-content: space-between;
  }
  .controls span:last-child {
    display: flex;
  }
  .items {
    width: 108px;
    margin-left: 5px;
  }
  .items > * {
    height: 32px;
  }
  .container {
    width: 100%;
    height: 100%;
  }

  .t-container {
    width: 100%;
    min-height: calc(100% - 35px);
    overflow-x: auto;
  }
  .table {
    min-width: max-content;
    margin: 0;
  }
  th:first-child {
    width: 50px;
    min-width: 50px;
  }
</style>
