<script>
  import { Router, Route } from "svelte-routing";
  import Navbar from "../ShareComponent/Navbar.svelte";
  import User from "./User.svelte";
  import Folders from "./Folders/Folders.svelte";
  import DiskManager from "./Disks/DiskManager.svelte";
  import Files from "./FilesManager/Files.svelte";

  const navItems = [
    { title: "Users", path: "/", class: "users" },
    { title: "Files", path: "/files", class: "file" },
    { title: "Folders", path: "/folders", class: "folder" },
    {
      title: "Manager",
      path: "/content-manager/tab-1",
      class: "sitemap",
    },
  ];

  document.title = process.env.AdminTitle || "Content Manager";
</script>

<Router>
  <Navbar on:click {navItems} />
  <div class="content">
    <Route path="/folders/:page/:filter" component={Folders} />
    <Route path="/content-manager/:tab" component={DiskManager} />
    <Route path="/files/:page/:filter" component={Files} />
    <Route path="/" component={User} />
  </div>
</Router>

<style>
  .content {
    width: 100%;
    height: 100%;
    padding: 10px;
    padding-top: 45px;
    overflow-x: auto;
  }
  @media screen and (max-width: 432px) {
    .content {
      padding-top: 71px;
    }
  }
</style>
