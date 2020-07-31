<script>
  import { Router, Route } from "svelte-routing";
  import { getContext, onMount } from "svelte";
  import { FavoritesStores } from "./Stores/FavoritesStores";

  import Navbar from "../ShareComponent/Navbar.svelte";
  import Home from "./pages/Home.svelte";
  import Mangas from "./pages/Mangas.svelte";
  import Videos from "./pages/Videos.svelte";
  import Favorites from "./pages/Favorites.svelte";
  import Content from "./pages/Content.svelte";
  import Viewer from "./pages/Viewer.svelte";

  const navItems = [
    { title: "Home", path: "/", class: "home" },
    { title: "Videos", path: "/videos", class: "film" },
    { title: "Mangas", path: "/mangas", class: "book" },
    { title: "Favorites", path: "/favorites", class: "heart" }
  ];
  FavoritesStores.set(getContext("User").favorites);
</script>

<Router>
  <Navbar on:click {navItems} />
  <Route path="/videos/content/:id/:page/:filter" component={Content} />
  <Route path="/videos/viewer/:folderId/:fileId" component={Viewer} />
  <Route path="/videos/:dir/:page/:filter" component={Videos} />

  <Route path="/mangas/content/:id/:page/:filter" component={Content} />
  <Route path="/mangas/viewer/:folderId/:fileId" component={Viewer} />
  <Route path="/mangas/:dir/:page/:filter" component={Mangas} />

  <Route path="/favorites/content/:id/:page/:filter" component={Content} />
  <Route path="/favorites/:id/:page/:filter" component={Favorites} />
  <Route path="/favorites/viewer/:folderId/:fileId" component={Viewer} />

  <Route exact path="/">
    <Home />
  </Route>
  <Route path="*">
    <div>Not found</div>
  </Route>
</Router>
