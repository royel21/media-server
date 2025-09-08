<script>
  import { Link } from "svelte-routing";
  import { getProps } from "src/ShareComponent/DataUtils";
  import Icons from "src/icons/Icons.svelte";
  import { navigate } from "svelte-routing";
  import ListItems from "./ListItems.svelte";
  import { afterUpdate } from "svelte";
  export let dirs;
  export let item;
  export let title = "";

  let data = { items: { others: [], adults: [] }, current: "" };
  let isFav = title === "Favorites";
  let thisLi;

  const getPath = () => `${item.path}${data.current ? "/" + data.current : ""}`;

  const select = ({ target }) => {
    const id = target.closest("li").id || target.id;

    if (id) {
      data.current = id;
      navigate(getPath());
    }
  };

  $: if (dirs[item.title]?.length) {
    const others = [...dirs[item.title].filter((i) => !i.IsAdult)];
    const adults = [...dirs[item.title].filter((i) => i.IsAdult)];

    let id = location.pathname.split("/").pop();

    if (!others.find((o) => o.Id === +id)) {
      id = null;
    }

    const current = id || others[0]?.Id;

    data = {
      items: {
        others,
        adults,
      },
      current,
    };
  }

  const getEl = (q) => thisLi.querySelector(q);

  const handlerNav = (e) => {
    const current = getEl(".current .current") || getEl(".current") || getEl("li:first-child");

    if ([37, 39].includes(e.keyCode) && thisLi.querySelector(".current ul")) {
      e.stopPropagation();
      const { classList } = getEl(".current .current") || getEl(".current li:first-child");
      if (classList) {
        if (e.keyCode === 39) {
          classList.add("current");
        } else {
          classList.remove("current");
        }
      }
    }

    if ([38, 40].includes(e.keyCode)) {
      const nextEl = e.keyCode === 38 ? "previousElementSibling" : "nextElementSibling";
      if (current) {
        if (current?.classList.contains("current") && current[nextEl]) {
          current.classList.remove("current");
          current[nextEl]?.classList.add("current");
        } else {
          current.classList.add("current");
        }
      }
    }

    if (current && e.keyCode === 13) {
      current.click();
    }
  };
  const focus = ({ target }) => {
    target.querySelector("a")?.focus();
    [...document.querySelectorAll(".current")].forEach((it) => {
      it.classList.remove("current");
    });
    [...document.querySelectorAll(".selected")].forEach((it) => {
      it.classList.add("current");
    });
  };

  const setAsCurrent = ({ target }) => {
    [...document.querySelectorAll(".current")].forEach((it) => {
      it.classList.remove("current");
    });
    target.classList.add("current");
    target.parentElement.closest("li").classList.add("current");
  };

  afterUpdate(() => {
    const li = document.querySelector(`.${item.title} .s-list .selected`);
    if (li) {
      [...document.querySelectorAll(".s-list:not(#all)")].forEach((it) => {
        it.classList.remove("selected");
      });
      li.parentElement.closest("li").classList.add("selected");
    }
  });
</script>

<li
  class={`nav-item ${item.title}`}
  bind:this={thisLi}
  on:click={select}
  id={data.current}
  on:keydown={handlerNav}
  on:mouseenter={focus}
  tabindex="-1"
>
  <Link to={getPath()} {getProps}>
    <Icons name={item.class} height="22px" color={item.color} box={item.box} />
    <span class="nav-title">{item.title}</span>
    <ul class="down-list">
      {#if !isFav && dirs[title]?.length > 1}
        <li class="list-item s-list" id="all" class:selected={"all" === data.current} on:mouseenter={setAsCurrent}>
          All
        </li>
      {/if}
      {#if data.items.adults.length}
        <ListItems {title} items={data.items.others} current={data.current} {setAsCurrent} />
        <ListItems title="R18" class="adult" items={data.items.adults} current={data.current} {setAsCurrent} />
      {:else if dirs[title]}
        {#each dirs[title] as { Id, Name }}
          <li class={`list-item`} id={Id} class:selected={Id === data.current}>
            <span>{Name}</span>
          </li>
        {/each}
      {/if}
    </ul>
  </Link>
</li>

<style>
  .down-list {
    display: none;
    position: absolute;
    top: 100.5%;
    left: 0;
    min-width: 100%;
    text-align: left;
    background-color: #343a40;
    border-radius: 0 0 0.25rem 0.25rem;
    z-index: 99;
  }

  .down-list li {
    padding: 5px;
    font-weight: bold;
    font-size: 12px;
    min-width: 90px;
    max-width: 210px;
    overflow: hidden;
    white-space: nowrap;
    height: 33px;
  }
  .down-list li span {
    max-width: 100%;
    overflow: hidden;
    display: inline-block;
  }
  .down-list li:not(:last-child) {
    border-bottom: 1px solid;
  }
  .adult {
    background-color: firebrick;
  }
  .nav-item > :global(a:focus),
  .nav-item:hover {
    background-color: rgb(2 177 242);
  }

  .down-list li:last-child {
    border-radius: 0 0 0.25rem 0.25rem;
  }

  .selected {
    background-color: rgb(11 61 201 / 71%);
  }

  .down-list :global(.current) {
    background-color: #8e5e00;
  }

  .nav-item > :global(a:focus .down-list),
  .nav-item:hover :global(.down-list),
  .nav-item :global(.current .sub-list) {
    display: initial !important;
  }
</style>
