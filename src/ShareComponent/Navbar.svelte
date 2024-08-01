<script>
  import { Link } from "svelte-routing";
  import { ToggleMenu } from "./ToggleMenu";
  import { getProps } from "./DataUtils";
  import Icons from "../icons/Icons.svelte";
  import NavItem from "src/ShareComponent/NavItem.svelte";

  export let navItems;
  export let filters = [];
  export let dirs = [];

  let menuToggle = false;

  ToggleMenu.subscribe((value) => (menuToggle = value));
</script>

<nav id="menu" class="navbar usn" class:hide={menuToggle}>
  <ul class="navbar-nav">
    {#each navItems as item}
      {#if filters.includes(item.title)}
        <NavItem {dirs} {item} slot="nav-item" />
      {:else}
        <li class="nav-item">
          <Link to={item.path} {getProps}>
            <Icons name={item.class} height="22px" color={item.color} class={item.class} />
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
    max-height: 60px;
    min-height: 35px;
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
</style>
