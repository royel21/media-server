<script>
  import { getContext } from "svelte";
  import { Router, Route } from "svelte-routing";
  import Navbar from "../ShareComponent/Navbar.svelte";
  import User from "./Users/User.svelte";
  import Folders from "./Folders/Folders.svelte";
  import DiskManager from "./Disks/DiskManager.svelte";
  import Files from "./FilesManager/Files.svelte";
  import Redirect from "./Component/Redirect.svelte";
  import Icons from "../icons/Icons.svelte";
  import RConsole from "./Component/RConsole.svelte";
  import { MessageStore, setMessage } from "./Store/MessageStore";
  import Configs from "./AppConfig/Configs.svelte";
  import DownloadManager from "./Downloader/DownloadManager.svelte";
  import Player from "./Component/Player.svelte";
  import MangaViewer from "./Component/MangaViewer.svelte";
  import TextEditor from "./Component/TextEditor.svelte";
  import ImageViewer from "./Component/ImageViewer.svelte";
  import LocalFileList from "./Component/LocalFileList.svelte";
  import Games from "./Games/Games.svelte";

  let logout = getContext("logout");
  let user = getContext("User");
  let socket = getContext("socket");
  let message = "";
  let toastRef;

  const navItems = [
    {
      title: "Users",
      path: "/admin/",
      class: "users",
      color: "rgb(37, 140, 209)",
      box: " 0 0 640 512",
    },
    {
      title: "Files",
      path: "/admin/files",
      class: "file",
      color: "rgba(248, 224, 6, 0.952)",
      box: "0 0 384 512",
    },
    {
      title: "Folders",
      path: "/admin/folders",
      class: "folder",
      color: "rgb(250, 183, 15)",
      box: "0 0 512 512",
    },
    {
      title: "Downloads",
      path: "/admin/downloads",
      class: "download",
      color: "grey",
      box: " 0 0 512 512",
    },
    {
      title: "Manager",
      path: "/admin/content-manager",
      class: "sitemap",
      color: "#80bdff",
      box: " 0 0 640 512",
    },
    {
      title: "Games",
      path: "/admin/games",
      class: "games",
      color: "#ff1717",
      box: " 0 0 640 640",
    },
    {
      title: "Configs",
      path: "/admin/configs",
      class: "cog",
      color: "deepskyblue",
      box: " 0 0 512 512",
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
      toastRef.style.color = data.textColor;
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

<Player />
<MangaViewer />
<TextEditor />
<ImageViewer />
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
    <LocalFileList />
    <Route path="/admin/folders/:dirid/:page/:filter" component={Folders} />
    <Route path="/admin/content-manager/:tab" component={DiskManager} />
    <Route path="/admin/downloads/:tab" component={DownloadManager} />
    <Route path="/admin/files/:page/:filter" component={Files} />
    <Route path="/admin/games/:tab" component={Games} />
    <Route path="/admin/configs/:tab" component={Configs} />
    <Route path="/admin/" component={User} />
    <Route path="/"><Redirect to="/admin/" /></Route>
    <RConsole />
  </div>
</Router>

<style>
  #admin-label {
    display: flex;
    align-items: center;
    padding: 5px 0;
    cursor: pointer;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow-x: hidden;
    width: 135px;
  }
  #admin-label .nav-title {
    margin-left: 5px;
  }
  .content {
    width: 100%;
    height: calc(100% - 37px);
    padding: 5px;
    overflow-x: auto;
  }
  .toast-container {
    position: fixed;
    top: 0;
    display: flex;
    justify-content: center;
    width: 100%;
    z-index: 1001;
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

  :global(#admin-label .icon-signout) {
    top: 0;
  }

  :global(span:active > .icon-download),
  :global(span:active > .icon-trash),
  :global(span:active > .icon-files),
  :global(span:active > .icon-edit),
  :global(span:active > .icon-sync) {
    transform: scale(1.2);
  }
  :global(#menu li .icon-users) {
    width: 28px;
    height: 22px;
  }
  :global(#menu li .icon-file) {
    width: 20px;
    height: 22px;
  }
  :global(#menu li span) {
    margin-left: 2px;
  }

  @media (max-width: 800px) {
    :global(#menu li span) {
      margin-left: 7px;
    }
  }

  @media screen and (min-width: 600px) {
    .toast {
      max-width: 390px;
    }
    :global(#menu a.active) {
      width: initial;
    }
    :global(body #menu li svg) {
      transform: scale(1.05);
      right: 0;
    }
    #admin-label :global(svg) {
      transform: scale(1.2);
    }
    :global(#menu li .icon-file) {
      left: 0px;
    }
  }

  @media (max-width: 600px) and (pointer: none), (pointer: coarse) {
    .content {
      height: calc(100% - 40px);
    }
  }

  @media screen and (max-width: 600px) {
    #admin-label .nav-title {
      display: none;
    }
    #admin-label {
      width: 32px;
    }
    :global(body #menu li svg) {
      transform: scale(1.05);
      min-width: initial;
    }
  }
</style>
