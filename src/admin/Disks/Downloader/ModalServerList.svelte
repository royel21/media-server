<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import Icons from "src/icons/Icons.svelte";
  import apiUtils from "src/apiUtils";

  export let server;
  export let link;
  export let error = "";
  export let hide;

  let servers = [];
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

  onMount(async () => {
    ref?.focus();
    await loadServers();
  });
</script>

<div bind:this={ref} class="modal-container" class:server on:keydown={onKeyDown} tabindex="-1">
  <div class="modal card" transition:fade={{ duration: 200 }}>
    <div class="modal-header">
      <h3>Server List</h3>
    </div>
    <div class="modal-body">
      <table class="table table-dark table-hover table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Enable</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each servers as ser}
            <tr id={ser.Id}>
              <td><a href={`https://${ser.Name}`} target="_blank">{ser.Name}</a></td>
              <td on:click={changeState}>{ser.Enable ? "True" : "False"}</td>
              <td>
                <span class="dir-remove ml-2" on:click={removeServer} on:keydown={() => {}}>
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
  .modal {
    width: 540px;
    outline: none;
  }

  .table th:first-child,
  .table td:first-child {
    text-align: left;
  }

  .table td:last-child,
  .table td:nth-child(2),
  .table tr th:nth-child(2),
  .table tr th:last-child {
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
