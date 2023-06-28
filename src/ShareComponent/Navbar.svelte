<script>
  import { Link } from "svelte-routing";
  import { ToggleMenu } from "./ToggleMenu";
  import { getProps } from "./DataUtils";
  import Icons from "../icons/Icons.svelte";

  export let navItems;
  export let filters = [];

  let menuToggle = false;

  ToggleMenu.subscribe((value) => (menuToggle = value));
</script>

<nav id="menu" class="navbar usn" class:hide={menuToggle}>
  <ul class="navbar-nav">
    {#each navItems as item}
      {#if filters.includes(item.title)}
        <slot {item} name="nav-item" />
      {:else}
        <li class="nav-item">
          <Link to={item.path} {getProps}>
            <Icons name={item.class} height="22px" color={item.color} />
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
    width: 100%;
    justify-content: space-between;
    padding: 0;
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
  .nav-item :global(svg) {
    cursor: pointer;
  }
  .nav-item:active :global(svg) {
    transform: scale(1.1);
  }
</style>
