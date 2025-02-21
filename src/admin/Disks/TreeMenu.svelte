<script>
  import { getContext } from "svelte";
  import Confirm from "../Component/Confirm.svelte";
  import CreateDirDialog from "./CreateDirDialog.svelte";
  import Menu from "./Menu.svelte";
  import ModalPassword from "./ModalPassword.svelte";
  import MoveModal from "./MoveModal.svelte";
  import RenameModal from "./RenameModal.svelte";

  export let showMenu = false;
  export let scanDir;

  const menuItems1 = [
    { Id: "scanDir", Name: "Add to Directories" },
    { Id: "addToWatcher", Name: "Add to Watcher" },
    { Id: "createDir", Name: "Create Folder" },
    { Id: "onCalculateSize", Name: "Calculate Size" },
    { Id: "cleanupVideos", Name: "Clean Videos" },
    { Id: "remFolder", Name: "Rename Folder" },
    { Id: "moveToDir", Name: "Move To Directory" },
    { Id: "removeDFolder", Name: "Delete Folder" },
  ];
  const menuItems2 = [
    { Id: "scanDir", Name: "Add to Directories" },
    { Id: "addToWatcher", Name: "Add to Watcher" },
    { Id: "createDir", Name: "Create Folder" },
    { Id: "cleanupVideos", Name: "Clean Videos" },
  ];

  const socket = getContext("socket");

  let showConfirm;
  let showMoveTo = false;
  let showRename = false;
  let showCleanupModal = false;
  let showCreateDir = false;

  const cleanDir = (data) => {
    if (data.folder.Path) {
      socket.emit("file-work", { action: "workVideos", data });
    }
    showCleanupModal = false;
  };

  const addToWatcher = (data) => {
    if (data.Path) {
      socket.emit("file-work", { action: "dirScan", data });
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
  const hideMoveTo = () => (showMoveTo = false);
  const confirmMove = (data) => {
    socket.emit("file-work", { action: "moveToDir", data });
  };
  const onCreateDir = (data) => {
    data.file = showCreateDir;
    socket.emit("file-work", { action: "createFolder", data });
    showCreateDir = false;
  };

  const onCalculateSize = (item) => socket.emit("file-work", { action: "folderSize", data: item });

  const menuActions = (event, id) => {
    const item = showMenu.file;

    const actions = {
      scanDir,
      addToWatcher,
      onCalculateSize,
      createDir: () => (showCreateDir = item),
      cleanupVideos: () => (showCleanupModal = item),
      removeDFolder: () => (showConfirm = item),
      moveToDir: () => (showMoveTo = item),
      remFolder: () => (showRename = item),
    };
    return actions[id] && actions[id](item);
  };

  let menuItems = [];
  $: menuItems = /folder/.test(showMenu.file?.Type) ? menuItems1 : menuItems2;
</script>

{#if showConfirm}
  <Confirm text={`this folder: ${showConfirm.Name}`} acept={onRemove} {cancel} data={showConfirm} />
{/if}

{#if showMoveTo}
  <MoveModal data={showMoveTo} hide={hideMoveTo} acept={confirmMove} />
{/if}

{#if showRename}
  <RenameModal data={showRename} hide={hideRename} acept={onRename} />
{/if}

{#if showCleanupModal}
  <ModalPassword data={showCleanupModal} acept={cleanDir} hide={() => (showCleanupModal = false)} />
{/if}

{#if showCreateDir}
  <CreateDirDialog hide={() => (showCreateDir = false)} acept={onCreateDir} />
{/if}

{#if showMenu && !/file/.test(showMenu?.file.Type)}
  <Menu {menuItems} event={showMenu.e} {onMenuClick} />
{/if}
