<script>
  import { navigate } from "svelte-routing";
  import Tools from "./Tools.svelte";
  import Tags from "./Tags.svelte";
  import Tabs from "src/ShareComponent/Tabs.svelte";
  import { showConsoleStore } from "../Store/ConsoleStore";

  export let tab = "tab-1";

  const tabs = [
    { id: "tab-1", name: "Tools", icon: "tools", component: Tools },
    { id: "tab-2", name: "Tags", icon: "tags", component: Tags },
  ];

  $: {
    tab = tab || "tab-1";
    navigate(`/admin/configs/${tab}`, { replace: true });
  }
  document.title = "Configs";
</script>

<div class:hasconsole={$showConsoleStore}>
  <Tabs {tabs} bind:tab />
</div>

<style>
  div {
    height: 100%;
  }
  .hasconsole {
    height: calc(100% - 135px);
  }
</style>
