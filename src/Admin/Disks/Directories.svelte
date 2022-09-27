<script>
  import { onDestroy, onMount, getContext } from "svelte";
  import apiUtils from "../../api-utils";

  const socket = getContext("socket");
  let dirs = [];
  let msg = "";
  onMount(async () => {
    dirs = await apiUtils.admin(["directories"]);

    const reloadDir = ({ Id }) => {
      let dir = dirs.find((d) => d.Id === Id);
      if (dir) {
        dir.IsLoading = false;
        dirs = dirs;
      }
    };

    socket.on("reload", reloadDir);

    const scanInfo = (info) => {
      console.log(info);
    };
    socket.on("scan-info", scanInfo);
    return () => {
      socket.off("reload", reloadDir);
      socket.off("scan-info", scanInfo);
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
<table id="dir-list" class="table table-dark table-hover table-bordered">
  <thead>
    <tr>
      <th>Actions</th>
      <th>Name</th>
      <th>Type</th>
      <th>Folder Count</th>
      <th>Total Files</th>
      <th>Is Adult</th>
      <th>Full Path</th>
    </tr>
  </thead>
  <tbody>
    {#if dirs.length < 0}
      <tr class="text-center">
        <td colSpan="4">Not Directory Added</td>
      </tr>
    {:else}
      {#each dirs as { Id, Name, IsLoading, FullPath, Type, FolderCount, TotalFiles, IsAdult }}
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
          <td>{IsAdult}</td>
          <td>{FullPath}</td>
        </tr>
      {/each}
    {/if}
  </tbody>
</table>

<style>
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
  th:nth-child(3),
  th:nth-child(6) {
    max-width: 100px;
    width: 100px;
  }
  th:nth-child(4),
  th:nth-child(5) {
    max-width: 135px;
    width: 135px;
  }
</style>
