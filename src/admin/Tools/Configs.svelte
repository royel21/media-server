<script>
  import { navigate } from "svelte-routing";
  import Icons from "src/icons/Icons.svelte";
  import Tools from "./Tools.svelte";
  import Tags from "./Tags.svelte";
  import Hotkeys from "./Hotkeys/Hotkeys.svelte";
  import Tabs from "src/ShareComponent/Tabs.svelte";

  export let tab = "tab-1";

  const tabs = [
    { id: "tab-1", name: "Tools", icon: "tools", component: Tools },
    { id: "tab-2", name: "Tags", icon: "tags", component: Tags },
    { id: "tab-3", name: "Hotkeys", icon: "keyboard", component: Hotkeys },
  ];

  $: {
    navigate(`/admin/configs/${tab || "tab-1"}`, { replace: true });
  }
  document.title = "Configs";
</script>

<Tabs {tabs} bind:tab />
