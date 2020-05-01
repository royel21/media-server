<script>
  import { Router, Route } from "svelte-routing";
  import Navbar from "../ShareComponent/Navbar.svelte";
  import Home from "./Pages/Home.svelte";
  import Folders from "./Pages/Folders.svelte";
  import Mangas from "./Pages/Mangas.svelte";
  import Videos from "./Pages/Videos.svelte";
  import Favorites from "./Pages/Favorites.svelte";
  const navItems = [
    { title: "Home", path: "/", class: "home" },
    { title: "Videos", path: "/videos/nu", class: "film" },
    { title: "Mangas", path: "/mangas/nu", class: "book" },
    { title: "Favorites", path: "/favorites/nu", class: "heart" }
  ];
</script>

<style>

</style>

<Router>
  <Navbar on:click {navItems} />
  <Route path="/videos/:order?" component={Videos} />
  <Route path="/mangas/:order" component={Mangas} />
  <Route path="/favorites/id?" component={Favorites} />
  <!-- <Route path="/content" component={} /> -->
  <Route exact path="/">
    <Home />
  </Route>
</Router>
