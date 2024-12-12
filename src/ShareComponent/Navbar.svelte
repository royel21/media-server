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
  const logout = getContext("logout");

  const prevTab = hotkeys.find((h) => h.Name === "Prev Tab");
  const nextTab = hotkeys.find((h) => h.Name === "Next Tab");
  const logoutKey = hotkeys.find((h) => h.Name === "Logout");

  ToggleMenu.subscribe((value) => (menuToggle = value));

  const onChangeTab = (e) => {
    const found = document.querySelector(".b-content, .viewer");
    if (!found && [nextTab.Key, prevTab.Key].includes(e.keyCode)) {
      const tab = document.querySelector("#menu .tabs a.active").parentElement;
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

    if (isValidKey(e, logoutKey) && !/content|viewer/i.test(location.pathname)) {
      logout();
    }
  };

  const handlerNav = (e) => {
    e.stopPropagation();
    if ([37, 39].includes(e.keyCode)) {
      e.preventDefault();
      const parent = e.target.parentElement;
      let found;
      if (e.keyCode === 37 && parent.previousElementSibling) {
        found = parent.previousElementSibling;
      }

      if (e.keyCode === 39 && parent.nextElementSibling) {
        found = parent.nextElementSibling;
      }

      found?.querySelector("a").focus();
    }
  };

  onMount(() => {
    document.body.addEventListener("keydown", onChangeTab);
    [...document.querySelectorAll("tabs a")].forEach((it) => {
      it.onfocus = () => it.closest("li").focus();
    });
  });

  onDestroy(() => {
    document.body.removeEventListener("keydown", onChangeTab);
  });
</script>

<nav id="menu" class="navbar usn" class:hide={menuToggle}>
  <ul class="navbar-nav tabs" on:keydown={handlerNav}>
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
  .nav-item :global(a:focus),
  .nav-item:hover {
    background-color: rgb(2 177 242);
  }

  .nav-item > :global(.current) {
    background-color: #8e5e00;
  }
</style>
