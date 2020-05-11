<script>
  import { getContext, onDestroy } from "svelte";
  import { Link, navigate } from "svelte-routing";
  import Config from "./Config.svelte";
  import { ToggleMenu } from "./ToggleMenu";

  export let navItems;

  const User = getContext("User");

  function getProps({ location, href, isPartiallyCurrent, isCurrent }) {
    let isActive = false;
    if (href === "/" && location.pathname === "/") isActive = true;

    if (href !== "/" && isPartiallyCurrent) {
      isActive = true;
    }

    if (isActive) {
      return { class: "active" };
    }
    return {};
  }
  let menuToggle = false;
  let unSubscribe = ToggleMenu.subscribe(value => {
    menuToggle = value;
  });
  onDestroy(unSubscribe);
</script>

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

  .nav-item {
    font-size: 1.2rem;
  }
  #p-config {
    position: relative;
    color: white;
  }
  @media screen and (max-width: 460px) {
    #p-config {
      display: inline-block;
      text-align: center;
      align-self: center;
    }
  }
</style>

<nav id="menu" class="navbar" class:hide={menuToggle}>
  <ul class="navbar-nav">
    {#each navItems as item}
      <li class="nav-item">
        <Link to={item.path} {getProps}>
          <i class={'fas fa-' + item.class} />
          {item.title}
        </Link>
      </li>
    {/each}
  </ul>
  <ul class="navbar-nav">
    <li id="p-config" class="nav-item">
      <Config {User} on:click />
    </li>
  </ul>
</nav>
