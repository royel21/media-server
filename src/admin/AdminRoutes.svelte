<script>
  import { getContext } from "svelte";
  import { Router, Route } from "svelte-routing";
  import Navbar from "../ShareComponent/Navbar.svelte";
  import User from "./User.svelte";
  import Folders from "./Folders/Folders.svelte";
  import DiskManager from "./Disks/DiskManager.svelte";
  import Files from "./FilesManager/Files.svelte";
  import Redirect from "./Component/Redirect.svelte";
  import Icons from "../icons/Icons.svelte";
  import Tools from "./Tools/Tools.svelte";
  import RConsole from "./Component/RConsole.svelte";

  let logout = getContext("logout");
  let user = getContext("User");

  const navItems = [
    { title: "Users", path: "/admin/", class: "users", color: "rgb(37, 140, 209)" },
    { title: "Files", path: "/admin/files", class: "file", color: "rgba(248, 224, 6, 0.952)" },
    { title: "Folders", path: "/admin/folders", class: "folder", color: "rgb(250, 183, 15)" },
    {
      title: "Manager",
      path: "/admin/content-manager/tab-1",
      class: "sitemap",
      color: "#80bdff",
    },
    {
      title: "Tools",
      path: "/admin/tools",
      class: "cog",
      color: "grey",
    },
  ];

  document.title = "Content Manager";
</script>

<Router>
  <Navbar on:click {navItems}>
    <span id="admin-label" on:click={logout} slot="user" title="Log Out">
      <Icons name="signout" />
      <span class="nav-title">{user.username}</span>
    </span>
  </Navbar>
  <div class="content">
    <Route path="/admin/folders/:dirid/:page/:filter" component={Folders} />
    <Route path="/admin/content-manager/:tab" component={DiskManager} />
    <Route path="/admin/files/:page/:filter" component={Files} />
    <Route path="/admin/tools" component={Tools} />
    <Route path="/admin/" component={User} />
    <Route path="/"><Redirect to="/admin/" /></Route>
  </div>
  <RConsole />
</Router>

<style>
  #admin-label {
    padding: 5px;
    cursor: pointer;
    text-align: center;
    overflow: hidden;
    max-height: 66px;
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
    #admin-label {
      max-width: 100px;
      text-overflow: ellipsis;
    }
  }
</style>
