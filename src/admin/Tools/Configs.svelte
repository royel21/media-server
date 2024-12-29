<script>
  import { navigate } from "svelte-routing";
  import Tools from "./Tools.svelte";
  import Tags from "./Tags.svelte";
  import Tabs from "src/ShareComponent/Tabs.svelte";
  import Files from "./Files.svelte";

  export let tab = "tab-1";

  const tabs = [
    { id: "tab-1", name: "Tools", icon: "tools", component: Tools },
    { id: "tab-2", name: "Tags", icon: "tags", component: Tags },
    { id: "tab-3", name: "Files", icon: "file", component: Files },
  ];

  $: {
    navigate(`/admin/configs/${tab || "tab-1"}`, { replace: true });
  }
  document.title = "Configs";
</script>

<div>
  <Tabs {tabs} bind:tab />
</div>

<style>
  div {
    height: 100%;
  }
</style>
