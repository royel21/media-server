<script>
  import { navigate } from "svelte-routing";
  import Tree from "./Tree.svelte";
  import Directories from "./Directories.svelte";
  import DiskInfo from "./DiskInfo.svelte";
  import Tabs from "src/ShareComponent/Tabs.svelte";
  export let tab = "tab-1";

  const tabs = [
    { id: "tab-1", name: "Directories", icon: "folder", component: Directories },
    { id: "tab-2", name: "Server", icon: "pc", component: Tree },
    { id: "tab-3", name: "Disk Info", icon: "hdd", component: DiskInfo },
  ];

  $: {
    console.log(tab);
    navigate(`/admin/content-manager/${tab || "tab-1"}`, { replace: true });
  }
  document.title = "Manager";
</script>

<div id="admin-manager">
  <Tabs {tabs} bind:tab />
</div>

<style>
  #admin-manager :global(#tabs-content) {
    padding: 0;
    height: calc(100% - 63px);
    overflow: auto;
  }
  #admin-manager {
    position: relative;
    height: 100%;
    padding: 10px 0 0;
  }
</style>
