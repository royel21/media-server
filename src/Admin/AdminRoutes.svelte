<script>
  import { Router, Route } from "svelte-routing";
  import Navbar from "../ShareComponent/Navbar.svelte";
  import User from "./User.svelte";
  import Folders from "./Folders/Folders.svelte";

  const navItems = [
    { title: "Users", path: "/", class: "users" },
    { title: "Folders", path: "/folders", class: "folder" },
    { title: "Disk", path: "/disk", class: "sitemap" }
  ];
</script>

<style>
  .content {
    height: calc(100% - 32px);
    padding: 10px;
  }
</style>

<Router>
  <Navbar on:click {navItems} />
  <div class="content">
    <Route path="/folders" component={Folders} />
    <Route path="/" component={User} />
  </div>
</Router>
