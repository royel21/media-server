<script>
  import Icons from "src/icons/Icons.svelte";
  import apiUtils from "src/apiUtils";
  import { onMount, getContext } from "svelte";
  const socket = getContext("socket");
  //clean-images
  let backups = [];
  let isMounted = true;

  const onBackup = () => {
    socket.emit("backup-db", { event: "backup" });
  };

  const restoreBackup = ({ target }) => {
    const bckp = target.closest("tr").id;
  };

  const removeBackup = async ({ target }) => {
    const backup = target.closest("tr").id;
    const result = await apiUtils.post("admin/directories/rm-backup", { backup });
    if (result.success) {
      backups = backups.filter((bk) => bk !== backup);
    }
  };

  const reload = async () => {
    const result = await apiUtils.get(["admin", "directories", "backups"]);
    if (result && isMounted) {
      backups = result.sort().reverse();
    }
  };

  const onUpdateServer = () => {
    socket.emit("update-server", {});
  };
  const rebuildAndReload = () => {
    socket.emit("update-server", { reload: true });
  };

  onMount(async () => {
    reload();
    socket.on("reload-backups", reload);
    return () => {
      isMounted = false;
      apiUtils.cancelQuery();
      socket.off("reload-backups", reload);
    };
  });

  document.title = "Tools";
</script>

<div>
  <div>
    <button class="btn" on:click={onBackup}>Backup</button>
    <button class="btn" on:click={onUpdateServer}>Build App</button>
    <button class="btn" on:click={rebuildAndReload}>Reload Server</button>
  </div>
  <div class="data-table">
    <table class="table table-dark table-hover table-bordered">
      <thead>
        <tr>
          <th>No.</th>
          <th class="action">Action</th>
          <th>Bakups</th>
        </tr>
      </thead>
      <tbody>
        {#each backups as backup, i}
          <tr id={backup}>
            <td>{i + 1}</td>
            <td class="action">
              <span on:click={restoreBackup}><Icons name="sync" /></span>
              <span on:click={removeBackup}><Icons name="trash" /></span>
            </td>
            <td>{backup}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .data-table {
    margin-top: 10px;
  }

  tr td:first-child,
  tr th:first-child {
    width: 50px;
    min-width: 50px;
  }

  tr td:last-child {
    font-size: 0.8rem;
  }

  .action {
    width: 90px;
    max-width: 90px;
    text-align: center;
  }
</style>
