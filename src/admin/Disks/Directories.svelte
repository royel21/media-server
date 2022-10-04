<script>
  import { onMount, getContext } from "svelte";
  import apiUtils from "../../apiUtils";
  import RConsole from "../Component/RConsole.svelte";

  const socket = getContext("socket");
  let dirs = [];
  let msg = "";

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

  onMount(async () => {
    dirs = await apiUtils.admin(["directories"]);

    socket.on("reload", reloadDir);
    return () => {
      socket.off("reload", reloadDir);
    };
  });

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
</script>

<div class="message">{msg}</div>
<div class="table-container">
  <table id="dir-list" class="table table-dark table-hover table-bordered">
    <thead>
      <tr>
        <th>Actions</th>
        <th>Name</th>
        <th>Type</th>
        <th>Folder Count</th>
        <th>Total Files</th>
        <th>Is Adult</th>
        <th>First In List</th>
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
          <td data-name="FirstInList" on:click={updateDir}>{FirstInList}</td>
          <td>{FullPath}</td>
        </tr>
      {/each}
      <tr class="only">
        <td colSpan="4">Not Directory Added</td>
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
    width: 135px;
    min-width: 135px;
  }
  td:nth-child(6),
  td:nth-child(7) {
    cursor: pointer;
    width: 120px;
    min-width: 120px;
  }
</style>
