<script>
  import { onDestroy, onMount, getContext } from "svelte";
  import apiUtils from "../../api-utils";

  const socket = getContext("socket");
  let dirs = [];
  let msg = "";
  onMount(async () => {
    dirs = await apiUtils.admin(["directories"]);
    socket.on("scan-finish", ({ id }) => {
      if (id) {
        let dir = dirs.find((d) => d.Id === id);
        dir.IsLoading = false;
        dirs = dirs;
      }
    });

    socket.on("scan-info", (info) => {
      console.log(info);
    });
  });

  onDestroy(() => {
    delete socket._callbacks["$scan-finish"];
    delete socket._callbacks["$scan-info"];
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
      <th>Full Path</th>
    </tr>
  </thead>
  <tbody>
    {#if dirs.length < 0}
      <tr class="text-center">
        <td colSpan="4">Not Directory Added</td>
      </tr>
    {:else}
      {#each dirs as { Id, Name, IsLoading, FullPath, Type }}
        <tr id={Id} key={Id}>
          <td>
            <span class="dir-sync" on:click={rescan}>
              <i class={"fas fa-sync" + (IsLoading ? " fa-spin" : "")} />
            </span>
            <span class="dir-remove ml-2" on:click={removeDir}>
              <i class="fas fa-trash-alt" />
            </span>
          </td>
          <td>{Name}</td>
          <td>{Type}</td>
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
</style>
