<script>
  import { Link, navigate } from "svelte-routing";
</script>

<style>
  #menu {
    display: flex;
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    justify-content: space-between;
    padding: 0;
    user-select: none;
    background-color: #343a40;
  }
  .navbar-nav {
    display: flex;
    justify-content: left;
  }

  .nav-item {
    padding: 5px;
    font-size: 1.2rem;
  }
</style>

<nav id="menu" class="navbar">
  <ul class="navbar-nav">
    <li class="nav-item">
      <Link to="/">
        <i class="fas fa-home" />
        Home
      </Link>
    </li>
    <li class="nav-item">
      <Link to="/videos">
        <i class="fas fa-film" />
        Videos
      </Link>
    </li>
    <li class="nav-item">
      <Link to="/mangas">
        <i class="fas fa-book" />
        Mangas
      </Link>
    </li>
    <li class="nav-item">
      <Link to="/favorites">
        <i class="fas fa-heart" />
        Favorites
      </Link>
    </li>
  </ul>
  <ul class="navbar-nav">
    <li class="nav-item" on:click>
      <i class="fas fa-sign-out-alt" />
    </li>
  </ul>
</nav>
