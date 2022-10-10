<script>
  import { onMount, getContext } from "svelte";
  import apiUtils from "../../apiUtils";
  import RConsole from "./RConsole.svelte";

  const socket = getContext("socket");
  let dirs = [];
  let msg = "";
  let dir;
  let showInput = false;
  let count = 0;

  const reloadDir = ({ Id }) => {
    let dir = dirs.find((d) => d.Id === Id);
    if (dir) {
      dir.IsLoading = false;
      dirs = dirs;
    }
  };

  const updateDir = async ({ currentTarget }) => {
    const { id, dataset } = currentTarget;
    let tr = currentTarget.closest("tr");
    let name = dataset.name;
    let index = dirs.findIndex((d) => d.Id === tr.id);
    if (dirs[index]) {
      const data = await apiUtils.post("admin/directories/update", { id: tr.id, [name]: !dirs[index][name] });
      if (data.success) {
        dirs[index][name] = !dirs[index][name];
      }
    }
  };

  const removeDir = async (e) => {
    let tr = e.target.closest("tr");
    if (tr) {
      const result = await apiUtils.post("admin/directories/remove", { Id: tr.id });
      if (result.removed) {
        dirs = dirs.filter((d) => d.Id !== tr.id);
        dirs = dirs;
      } else {
        msg = result.msg;
      }
    }
  };

  const rescan = (e) => {
    let tr = e.target.closest("tr");
    let dir = dirs.find((d) => d.Id === tr.id);
    socket.emit("scan-dir", { Id: dir.Id });
    dir.IsLoading = true;
    dirs = dirs;
  };

  const onShowInput = ({ target }) => {
    let tr = target.closest("tr");
    let found = dirs.find((d) => d.Id === tr.id);
    if (found) {
      dir = found;
      showInput = true;
    }
  };

  const hideInput = () => {
    apiUtils.post("admin/directories/update", { id: dir.Id, FirstInList: dir.FirstInList });
    showInput = false;
  };

  const focusInput = (node) => node?.focus();

  onMount(async () => {
    dirs = await apiUtils.admin(["directories"]);
    if (dirs) {
      dirs.forEach((d) => (count += d.FolderCount));
    }

    socket.on("reload", reloadDir);
    return () => {
      socket.off("reload", reloadDir);
    };
  });
</script>

<div class="message">{msg}</div>
<div class="table-container">
  <table id="dir-list" class="table table-dark table-hover table-bordered">
    <thead>
      <tr>
        <th>Actions</th>
        <th>Name</th>
        <th>Type</th>
        <th>Folder {count}</th>
        <th>Total Files</th>
        <th>Is Adult</th>
        <th>Order In Menu</th>
        <th>Full Path</th>
      </tr>
    </thead>
    <tbody>
      {#each dirs as { Id, Name, IsLoading, FullPath, Type, FolderCount, TotalFiles, IsAdult, FirstInList }}
        <tr id={Id} key={Id}>
          <td>
            <span class="dir-sync" on:click={rescan}>
              <i class={"fas fa-sync" + (IsLoading ? " fa-spin" : "")} />
            </span>
            <span class="dir-remove ml-2" on:click={removeDir}>
              <i class="fas fa-trash-alt" />
            </span>
          </td>
          <td><div>{Name}</div></td>
          <td>{Type}</td>
          <td>{FolderCount}</td>
          <td>{TotalFiles}</td>
          <td data-name="IsAdult" on:click={updateDir}>{IsAdult}</td>
          <td class="order" on:click|stopPropagation={onShowInput}>
            {#if showInput && Id === dir.Id}
              <input bind:value={dir.FirstInList} on:blur={hideInput} use:focusInput />
            {:else}
              {FirstInList}
            {/if}
          </td>
          <td>{FullPath}</td>
        </tr>
      {/each}
      <tr class="only">
        <td colSpan="8">Go to Server and Select Root Directory of files</td>
      </tr>
    </tbody>
  </table>
</div>
<RConsole />

<style>
  .table-container {
    height: calc(100% - 180px);
  }
  .message {
    display: none;
  }
  .message:not(:empty) {
    display: block;
    color: red;
  }
  td div {
    width: 50px;
  }
  td:nth-child(2),
  th:nth-child(2) {
    white-space: nowrap;
    overflow: hidden;
    min-width: 150px;
    width: 10%;
  }
  th:nth-child(3) {
    min-width: 100px;
    width: 100px;
  }
  th:nth-child(4),
  th:nth-child(5) {
    width: 115px;
    min-width: 115px;
  }
  td:nth-child(6),
  td:nth-child(7) {
    cursor: pointer;
    width: 130px;
    min-width: 130px;
  }
  td:nth-child(7) {
    text-align: center;
  }
  .order:has(input) {
    padding: 0;
  }
  .order input {
    width: 100%;
    height: 36px;
    outline: none;
    text-align: center;
  }
</style>
