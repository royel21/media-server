<script>
  import { Router, Route } from "svelte-routing";
  import Navbar from "../ShareComponent/Navbar.svelte";
  import Home from "./Pages/Home.svelte";
  import Mangas from "./Pages/Mangas.svelte";
  import Videos from "./Pages/Videos.svelte";
  import Favorites from "./Pages/Favorites.svelte";
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
  <Route path="/videos/:page/:filter" component={Videos} />
  <Route path="/mangas/:page/:filter" component={Mangas} />
  <Route path="/favorites/:id/:page/:filter" component={Favorites} />
  <Route exact path="/">
    <Home />
  </Route>
  <Route path="*">
    <div>Not found</div>
  </Route>
</Router>
