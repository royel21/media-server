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

  let data = { items: { others: [], adults: [] }, current: "all" };
  let isFav = title === "Favorites";

  const select = ({ target }) => {
    const id = target.closest("li").id || target.id;
    data.current = id;
    navigate(`${item.path}/${data.current}`);
  };

  $: if (dirs.Mangas.length) {
    const others = [...dirs[item.title].filter((i) => !i.IsAdult)];
    const adults = [...dirs[item.title].filter((i) => i.IsAdult)];

    const current = location.pathname.split("/").pop() || others[0].Id;

    data = {
      items: {
        others,
        adults,
      },
      current,
    };
  }

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

<li class={`nav-item ${item.title}`} on:click={select} id={data.current}>
  <Link to={`${item.path}/${data.current}`} {getProps}>
    <Icons name={item.class} height="22px" color={item.color} />
    <span class="nav-title">{item.title}</span>
    <ul class="down-list">
      {#if data.items.adults.length}
        <ListItems {title} items={data.items.others} current={data.current} {isFav} />
        <ListItems title="R18" class="adult" items={data.items.adults} current={data.current} />
        <li class="list-item s-list" id="all" class:selected={"all" === data.current}>All</li>
      {:else if dirs[title]}
        {#if !isFav && dirs[title].length > 1}
          <li class="list-item s-list" id="all" class:selected={"all" === data.current}>All</li>
        {/if}
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
  .nav-item:hover .down-list {
    display: initial;
  }
  .down-list {
    display: none;
    position: absolute;
    top: 100.5%;
    left: 0;
    min-width: 100%;
    text-align: left;
    background-color: #343a40;
    border-radius: 0 0 0.25rem 0.25rem;
  }
  .down-list:hover {
    display: initial;
  }
  .down-list li {
    padding: 5px;
    font-weight: bold;
    font-size: 12px;
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
  .nav-item:hover,
  .down-list :global(li:hover) {
    background-color: rgb(2 177 242);
  }

  .down-list li:last-child {
    border-radius: 0 0 0.25rem 0.25rem;
  }

  .selected {
    background-color: rgb(11 61 201 / 71%);
  }
</style>
