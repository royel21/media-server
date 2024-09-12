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
  import RConsole from "./Component/RConsole.svelte";
  import { MessageStore, setMessage } from "./Store/MessageStore";
  import Configs from "./Tools/Configs.svelte";
  import DownloadManager from "./Downloader/DownloadManager.svelte";

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
      title: "Downloads",
      path: "/admin/downloads",
      class: "download",
      color: "grey",
    },
    {
      title: "Manager",
      path: "/admin/content-manager",
      class: "sitemap",
      color: "#80bdff",
    },
    {
      title: "Configs",
      path: "/admin/configs",
      class: "cog",
      color: "deepskyblue",
    },
  ];

  let tout;

  const hideMessage = () => {
    toastRef.style.top = -toastRef.offsetHeight - 10 + "px";
    toastRef.style.opacity = -0;
    setMessage({});
  };

  const onMessege = (data) => {
    if (data.msg) {
      toastRef.style.top = "80px";
      toastRef.style.opacity = 1;
      clearTimeout(tout);
      tout = setTimeout(hideMessage, 5000);
    }
    message = data;
  };

  $: onMessege($MessageStore);

  const rebuildMessege = (msg) => onMessege({ msg });

  socket.off("rebuild-message", rebuildMessege);
  socket.on("rebuild-message", rebuildMessege);

  document.title = "Content Manager";
</script>

<Router>
  <div class="toast-container">
    <span bind:this={toastRef} class="toast" class:error={message.error} on:click={hideMessage}>{message.msg}</span>
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
    <Route path="/admin/downloads/:tab" component={DownloadManager} />
    <Route path="/admin/files/:page/:filter" component={Files} />
    <Route path="/admin/configs/:tab" component={Configs} />
    <Route path="/admin/" component={User} />
    <Route path="/"><Redirect to="/admin/" /></Route>
    <RConsole />
  </div>
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
    padding: 4px 5px;
    border-radius: 0.25rem;
    opacity: 0;
    max-width: 750px;
    transition: all 0.3s;
    overflow-wrap: break-word;
  }

  .toast.error {
    background-color: firebrick;
    font-weight: 600;
    color: white;
  }

  :global(span:active > .icon-download),
  :global(span:active > .icon-trash),
  :global(span:active > .icon-files),
  :global(span:active > .icon-edit),
  :global(span:active > .icon-sync) {
    transform: scale(1.2);
  }
  @media screen and (max-width: 790px) {
    #admin-label {
      max-width: 100px;
      text-overflow: ellipsis;
    }
    .toast {
      max-width: 390px;
    }

    :global(#menu .nav-title) {
      display: none;
    }

    :global(#menu a) {
      width: 48px;
    }

    :global(#menu a.active) {
      display: flex;
      width: fit-content;
    }

    :global(#menu a.active .nav-title) {
      display: initial;
    }

    :global(#menu li svg) {
      transform: scale(1.2);
    }
    :global(#menu li .active .icon-users),
    :global(#menu li .active .icon-download),
    :global(#menu li .active .icon-sitemap) {
      margin-right: 5px;
    }
    :global(#menu li .active .icon-sitemap) {
      margin-right: 7px;
    }
  }

  @media (max-width: 600px) and (pointer: none), (pointer: coarse) {
    .content {
      height: calc(100% - 45px);
    }
  }
</style>
