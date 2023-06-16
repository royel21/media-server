<script>
  import { getContext, onMount } from "svelte";
  import { Router, Route } from "svelte-routing";
  import { FavoritesStores } from "./Stores/FavoritesStores";

  import Navbar from "../ShareComponent/Navbar.svelte";
  import Home from "./Pages/Home.svelte";
  import Mangas from "./Pages/Manga/Mangas.svelte";
  import Videos from "./Pages/Video/Videos.svelte";
  import Favorites from "./Pages/FileBrowser/Favorites.svelte";
  import Content from "./Pages/FileBrowser/Content.svelte";
  import Viewer from "./Pages/Viewer.svelte";
  import NavItem from "./Component/NavItem.svelte";
  import apiUtils from "../apiUtils";
  import Config from "./Component/Config.svelte";

  const navItems = [
    { title: "Home", path: "/", class: "home" },
    { title: "Videos", path: "/videos", class: "film" },
    { title: "Mangas", path: "/mangas", class: "book" },
    { title: "Favorites", path: "/favorites", class: "heart" },
  ];

  let dirs = {};

  FavoritesStores.set(getContext("User").favorites);

  let selected = { Mangas: "", Videos: "" };

  const selectDir = ({ target: { id, title } }) => (selected[title] = id);

  $: dirs.Favorites = $FavoritesStores;

  onMount(async () => {
    const data = await apiUtils.files(["dirs/"]);
    selected.Mangas = data.Mangas[0]?.Id || "";
    selected.Videos = data.Videos[0]?.Id || "";
    selected.Favorites = dirs.Favorites[0]?.Id || "";
    dirs = { ...dirs, ...data };
  });

  document.title = "Home";
</script>

<Router>
  <Navbar on:click {navItems} filters={["Mangas", "Videos", "Favorites"]} let:item>
    <NavItem {dirs} {selectDir} {selected} {item} slot="nav-item" />
    <Config slot="user" />
  </Navbar>

  <Route path="/:type/content/:id/:page/:filter" component={Content} />
  <Route path="/:type/viewer/:folderId/:fileId" component={Viewer} />

  <Route path="/videos/:dir/:page/:filter" component={Videos} />
  <Route path="/mangas/:dir/:page/:filter" component={Mangas} />
  <Route path="/favorites/:id/:page/:filter" component={Favorites} />

  <Route path="/:page/:filter" component={Home} />
</Router>
