<script>
  import { Router, Route } from "svelte-routing";
  import Navbar from "../ShareComponent/Navbar.svelte";
  import User from "./User.svelte";

  const navItems = [
    { title: "Users", path: "/", class: "users" },
    { title: "Folders", path: "/folders", class: "folder" },
    { title: "Disk", path: "/disk", class: "site-map" }
  ];
</script>

<style>

</style>

<Router>
  <Navbar on:click {navItems} />
  <Route path="/" component={User} />
</Router>
