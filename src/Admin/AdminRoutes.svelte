<script>
  import { Router, Route } from "svelte-routing";
  import Navbar from "../ShareComponent/Navbar.svelte";
  import User from "./User.svelte";
  import Folders from "./Folders/Folders.svelte";
  import DiskManager from "./Disks/DiskManager.svelte";

  const navItems = [
    { title: "Users", path: "/", class: "users" },
    { title: "Folders", path: "/folders", class: "folder" },
    {
      title: "Content Manager",
      path: "/content-manager/tab-1",
      class: "sitemap",
    },
  ];
</script>

<style>
  .content {
    height: 100%;
    padding: 10px;
    padding-top: 45px;
  }
  @media screen and (max-width: 432px) {
    .content {
      padding-top: 71px;
    }
  }
</style>

<Router>
  <Navbar on:click {navItems} />
  <div class="content">
    <Route path="/folders" component={Folders} />
    <Route path="/content-manager/:tab" component={DiskManager} />
    <Route path="/" component={User} />
  </div>
</Router>
