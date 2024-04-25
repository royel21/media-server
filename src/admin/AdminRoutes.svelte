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
  import { MessageStore } from "./Store/MessageStore";

  let logout = getContext("logout");
  let user = getContext("User");
  let socket = getContext("socket");
  let message = "";
  let toastRef;

  const navItems = [
    { title: "Users", path: "/admin/", class: "users", color: "rgb(37, 140, 209)" },
    { title: "Files", path: "/admin/files", class: "file", color: "rgba(248, 224, 6, 0.952)" },
    { title: "Folders", path: "/admin/folders", class: "folder", color: "rgb(250, 183, 15)" },
    {
      title: "Manager",
      path: "/admin/content-manager",
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

  const hideMessage = () => {
    toastRef.style.top = -toastRef.offsetHeight - 10 + "px";
    toastRef.style.opacity = -0;
    message = "";
  };

  const onMessege = (data) => {
    if (data) {
      toastRef.style.top = "80px";
      toastRef.style.opacity = 1;
      setTimeout(hideMessage, 5000);
      message = data;
    }
  };

  $: onMessege($MessageStore);

  socket.off("rebuild-message", onMessege);
  socket.on("rebuild-message", onMessege);

  document.title = "Content Manager";
</script>

<Router>
  <div class="toast-container">
    <span bind:this={toastRef} class="toast" on:click={hideMessage}>{message}</span>
  </div>
  <Navbar on:click {navItems}>
    <span id="admin-label" on:click={logout} slot="user" title="Log Out" on:keydown>
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
  .toast-container {
    position: fixed;
    top: 0;
    display: flex;
    justify-content: center;
    width: 100%;
    z-index: 999;
  }
  .toast {
    position: absolute;
    top: -20px;
    background-color: rgb(58, 119, 172);
    padding: 2px 5px;
    border-radius: 0.25rem;
    opacity: 0;
    max-width: 750px;
    transition: all 0.3s;
  }
  @media screen and (max-width: 600px) {
    .content {
      height: calc(100% - 67px);
    }
    #admin-label {
      max-width: 100px;
      text-overflow: ellipsis;
    }
    .toast {
      max-width: 380px;
    }
  }

  @media (max-width: 600px) and (pointer: none), (pointer: coarse) {
    .content {
      height: calc(100% - 64px);
    }
  }
</style>
