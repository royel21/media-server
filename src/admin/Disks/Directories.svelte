<script>
  import { onMount, getContext } from "svelte";
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import { MessageStore, setMessage } from "../Store/MessageStore";

  const socket = getContext("socket");
  let dirs = [];
  let msg = "";
  let dir;
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

  const hideInput = async ({ target }) => {
    const { name, value } = target;
    if (value !== dir[name].toString()) {
      const result = await apiUtils.post("admin/directories/update", { id: dir.Id, [name]: value });

      if (result.error) {
        target.parentElement.innerHTML = dir[name];
        return setMessage({ msg: result.error, ...result });
      }
      dir[name] = value;
      target.parentElement.innerHTML = value;
    }
  };

  const onShowInput = ({ target }) => {
    let tr = target.closest("tr");
    let found = dirs.find((d) => d.Id === tr.id);
    if (found) {
      dir = found;
      target.innerHTML = "";
      const input = document.createElement("input");
      input.name = target.id;
      input.value = found[target.id];
      input.onblur = hideInput;
      target.appendChild(input);
      input.focus();
    }
  };

  onMount(async () => {
    dirs = await apiUtils.admin(["directories"]);
    if (dirs?.length) {
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
        <th class="d-action">Actions</th>
        <th class="d-type">Type</th>
        <th class="f-name">Name</th>
        <th class="f-path">Path</th>
        <th class="d-adult">Is Adult</th>
        <th class="d-cont">Folder {count}</th>
        <th class="d-total">Total Files {allFiles}</th>
        <th class="d-order">Order In Menu</th>
      </tr>
    </thead>
    <tbody>
      {#each dirs as { Id, IsLoading, Name, FullPath, Type, FolderCount, TotalFiles, IsAdult, FirstInList }}
        <tr id={Id} key={Id}>
          <td>
            <span class="dir-sync" on:click={rescan}>
              <Icons name="sync" class={IsLoading ? "icon-spin" : ""} box="0 0 512 512" />
            </span>
            <span class="dir-remove ml-2" on:click={removeDir}>
              <Icons name="trash" />
            </span>
          </td>
          <td>{Type}</td>
          <td class="f-name order" title={FullPath} id="Name" on:click={onShowInput}>{Name}</td>
          <td class="f-path order" id="FullPath" on:click={onShowInput}>{FullPath}</td>
          <td data-name="IsAdult" on:click={updateDir}>{IsAdult}</td>
          <td>{FolderCount}</td>
          <td>{TotalFiles}</td>
          <td class="order" id="FirstInList" on:click={onShowInput}>
            {FirstInList}
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
    padding: 0px 8px;
  }
  .message {
    display: none;
  }
  .message:not(:empty) {
    display: block;
    color: red;
  }
  .d-action {
    width: 90px;
    min-width: 90px;
  }
  .d-type {
    min-width: 80px;
    width: 80px;
  }
  .d-adult {
    min-width: 90px;
    width: 90px;
    cursor: pointer;
  }
  .f-path {
    white-space: nowrap;
  }
  .d-cont {
    min-width: 120px;
    width: 120px;
  }
  .d-total {
    min-width: 155px;
    width: 155px;
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
  .order :global(input) {
    width: 100%;
    height: 36px;
    outline: none;
    text-align: center;
  }
  .f-name.order :global(input),
  .f-path.order :global(input) {
    padding: 0 8px;
    text-align: left;
  }
  .f-name {
    width: 155px;
    min-width: 155px;
  }
  td {
    white-space: nowrap;
  }

  @media screen and (max-width: 700px) {
    .f-path {
      display: none;
    }
  }
</style>
