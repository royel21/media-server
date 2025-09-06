<script>
  import { onMount } from "svelte";
  import { sortByName } from "@share/utils";
  import FileTypeIcon from "src/admin/Component/FileTypeIcon.svelte";
  import Filter from "src/ShareComponent/Filter.svelte";
  import Icons from "src/icons/Icons.svelte";
  import VirtualList from "svelte-tiny-virtual-list";

  import CCheckbox from "src/admin/Component/CCheckbox.svelte";
  import Confirm from "src/admin/Component/Confirm.svelte";
  import MoveFileDialog from "./MoveFileDialog.svelte";
  import RenameModal from "../RenameModal.svelte";

  import { showConsoleStore, updateConsole } from "../../Store/ConsoleStore";
  import { formatDate } from "../../Downloader/utils";

  import VideoControl from "./VideoControl.svelte";
  import apiUtils from "src/apiUtils";

  import { formatSize } from "src/utils";
  import VideoConvert from "./VideoConvert.svelte";
  import SubVideoExtration from "./SubVideoExtration.svelte";
  import BulkEdit from "src/admin/Component/BulkEdit.svelte";

  export let files = [];
  export let socket;
  export let content = [];
  export let Name = "";
  export let current;
  export let showHidden = false;

  let filtered = files;
  let sortBy = "name";
  let length = files.length;

  let selectedList = [];
  let isChecked = false;
  let filter = "";

  let showMoveDialog;
  let showConfirm = false;
  let showBulkRename = false;
  let bgWorking = false;
  let showConvertVideo;
  let showVideoSubTract;
  let itemContainerRef;
  let height = 0;

  showConsoleStore.subscribe(() => {
    setTimeout(() => {
      height = itemContainerRef?.offsetHeight || 0;
    }, 50);
  });

  const onCheck = ({ target }) => {
    const id = target.closest("li").id;
    if (id) {
      const file = files.find((f) => f.Id === id);
      if (!selectedList.includes(file)) {
        selectedList = [...selectedList, file];
      } else {
        selectedList = selectedList.filter((item) => item !== file);
      }
    }
  };

  const onCheckAll = () => {
    if (selectedList.length === filtered.length) {
      selectedList = [];
    } else {
      selectedList = [...filtered];
    }
  };

  const hideRename = () => {
    showBulkRename = false;
  };

  const hideBulkRename = () => {
    showBulkRename = false;
  };

  const onBulkRename = (item) => {
    socket.emit("file-work", { action: "bulkRename", data: { ...item, files: selectedList } });
    hideBulkRename();
  };

  const removeFiles = () => {
    socket.emit("file-work", { action: "removeFiles", data: { files: selectedList } });
  };

  const onShowRemoveConfirm = () => {
    showConfirm = {
      acept: removeFiles,
      text: "Remove",
    };
  };

  const fileUnZip = () => {
    socket.emit("bg-work", { action: "unZip", data: { files: selectedList } });
  };

  const onShowUnZipConfirm = () => {
    showConfirm = {
      acept: fileUnZip,
      text: "Unzip",
    };
  };

  const onTransfer = () => {
    showMoveDialog = { files: selectedList };
  };

  const acept = (data) => {
    showMoveDialog = false;
    socket.emit("file-work", { action: "moveFiles", data });
  };

  const onFileInfo = ({ msg, items, bulk, error, ren, file, convert, progress, Path, End }) => {
    if (msg || error) {
      updateConsole({ text: msg, error });
    }

    if (bulk) {
      for (let item of items) {
        const index = files.findIndex((f) => f.Id === item.Id);
        if (files[index]) {
          files[index] = item;
          selectedList = items;
        }
      }
      files = files.sort(sortByName);
      updateConsole({ error, text: "Finish Bulk Rename" });
    }

    if (ren) {
      const index = files.findIndex((f) => f.Id === file.Id);

      if (index > -1) {
        files[index] = file;
        files = files.sort(sortByName);
        selectedList = [file];
      }
    }

    if (progress) {
      const index = files.findIndex((f) => f.Path === Path);
      if (files[index]) {
        files[index].progress = progress;
      }
    }

    if (convert) {
      if (End) {
        bgWorking = false;
        selectedList = [];
        reload();
      } else if (file) {
        files = [...files, file].sort(sorter[sortBy]);
      }
    }
  };

  const fileUpdate = ({ move }) => {
    if (move) {
      selectedList = selectedList.filter((f) => f.Id !== move.Id);
      files = files.filter((f) => f.Id !== move.Id);
    }
  };

  const renameFile = (data) => {
    socket.emit("file-work", { action: "renameFile", data: { file: data.folder, Name: data.Name } });
    hideRename();
  };

  const reload = async () => {
    if (current) {
      const data = await apiUtils.post("admin/directories/Content", { Path: current.Path });
      if (data.data) {
        files = data.data.filter((it) => it.Type === "file");
      }
    }
  };

  const onWorkState = ({ isWorking }) => {
    bgWorking = isWorking;
  };

  const onConnect = () => reload();

  const getSize = (list) => {
    let sum = 0;
    list.forEach((f) => (sum += f.Size));
    return formatSize(sum / 1024) || 0;
  };

  const getSize2 = (file) => {
    let size = file.Size / 1024;
    let type = "KB";

    if (size > 1000) {
      type = "MB";
      size = file.Size / 1024 / 1024;
    }

    if (size > 1000) {
      size = file.Size / 1024 / 1024 / 1024;
      type = "GB";
    }

    if (size < 10) {
      size = size.toFixed(2);
    } else if (size < 100) {
      size = size.toFixed(1);
    } else {
      size = parseInt(size);
    }
    return size + type;
  };

  const sorter = {
    name: sortByName,
    date: (a, b) => new Date(b.LastModified) - new Date(a.LastModified),
    size: (a, b) => b.Size - a.Size,
  };

  const filterFunc = (filter) => (f) => {
    if (!showHidden && /^(\.|$)/.test(f.Name)) {
      return false;
    }
    return f.Name.toLocaleLowerCase().includes(filter.toLocaleLowerCase());
  };

  const stopVideoProcess = () => {
    socket.emit("bg-work", { action: "stop-video-bg" });
    bgWorking = false;
  };

  const getItemDate = ({ LastModified }) => {
    return formatDate(new Date(LastModified));
  };

  const onResize = () => {
    height = itemContainerRef.offsetHeight;
  };

  const getDownloadUrl = () => {
    return `/api/admin/files/download/${encodeURIComponent(selectedList[0].Path)}`;
  };

  onMount(() => {
    window.addEventListener("resize", onResize, { passive: true });
    socket.on("connect", onConnect);
    socket.on("files-info", onFileInfo);
    socket.on("info", fileUpdate);
    socket.on("bg-worker-state", onWorkState);
    socket.emit("bg-work", { action: "bg-state" });
    return () => {
      window.removeEventListener("resize", onResize);
      socket.off("connect", onConnect);
      socket.off("bg-worker-state", onWorkState);
      socket.off("info", fileUpdate);
      socket.off("files-info", onFileInfo);
    };
  });

  $: isChecked = filtered.length && selectedList.length === filtered.length;

  const applyFilter = ({ detail }) => (filter = detail);

  $: {
    filtered = files.filter(filterFunc(filter)).sort(sorter[sortBy]);
  }

  $: if (files.length !== length) {
    selectedList = [];
    length = files.length;
  }

  let virtual = true;
  $: list = selectedList.length ? selectedList : filtered;
  $: height = itemContainerRef?.offsetHeight || 0;
  $: props = { itemSize: 34, itemCount: filtered.length };
