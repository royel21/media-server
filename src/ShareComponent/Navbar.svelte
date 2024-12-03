<script>
  import { onMount, onDestroy, getContext } from "svelte";
  import { Link } from "svelte-routing";
  import { ToggleMenu } from "./ToggleMenu";
  import { getProps } from "./DataUtils";
  import Icons from "../icons/Icons.svelte";
  import NavItem from "src/ShareComponent/NavItem.svelte";
  import { isValidKey } from "./utils.js";

  export let navItems;
  export let filters = [];
  export let dirs = [];

  let menuToggle = false;

  const hotkeys = getContext("User").hotkeys;

  const prevTab = hotkeys.find((h) => h.Name === "Prev Tab");
  const nextTab = hotkeys.find((h) => h.Name === "Next Tab");

  ToggleMenu.subscribe((value) => (menuToggle = value));

  const onChangeTab = (e) => {
    const found = document.querySelector("#menu:not(.hide) .tabs a.active");
    if (found) {
      const tab = found.parentElement;
      let item;
      if (isValidKey(e, prevTab)) {
        item = tab.previousElementSibling;
      }

      if (isValidKey(e, nextTab)) {
        item = tab.nextElementSibling;
      }

      if (item) {
        item.querySelector("a")?.click();
      }
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
    <slot name="user" />
  </ul>
</nav>

<style>
  .navbar-nav {
    display: flex;
    justify-content: left;
  }
  .nav-item:hover {
    background-color: rgb(2 177 242);
  }
</style>
