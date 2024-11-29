<script>
  import { onMount, onDestroy } from "svelte";
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

  const onChangeTab = (e) => {
    const found = document.querySelector("#menu:not(.hide) .tabs a.active");
    if (e.ctrlKey && found) {
      const tab = found.parentElement;
      let item;
      if (e.keyCode === 90) {
        item = tab.previousElementSibling;
      }

      if (e.keyCode === 88) {
        item = tab.nextElementSibling;
      }

      if (item) item.querySelector("a")?.click();
      e.preventDefault();
    }
  };

  onMount(() => {
    document.addEventListener("keydown", onChangeTab);
  });

  onDestroy(() => {
    document.removeEventListener("keydown", onChangeTab);
  });
</script>

<nav id="menu" class="navbar usn" class:hide={menuToggle}>
  <ul class="navbar-nav tabs">
    {#each navItems as item}
      {#if filters.includes(item.title)}
        <NavItem {dirs} {item} slot="nav-item" title={item.title} />
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
