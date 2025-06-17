<script>
  import { navigate } from "svelte-routing";
  import Tree from "./Tree.svelte";
  import Directories from "./Directories.svelte";
  import DiskInfo from "./DiskInfo.svelte";
  import Tabs from "src/ShareComponent/Tabs.svelte";
  import { showConsoleStore } from "../Store/ConsoleStore";
  import Files from "./FilesList/Files.svelte";

  export let tab = "tab-1";

  const tabs = [
    { id: "tab-1", name: "Directories", icon: "folder", component: Directories },
    { id: "tab-2", name: "Server", icon: "pc", component: Tree },
    { id: "tab-3", name: "Files", icon: "files", component: Files },
    { id: "tab-4", name: "Disk Info", icon: "hdd", component: DiskInfo },
  ];

  $: {
    tab = tab || "tab-1";
    navigate(`/admin/content-manager/${tab}`, { replace: true });
  }
  document.title = "Manager";
</script>

<div id="admin-manager" class:hasconsole={$showConsoleStore}>
  <Tabs {tabs} bind:tab />
</div>

<style>
  #admin-manager {
    overflow: hidden;
  }
  #admin-manager :global(#tabs-content) {
    padding: 0;
    height: calc(100% - 63px);
    overflow: auto;
  }

  #admin-manager.hasconsole :global(#tabs-content) {
    height: calc(100% - 190px);
  }

  #admin-manager {
    position: relative;
    height: 100%;
  }
</style>
