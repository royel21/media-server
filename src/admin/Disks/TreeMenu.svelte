<script>
  import { getContext } from "svelte";
  import Confirm from "../Component/Confirm.svelte";
  import CreateDirDialog from "./CreateDirDialog.svelte";
  import Menu from "./Menu.svelte";
  import RenameModal from "./RenameModal.svelte";
  import { setMessage } from "../Store/MessageStore";

  export let showMenu = false;
  export let scanDir;

  const menuItems1 = [
    { Id: "addToWatcher", Name: "Add to Watcher" },
    { Id: "scanDir", Name: "Add to Directories" },
    { Id: "onCalculateSize", Name: "Directory Size", BBorder: true },
    { Id: "createDir", Name: "Create Folder" },
    { Id: "zipImgFolders", Name: "Zip Img Folders" },
    { Id: "remFolder", Name: "Rename Folder" },
    { Id: "removeDFolder", Name: "Delete Folder" },
  ];
  const menuItems2 = [
    { Id: "scanDir", Name: "Add to Directories" },
    { Id: "addToWatcher", Name: "Add to Watcher" },
    { Id: "createDir", Name: "Create Folder" },
  ];

  const socket = getContext("socket");

  let showConfirm;
  let showRename = false;
  let showCreateDir = false;

  const addToWatcher = (data) => {
    if (data.Path) {
      socket.emit("bg-work", { action: "dirScan", data });
    }
  };

  const hideRename = () => (showRename = false);

  const onRename = ({ folder, Name }) => {
    socket.emit("file-work", { action: "remFolder", data: { folder, Name } });
    showRename = false;
  };

  const onMenuClick = ({ target }) => menuActions(showMenu.e, target.id);

  const cancel = () => (showConfirm = false);
  const onRemove = (data) => {
    if (data.Path) {
      data.folder = showCreateDir;
      socket.emit("file-work", { action: "removeDFolder", data });
    }
  };

  const onCreateDir = (data) => {
    data.file = showCreateDir;
    socket.emit("file-work", { action: "createFolder", data });
    showCreateDir = false;
  };

  const onCalculateSize = (item) => {
    setMessage({ msg: `Calculating "${item.Name}" Size Please Wait...` });
    socket.emit("bg-work", { action: "folderSize", data: item });
  };

  const zipImgFolders = (item) => {
    socket.emit("bg-work", { action: "zipImgFolder", data: item });
  };

  const menuActions = (event, id) => {
    const item = showMenu.file;

    const actions = {
      scanDir,
      addToWatcher,
      onCalculateSize,
      createDir: () => (showCreateDir = item),
      zipImgFolders,
      removeDFolder: () => (showConfirm = item),
      remFolder: () => (showRename = item),
    };
    return actions[id] && actions[id](item);
  };

  let menuItems = [];
  $: menuItems = /folder/.test(showMenu.file?.Type) ? menuItems1 : menuItems2;
</script>

{#if showConfirm}
  <Confirm text={`${showConfirm.Name}`} acept={onRemove} {cancel} data={showConfirm} />
{/if}

{#if showRename}
  <RenameModal data={showRename} hide={hideRename} acept={onRename} />
{/if}

{#if showCreateDir}
  <CreateDirDialog hide={() => (showCreateDir = false)} acept={onCreateDir} />
{/if}

{#if showMenu && !/file/.test(showMenu?.file.Type)}
  <Menu {menuItems} event={showMenu.e} {onMenuClick} />
{/if}
