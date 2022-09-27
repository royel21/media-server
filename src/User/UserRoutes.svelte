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
  import apiUtils from "../api-utils";

  const sortLastCompleted = (a, b) => {
    if (a.Name?.includes("Completed") || b.Name?.includes("Completed")) {
      return -1;
    } else {
      return a.Name?.localeCompare(b?.Name);
    }
  };

  const navItems = [
    { title: "Home", path: "/", class: "home" },
    { title: "Videos", path: "/videos", class: "film" },
    { title: "Mangas", path: "/mangas", class: "book" },
    { title: "Favorites", path: "/favorites", class: "heart" },
  ];

  let dirs;

  FavoritesStores.set(getContext("User").favorites);

  let selected = { Mangas: "", Videos: "" };

  const selectDir = ({ target: { id, title } }) => (selected[title] = id);

  onMount(async () => {
    const data = await apiUtils.files(["dirs/"]);
    data.Mangas.sort(sortLastCompleted);
    data.Videos.sort(sortLastCompleted);
    selected.Mangas = data.Mangas[0]?.Id || "";
    selected.Videos = data.Videos[0]?.Id || "";
    dirs = data;
  });

  document.title = "Home";
</script>

<Router>
  <Navbar on:click {navItems} filters={["Mangas", "Videos"]} let:item>
    <NavItem {dirs} {selectDir} {selected} {item} />
  </Navbar>
  <Route path="/videos/content/:id/:page/:filter" component={Content} />
  <Route path="/videos/viewer/:folderId/:fileId" component={Viewer} />
  <Route path="/videos/:dir/:page/:filter" component={Videos} />

  <Route path="/mangas/content/:id/:page/:filter" component={Content} />
  <Route path="/mangas/viewer/:folderId/:fileId" component={Viewer} />
  <Route path="/mangas/:dir/:page/:filter" component={Mangas} />

  <Route path="/favorites/content/:id/:page/:filter" component={Content} />
  <Route path="/favorites/viewer/:folderId/:fileId" component={Viewer} />
  <Route path="/favorites/:id/:page/:filter" component={Favorites} />

  <Route path="/:page/:filter" component={Home} />
</Router>
