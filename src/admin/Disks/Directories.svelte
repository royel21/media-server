<script>
  import { onMount, getContext } from "svelte";
  import apiUtils from "../../apiUtils";
  import Icons from "../../icons/Icons.svelte";

  const socket = getContext("socket");
  let dirs = [];
  let msg = "";
  let dir;
  let showInput = false;
  let count = 0;
  let allFiles = 0;

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
      dirs.forEach((d) => {
        count += d.FolderCount;
        allFiles += d.TotalFiles;
      });
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
        <th>Type</th>
        <th>Is Adult</th>
        <th>Path</th>
        <th>Folder {count}</th>
        <th>Total Files {allFiles}</th>
        <th>Order In Menu</th>
      </tr>
    </thead>
    <tbody>
      {#each dirs as { Id, IsLoading, Name, FullPath, Type, FolderCount, TotalFiles, IsAdult, FirstInList }}
        <tr id={Id} key={Id}>
          <td>
            <span class="dir-sync" on:click={rescan} on:keydown={() => {}}>
              <Icons name="sync" class={IsLoading ? "icon-spin" : ""} box="0 0 512 512" />
            </span>
            <span class="dir-remove ml-2" on:click={removeDir} on:keydown={() => {}}>
              <Icons name="trash" />
            </span>
          </td>
          <td>{Type}</td>
          <td data-name="IsAdult" on:click={updateDir} on:keydown={() => {}}>{IsAdult}</td>
          <td class="f-path">{FullPath}</td>
          <td class="f-name" title={FullPath}>{Name}</td>
          <td>{FolderCount}</td>
          <td>{TotalFiles}</td>
          <td class="order" on:click|stopPropagation={onShowInput} on:keydown={() => {}}>
            {#if showInput && Id === dir.Id}
              <input bind:value={dir.FirstInList} on:blur={hideInput} use:focusInput />
            {:else}
              {FirstInList}
            {/if}
          </td>
        </tr>
      {/each}
      <tr class="only">
        <td colSpan="8">Go to Server and Select Root Directory of files</td>
      </tr>
    </tbody>
  </table>
</div>

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
  th:first-child {
    width: 90px;
    min-width: 90px;
  }
  th:nth-child(2) {
    min-width: 80px;
    width: 80px;
  }
  td:nth-child(3) {
    min-width: 90px;
    width: 90px;
    cursor: pointer;
  }
  td:nth-child(4) {
    white-space: nowrap;
  }
  th:nth-child(5) {
    min-width: 120px;
    width: 120px;
  }
  td:nth-child(6) {
    width: 155px;
    min-width: 155px;
  }
  td:last-child {
    text-align: center;
    cursor: pointer;
    width: 155px;
    min-width: 155px;
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
  .f-name {
    display: none;
  }

  @media screen and (max-width: 500px) {
    .f-name {
      display: table-cell;
    }
    .f-path {
      display: none;
    }
  }
</style>
