<script>
  import { getContext } from "svelte";
  import { Router, Route } from "svelte-routing";
  import Navbar from "../ShareComponent/Navbar.svelte";
  import User from "./User.svelte";
  import Folders from "./Folders/Folders.svelte";
  import DiskManager from "./Disks/DiskManager.svelte";
  import Files from "./FilesManager/Files.svelte";

  let logout = getContext("logout");
  let user = getContext("User");

  const navItems = [
    { title: "Users", path: "/admin", class: "users" },
    { title: "Files", path: "/admin/files", class: "file" },
    { title: "Folders", path: "/admin/folders", class: "folder" },
    {
      title: "Manager",
      path: "/admin/content-manager/tab-1",
      class: "sitemap",
    },
  ];

  document.title = "Content Manager";
</script>

<Router>
  <Navbar on:click {navItems}>
    <span id="admin-label" on:click={logout} slot="user" title="Log Out">
      <i class="fas fa-sign-out-alt" />
      <span class="nav-title">{user.username}</span>
    </span>
  </Navbar>
  <div class="content">
    <Route path="/admin/folders/:page/:filter" component={Folders} />
    <Route path="/admin/content-manager/:tab" component={DiskManager} />
    <Route path="/admin/files/:page/:filter" component={Files} />
    <Route path="/admin" component={User} />
  </div>
</Router>

<style>
  #admin-label {
    padding: 0 5px;
    cursor: pointer;
    text-align: center;
  }
  .content {
    width: 100%;
    height: calc(100% - 37px);
    padding: 10px;
    overflow-x: auto;
  }
  @media screen and (max-width: 480px) {
    .content {
      height: calc(100% - 67px);
    }
  }
</style>
