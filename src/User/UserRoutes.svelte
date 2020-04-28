<script>
  import { Router, Route } from "svelte-routing";
  import Navbar from "../ShareComponent/Navbar.svelte";
  import Home from "./Pages/Home.svelte";
  import Folders from "./Pages/Folders.svelte";
  import Mangas from "./Pages/Mangas.svelte";
  import Videos from "./Pages/Videos.svelte";
  import Favorites from "./Pages/Favorites.svelte";
  export let socket;
  const navItems = [
    { title: "Home", path: "/", class: "home" },
    { title: "Videos", path: "/videos", class: "film" },
    { title: "Mangas", path: "/mangas", class: "book" },
    { title: "Favorites", path: "/favorites", class: "heart" }
  ];
</script>

<style>

</style>

<Router>
  <Navbar on:click {navItems} />
  <Route path="/folders" component={Folders} />
  <Route path="/videos" component={Videos} />
  <Route path="/mangas" component={Mangas} />
  <Route path="/favorites" component={Favorites} />
  <Route path="/">
    <Home {socket} />
  </Route>
</Router>
