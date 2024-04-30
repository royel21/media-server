<script>
  import { Link } from "svelte-routing";
  import { getProps } from "src/ShareComponent/DataUtils";
  import Icons from "src/icons/Icons.svelte";
  import { navigate } from "svelte-routing";
  export let dirs;
  export let item;

  let data = { items: { others: [], adults: [] }, current: "" };

  const select = ({ target }) => {
    const id = target.closest("li").id || target.id;
    data.current = id;
    navigate(`${item.path}/${data.current}`);
  };

  $: if (dirs.Mangas.length) {
    const others = dirs[item.title].filter((i) => !i.IsAdult);
    const adults = dirs[item.title].filter((i) => i.IsAdult);
    let current = others[0]?.Id || "";

    data = {
      items: {
        others,
        adults,
      },
      current,
    };
  }
</script>

<li class="nav-item" on:click={select} id={data.items.others[0]?.Id}>
  <Link to={`${item.path}/${data.current}`} {getProps}>
    <Icons name={item.class} height="22px" color={item.color} />
    <span class="nav-title">{item.title}</span>
    {#if data.items}
      <ul class="down-list">
        {#each data.items.others as { Id, Name }}
          <li class="list-item" id={Id} class:selected={Id === data.current}>
            <span>{Name}</span>
          </li>
        {/each}
        {#if data.items.adults.length > 0}
          <li class="list-item s-list adult" id={data.items.adults[0]?.Id}>
            R18
            {#if data.items.adults.length > 1}
              <span>&gt;</span>
              <ul class="sub-list">
                {#each data.items.adults as { Id, Name }}
                  <li class="list-item adult" id={Id} class:selected={Id === data.current}>
                    <span>{Name}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </li>
        {/if}
      </ul>
    {/if}
  </Link>
</li>

<style>
  .nav-item:hover .down-list {
    display: initial;
  }
  .nav-item ul .list-item:hover {
    background-color: #8e5e00;
  }
  .list-item span {
    pointer-events: none;
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
  .down-list li:hover {
    background-color: rgb(2 177 242);
  }

  .down-list li:last-child {
    border-radius: 0 0 0.25rem 0.25rem;
  }
  .down-list .s-list {
    position: relative;
    overflow: visible;
  }
  .s-list > span {
    position: absolute;
    top: -3px;
    right: 5px;
    font-size: 1.3rem;
  }
  .sub-list {
    display: none;
    position: absolute;
    top: 0;
    left: 100%;
    background-color: #343a40;
    border-radius: 0 0 0.25rem 0.25rem;
  }

  .down-list .s-list:hover .sub-list {
    display: initial;
  }

  .selected {
    background-color: rgb(11 61 201 / 71%);
  }
</style>
