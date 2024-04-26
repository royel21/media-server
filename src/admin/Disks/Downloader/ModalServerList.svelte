<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import Icons from "src/icons/Icons.svelte";
  import apiUtils from "src/apiUtils";
  import Filter from "src/ShareComponent/Filter.svelte";

  export let server = "";
  export let hide;

  let servers = [];
  let filtered = [];
  let filterValue = "";
  let reload = false;
  let ref;

  const onKeyDown = (e) => {
    if (e.keyCode === 13 && e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.keyCode === 27) hide();
  };

  const loadServers = async () => {
    const result = await apiUtils.admin(["downloader", "servers-list"]);
    if (result.valid) {
      servers = result.servers;
    }
  };

  const changeState = async ({ target }) => {
    const server = servers.find((ser) => ser.Id.toString() === target.closest("tr")?.id);

    if (server) {
      const result = await apiUtils.admin(["downloader", "servers-list", "change", server.Id]);
      if (result.valid) server.Enable = !server.Enable;
      servers = servers;
      reload = true;
    }
  };
  const removeServer = async ({ target }) => {
    const Id = target.closest("tr")?.id;
    const result = await apiUtils.admin(["downloader", "servers-list", "delete", Id]);
    if (result.valid) {
      servers = servers.filter((ser) => ser.Id.toString() != Id);
      reload = true;
    }
  };

  const onClose = () => hide(reload);

  const filter = ({ detail }) => (filterValue = detail);

  $: {
    filtered = servers.filter((sv) => sv.Name.includes(filterValue)) || sv.Type.includes(filterValue);
  }

  onMount(async () => {
    ref?.focus();
    await loadServers();
  });
</script>

<div bind:this={ref} class="modal-container" class:server on:keydown={onKeyDown} tabindex="-1">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h3>Server List</h3>
      <div id="filter">
        <Filter on:filter={filter} />
      </div>
    </div>
    <div class="modal-body">
      <table class="table table-dark table-hover table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Enable</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filtered as ser}
            <tr id={ser.Id}>
              <td><a href={`https://${ser.Name}`} target="_blank">{ser.Name}</a></td>
              <td>{ser.Type}</td>
              <td on:click={changeState} on:keydown>{ser.Enable ? "True" : "False"}</td>
              <td>
                <span class="dir-remove ml-2" on:click={removeServer}>
                  <Icons name="trash" />
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn" on:click={onClose}>Close</button>
    </div>
  </div>
</div>

<style>
  #filter {
    padding: 0 5px;
    margin-bottom: 5px;
  }
  #filter > :global(#filter-control) {
    max-width: 100%;
  }
  #filter :global(input) {
    margin: 0;
  }
  .modal-header {
    border-bottom: 1px solid;
  }
  .modal {
    width: 560px;
    outline: none;
    padding: 0;
  }
  .modal-body {
    height: 400px;
    overflow-y: auto;
    padding: 5px;
  }

  .table th:first-child,
  .table td:first-child {
    text-align: left;
  }

  .table td:last-child,
  .table td:nth-child(2),
  .table td:nth-child(3),
  .table th:nth-child(2),
  .table th:nth-child(3),
  .table th:last-child {
    width: 60px;
    max-width: 60px;
    text-align: center;
    user-select: none;
  }

  .table td:nth-child(2) {
    cursor: pointer;
  }

  a:hover {
    cursor: pointer;
    text-decoration: underline;
  }

  @media screen and (max-width: 450px) {
    .modal {
      width: 380px;
    }
  }

  @media screen and (max-height: 600px) {
    .server {
      overflow: auto;
      padding-top: 95px;
    }
  }
</style>
