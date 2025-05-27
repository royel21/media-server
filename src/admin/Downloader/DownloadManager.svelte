<script>
  import { navigate } from "svelte-routing";
  import Icons from "src/icons/Icons.svelte";
  import Downloads from "./Downloads.svelte";
  import Downloading from "./Downloading.svelte";
  import Servers from "./Servers.svelte";
  import Tabs from "src/ShareComponent/Tabs.svelte";
  export let tab = "downloads";

  const components = {
    downloads: Downloads,
    downloading: Downloading,
    servers: Servers,
  };

  const tabs = [
    { id: "downloads", icon: "list", name: "All Links", component: Downloads },
    { id: "downloading", icon: "download", name: "Downloading List", component: Downloading },
    { id: "servers", icon: "pc", name: "Server List", component: Servers },
  ];

  $: {
    navigate(`/admin/downloads/${tab || "downloads"}`, { replace: true });
  }
  document.title = "Download Manager";
</script>

<Tabs class="d-manager" {tabs} bind:tab />

<style>
  @import "./styles.css";
</style>
