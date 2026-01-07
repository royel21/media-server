<script>
  import { navigate } from "svelte-routing";
  import Tabs from "src/ShareComponent/Tabs.svelte";
  import Directories from "./Directories.svelte";
  import GameList from "./GameTabs.svelte";

  export let tab = "tab-1";

  const tabs = [
    { id: "tab-1", name: "List", icon: "list", component: GameList },
    { id: "tab-2", name: "Directories", icon: "hdd", component: Directories },
  ];

  $: {
    tab = tab || "tab-1";
    navigate(`/admin/games/${tab}`, { replace: true });
  }
  document.title = "Games Lister";
</script>

<div id="admin-manager">
  <Tabs {tabs} bind:tab />
</div>

<style>
  #admin-manager {
    overflow: hidden;
    max-width: 1200px;
    margin: 0 auto;
  }
  #admin-manager :global(#tabs-content) {
    padding: 0;
    height: calc(100% - 63px);
    overflow: auto;
  }

  #admin-manager {
    position: relative;
    height: 100%;
  }
</style>
