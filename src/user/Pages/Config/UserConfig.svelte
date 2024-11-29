<script>
  import { navigate } from "svelte-routing";
  import Icons from "src/icons/Icons.svelte";
  import Tabs from "src/ShareComponent/Tabs.svelte";

  import SortConfig from "./SortConfig.svelte";
  import Hotkeys from "./Hotkeys/Hotkeys.svelte";

  export let tab = "tab-1";

  const tabs = [
    { id: "tab-1", name: "Sorting Config", icon: "filter", component: SortConfig },
    { id: "tab-2", name: "Hotkeys", icon: "keyboard", component: Hotkeys },
  ];

  $: {
    navigate(`/config/${tab || "tab-1"}`, { replace: true });
    console.log(tab);
  }
  document.title = "user Configs";
</script>

<Tabs {tabs} bind:tab />
