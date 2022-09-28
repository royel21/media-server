<script>
  import { Link } from "svelte-routing";
  import { ToggleMenu } from "./ToggleMenu";
  import { getProps } from "./DataUtils";

  export let navItems;
  export let filters = [];

  let menuToggle = false;

  ToggleMenu.subscribe((value) => (menuToggle = value));
</script>

<nav id="menu" class="navbar" class:hide={menuToggle}>
  <ul class="navbar-nav">
    {#each navItems as item}
      {#if filters.includes(item.title)}
        <slot {item} name="nav-item" />
      {:else}
        <li class="nav-item">
          <Link to={item.path} {getProps}>
            <i class={"fas fa-" + item.class} />
            <span class="nav-title">{item.title}</span>
          </Link>
        </li>
      {/if}
    {/each}
  </ul>
  <ul class="navbar-nav">
    <li id="p-config" class="nav-item">
      <slot name="user" />
    </li>
  </ul>
</nav>

<style>
  #menu {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    justify-content: space-between;
    padding: 0;
    user-select: none;
    background-color: #343a40;
    transition: 0.3s all;
  }
  #menu.hide {
    top: -66px;
  }
  .navbar-nav {
    display: flex;
    justify-content: left;
  }
  .nav-item:hover {
    background-color: rgb(2 177 242);
  }
  #p-config {
    position: relative;
    color: white;
    height: 100%;
  }
  @media screen and (max-width: 460px) {
    #p-config {
      text-align: center;
      align-self: center;
    }
  }
</style>
