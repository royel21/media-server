<script>
  import { Link, navigate } from "svelte-routing";
  export let navItems;
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
    {#each navItems as item}
      <li class="nav-item">
        <Link to={item.path}>
          <i class={'fas fa-' + item.class} />
          {item.title}
        </Link>
      </li>
    {/each}
  </ul>
  <ul class="navbar-nav">
    <li class="nav-item" on:click>
      <i class="fas fa-sign-out-alt" />
    </li>
  </ul>
</nav>
