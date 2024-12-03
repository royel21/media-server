<script>
  import { getContext, onMount } from "svelte";
  import { Router, Route } from "svelte-routing";
  import { FavoritesStores } from "./Stores/FavoritesStores";
  import { Link } from "svelte-routing";

  import Navbar from "../ShareComponent/Navbar.svelte";
  import Home from "./Pages/Home.svelte";
  import Mangas from "./Pages/Manga/Mangas.svelte";
  import Videos from "./Pages/Video/Videos.svelte";
  import Favorites from "./Pages/FileBrowser/Favorites.svelte";
  import Content from "./Pages/FileBrowser/Content.svelte";
  import Viewer from "./Pages/Viewer.svelte";
  import apiUtils from "../apiUtils";
  import UserConfig from "./Pages/Config/UserConfig.svelte";
  import { setConfig } from "./Stores/PageConfigStore";
  import Icons from "src/icons/Icons.svelte";

  const navItems = [
    { title: "Home", path: "/", class: "home" },
    { title: "Videos", path: "/videos", class: "film" },
    { title: "Mangas", path: "/mangas", class: "book" },
    { title: "Favorites", path: "/favorites", class: "heart" },
  ];

  const User = getContext("User");
  const logout = getContext("logout");
  let showConfig = false;
  let dirs = { selected: {}, Mangas: [], Favorites: User.favorites };

  FavoritesStores.set(User.favorites);

  const onShowConfgs = () => {
    showConfig = !showConfig;
  };

  const hide = () => (showConfig = false);

  onMount(async () => {
    const data = await apiUtils.files(["dirs/"]);
    if (data.valid) {
      dirs = { Favorites: $FavoritesStores, ...data };
    }
  });

  document.title = "Home";
  $: setConfig(User.username);
  $: dirs.Favorites = $FavoritesStores;
</script>

{#if showConfig}
  <UserConfig {hide} />
{/if}

<Router>
  <Navbar on:click {navItems} {dirs} filters={["Mangas", "Videos", "Favorites"]}>
    <span class="icon" id="user-label" slot="user">
      <span title="Open Config" class="user-cog" on:click={onShowConfgs}>
        <Icons name="usercog" height="22px" />
        <span class="nav-title user-name">{User.username}</span>
      </span>
      <span class="sign-out" on:click={logout} title="Sign Out"> <Icons name="signout" /></span>
    </span>
  </Navbar>

  <Route path="/:type/content/:id/:page/:filter" component={Content} />
  <Route path="/:type/viewer/:folderId/:fileId" component={Viewer} />

  <Route path="/videos/:dir/:page/:filter" component={Videos} />
  <Route path="/mangas/:dir/:page/:filter" component={Mangas} />
  <Route path="/favorites/:id/:page/:filter" component={Favorites} />

  <Route path="/:page/:filter" component={Home} />
</Router>

<style>
  #user-label {
    cursor: pointer;
    align-self: center;
    margin-right: 5px;
    padding: 0 5px;
  }

  .user-cog {
    margin-left: 10px;
    padding: 5px;
  }

  @media screen and (max-width: 500px) {
    #user-label {
      height: initial;
      text-align: center;
    }

    #user-label {
      max-width: 150px;
    }
    .icon :global(svg) {
      height: 26px;
    }
    .nav-title {
      display: inline-block;
      font-size: 16px;
      white-space: nowrap;
      max-width: 90px;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
</style>