</script>

{#if showMoveDialog}
  <MoveFileDialog files={showMoveDialog.files} hide={() => (showMoveDialog = false)} {acept} {content} />
{/if}

{#if showConfirm}
  <Confirm
    text={`${showConfirm.text} ${selectedList.length} Selected ${selectedList.length === 1 ? "File" : "Files"}`}
    acept={showConfirm.acept}
    cancel={() => (showConfirm = false)}
    data={showConfirm.data}
  />
{/if}

{#if showConvertVideo}
  <VideoConvert bind:showConvertVideo bind:bgWorking {socket} {selectedList} />
{/if}

{#if showVideoSubTract}
  <SubVideoExtration bind:showVideoSubTract bind:bgWorking {socket} {selectedList} />
{/if}

{#if showBulkRename}
  {#if selectedList.length === 1}
    <RenameModal data={selectedList[0]} acept={renameFile} hide={hideRename} title="File" />
  {:else}
    <BulkEdit length={selectedList.length} hide={hideBulkRename} acept={onBulkRename} />
  {/if}
{/if}

<div class="col">
  <div class="tree-files">
    <div class="ftree-control">
      <h4 title={Name}>{list.length} ~ {getSize(list)} ~ {Name}</h4>
      <div class="filter">
        <span>
          <CCheckbox id="check-all" on:change={onCheckAll} {isChecked} title="Select All Files" />
          {#if bgWorking}
            <span class="stop-bg" on:click={stopVideoProcess} title="Stop backround video work">
              <Icons name="stopcircle" box="0 0 640 512" color="red" />
            </span>
          {/if}
          {#if selectedList.length}
            {#if selectedList.filter((f) => !/\.zip$/i.test(f.Name)).length === 0}
              <span on:click={onShowUnZipConfirm} title="Extract Zip">
                <Icons name="zip" box="0 0 384 512" color="darkgray" />
              </span>
            {/if}
            <VideoControl bind:showConvertVideo bind:showVideoSubTract {selectedList} {socket} />
            <span on:click={() => (showBulkRename = true)}><Icons name="edit" /></span>
            <span on:click={onTransfer}><Icons name="right-left" /></span>
            {#if selectedList.length === 1}
              <a class="download" href={getDownloadUrl()} download={selectedList[0].Name}>
                <Icons name="download" box="0 0 512 512" />
              </a>
            {/if}
            <span class="rm-all" on:click={onShowRemoveConfirm}><Icons name="trash" /></span>
          {:else}
            <span class="btn-sync" on:click={reload} title="Reload Files"><Icons name="sync" /></span>
          {/if}
        </span>
        <Filter id="file-filter" on:change={applyFilter} />
        {#if selectedList.length === 0}
          <span class="input-control">
            <span class="input-label">
              <Icons name="list" color="black" box="0 0 512 512" />
            </span>
            <select bind:value={sortBy} class="input">
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>
          </span>
        {/if}
      </div>
    </div>
    {#if virtual}
      <div class="items" bind:this={itemContainerRef}>
        <VirtualList {...props} {height}>
          <li slot="item" let:index let:style {style} id={filtered[index].Id} title={getItemDate(filtered[index])}>
            <CCheckbox on:change={onCheck} isChecked={selectedList.find((f) => f.Id === filtered[index].Id)} />
            <span on:click={onCheck}>
              <FileTypeIcon file={filtered[index]} {files} fileColor="white" />
              <span class="size">{getSize2(filtered[index])}</span>
              <span>{filtered[index].Name}</span>
            </span>
            <div class="progress-bar" class:show-progress={filtered[index].progress}>
              <div class="progress" style={`width: ${filtered[index].progress}%`}></div>
              <span>{filtered[index].progress}%</span>
            </div>
          </li>
        </VirtualList>
      </div>
    {:else}
      <ul>
        {#each filtered as file}
          <li id={file.Id} title={formatDate(new Date(file.LastModified))}>
            <CCheckbox on:change={onCheck} isChecked={selectedList.find((f) => f.Id === file.Id)} />
            <span on:click={onCheck}>
              <FileTypeIcon {file} {files} fileColor="white" />
              <span class="size">{getSize2(file)}</span>
              <span>{file.Name}</span>
            </span>
            <div class="progress-bar" class:show-progress={file.progress}>
              <div class="progress" style={`width: ${file.progress}%`}></div>
              <span>{file.progress}%</span>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .items {
    height: calc(100% - 78px);
  }
  .col {
    position: relative;
    z-index: 110;
  }
  .col :global(.loading) {
    position: absolute;
    width: 100%;
    z-index: 120;
    background-color: rgb(221 170 94 / 13%);
  }
  .col :global(.loading .spin::before) {
    height: 350px;
    width: 350px;
  }
  .col :global(.loading h4) {
    font-size: 1.2rem;
  }

  ul :global(.select-file) {
    max-width: 22px;
  }

  .stop-bg :global(.icon-stopcircle) {
    top: 5px;
    width: 30px;
    left: -3px;
  }

  .tree-files {
    height: 100%;
    padding: 0 5px;
  }
  .tree-files ul {
    height: calc(100% - 81px);
    width: 100%;
    overflow: auto;
    margin: 0;
    padding-bottom: 5px;
  }
  .tree-files li {
    position: relative;
    font-size: 0.9rem;
    padding: 4px 8px;
    white-space: nowrap;
  }
  .ftree-control {
    position: relative;
    top: 0;
    text-align: center;
    background-color: #535353;
  }
  h4 {
    position: relative;
    display: inline-block;
    width: calc(100% - 25px);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow-x: hidden;
    user-select: text;
    border-bottom: 1px solid;
    font-size: 1.12rem;
  }
  .tree-files :global(#check-all) {
    top: 2px;
    left: -15px;
    width: 30px;
    margin-left: 3px;
  }
  li:hover * {
    cursor: pointer;
    text-decoration: underline;
  }
  .filter {
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: row;
    padding: 5px;
    padding-top: 0;
    border-bottom: 1px solid white;
  }
  .filter :global(#filter-control) {
    margin: 0 5px;
  }
  .filter span {
    display: flex;
    flex-direction: row;
  }
  .filter span > a,
  .filter span > span:not(.input-label) {
    position: relative;
    display: inline-block;
    width: 30px;
    margin: 0 3px;
    text-align: center;
  }

  .filter > span :global(.icon-trash) {
    left: 3px;
  }
  .filter :global(.c-filter) {
    max-width: initial;
    padding-right: 5px;
  }

  .input-control {
    width: 95px;
    padding: 0.1rem 0rem;
    margin: 0;
  }
  .input-label {
    height: 30px;
  }
  .input-label :global(.icon-list) {
    left: -3px;
  }
  .input-control .input {
    height: 30px;
    min-width: 65px;
    padding: 0;
  }

  .rm-all {
    margin-right: 5px;
  }
  .tree-files .btn-sync {
    display: inline-block;
    width: 35px;
  }
  .size {
    display: inline-block;
    width: 47px;
    text-align: right;
    margin-right: 2px;
  }

  .progress-bar {
    position: absolute;
    top: 8px;
    right: 5px;
    display: none;
    width: 80px;
    height: 20px;
    pointer-events: none;
    border-radius: 0.25rem;
    background-color: rgba(0, 0, 0, 0.5);
    overflow: hidden;
    text-align: center;
  }
  .progress-bar span {
    position: relative;
    top: -1px;
    font-size: 0.8rem;
    font-weight: 700;
    color: rgb(243, 7, 7);
    text-shadow: 0px 0px 4px rgba(255, 255, 255, 1);
    z-index: 99;
  }
  .show-progress {
    display: inline-block;
  }

  .progress {
    height: 100%;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.8);
  }
</style>
