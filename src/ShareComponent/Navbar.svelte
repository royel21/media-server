<script>
  import { getContext } from "svelte";
  import { Link, navigate } from "svelte-routing";
  const User = getContext("User");
  export let navItems;

  function getProps({ location, href, isPartiallyCurrent, isCurrent }) {
    const isActive = href === "/" ? isCurrent : isPartiallyCurrent || isCurrent;
    if (isActive) {
      return { class: "active" };
    }
    return {};
  }
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
    font-size: 1.2rem;
  }
  #p-config label {
    line-height: 1.8;
    padding: 0px 10px;
    cursor: pointer;
  }
</style>

<nav id="menu" class="navbar">
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
      <label for="show-config">
        <i class="fas fa-user-cog" />
        <span>{User.username}</span>
      </label>
    </li>
  </ul>
</nav>
