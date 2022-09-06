<script>
  import { createEventDispatcher } from "svelte";

  import Pagination from "../../ShareComponent/Pagination.svelte";
  import { ToggleMenu } from "../../ShareComponent/ToggleMenu";
  import { formatTime } from "../Pages/Utils";

  const dispatch = createEventDispatcher();

  export let files = [];
  export let fileId;
  export let filters = { filter: "" };

  const filePerPage = 100;
  let observer;
  let playList;
  let hideList = true;
  let totalPages = 0;
  let page = 1;
  let toLoad = 0;
  let filtered = [];

  const getPage = () => {
    let i = filtered.findIndex((f) => f.Id === fileId);
    let pg = 1;
    while (pg * filePerPage < i && pg < totalPages) pg++;
    return pg;
  };

  const setObserver = () => {
    if (observer) {
      observer.disconnect();
    }
    if (playList) {
      let imgs = document.querySelectorAll("#play-list li img");
      observer = new IntersectionObserver(
        (entries) => {
          for (let entry of entries) {
            let img = entry.target;
            if (entry.isIntersecting) {
              img.src = img.dataset.src;
            } else {
              img.src = "";
            }
          }
        },
        {
          root: playList,
          rootMargin: "1000px",
          threshold: 0,
        }
      );

      imgs.forEach((lazyImg) => {
        observer.observe(lazyImg);
      });
    }
  };

  $: if (!hideList) {
    if (playList) {
      let current = document.querySelector("#play-list .active");
      if (current) {
        playList.scroll({
          top: current.offsetTop - 250,
        });
        setObserver();
        setTimeout(() => {
          playList.scroll({
            top: current.offsetTop - 250,
          });
        }, 300);
      }
    }
  }

  const goToPage = (pg) => {
    pg = parseInt(pg.detail);
    if (pg < 1 || pg > totalPages || isNaN(pg)) return;
    page = pg < 1 ? 1 : pg > totalPages ? totalPages : pg;
    setObserver();
  };

  const clearFilter = () => {
    filters.filter = "";
    dispatch("clearfilter");
  };

  $: if (files.length > 100 && totalPages === 0) {
    totalPages = Math.ceil(filtered.length / filePerPage);
    page = getPage();
  }
  $: {
    if (filters.filter) {
      filtered = files.filter((f) => f.Name.contains(filters.filter));
    } else {
      filtered = files;
    }

    const tout = setTimeout(() => {
      setObserver();
      clearTimeout(tout);
    }, 50);
  }

  $: {
    let start = (page - 1) * filePerPage;
    if (start < filtered.length) {
      toLoad = start;
    } else {
      toLoad = 0;
    }
  }
</script>

<label class={"show-list" + (!hideList ? " move" : "")} for="p-hide" style="bottom: 35px" title="play-list">
  <span class="p-sort">
    <i class="fas fa-list" />
  </span>
</label>
<div
  id="p-bg"
  class:hidelist={!hideList}
  on:click|stopPropagation|preventDefault={() => {
    hideList = true;
    console.log("toggle");
  }}
  tabindex="-1"
/>
<input name="show-hide-play-list" type="checkbox" id="p-hide" bind:checked={hideList} />
<div id="play-list" class:move={!$ToggleMenu}>
  <div id="v-filter">
    <input name="clear-filters" type="text" bind:value={filters.filter} placeholder="Filter" class="form-control" />
    <span class="clear-filter" on:click={clearFilter}>
      <i class="fas fa-times-circle" />
    </span>
  </div>
  <div id="p-list" bind:this={playList}>
    <ul>
      {#each filtered.slice(toLoad, toLoad + filePerPage) as { Id, Name, Cover, CurrentPos, Duration, Type }}
        <li id={Id} class={Id === fileId ? "active" : ""} on:click>
          <span class="cover">
            <img data-src={Cover} src="" alt="" />
            <span class="duration">
              {Type.includes("Manga") ? `${CurrentPos + 1}/${Duration}` : formatTime(Duration)}
            </span>
          </span>
          <span class="l-name">{Name}</span>
        </li>
      {/each}
    </ul>
  </div>
  {#if totalPages > 1}
    <div class="b-control">
      <Pagination page={parseInt(page || 1)} {totalPages} on:gotopage={goToPage} hideFL={true} />
    </div>
  {/if}
</div>

<style>
  #p-bg.hidelist {
    display: block;
  }

  #p-bg {
    display: none;
    position: absolute;
    top: 36px;
    right: 220px;
    bottom: 34px;
    width: 100%;
    z-index: 999;
  }

  label {
    margin: 0;
  }
  .show-list {
    position: fixed;
    right: 5px;
    bottom: 40px;
    transition: 0.3s all;
    z-index: 10;
    background-color: black;
    padding: 4px 6px;
    border-radius: 0.25rem;
  }
  .show-list i {
    font-size: 20px;
  }
  .move {
    right: 230px;
  }
  input[type="checkbox"] {
    display: none;
  }

  #play-list {
    position: absolute;
    top: 0px;
    right: 0;
    bottom: 0;
    width: 220px;
    background-color: black;
    border-left: 2px solid;
    transition: 0.3s all;
    z-index: 11;
    overflow: hidden;
  }
  #play-list.move {
    top: 37px;
  }
  #p-list {
    overflow-y: auto;
    height: calc(100% - 31px);
    overflow-x: hidden;
    padding-bottom: 35px;
  }

  #p-hide:checked + #play-list {
    width: 0;
    border: none;
  }

  #play-list label i {
    transition: 0.3s all;
  }

  #p-hide:checked + #play-list .p-controls .form-control {
    display: none;
  }

  #play-list .p-controls .p-sort {
    margin: 0;
    width: 32px;
    font-size: 30px;
    padding: 0 8px;
    flex-grow: 0;
  }

  #play-list .p-controls .form-control {
    display: inline-block;
    height: 30px;
    margin: 0 4px;
  }

  #play-list ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  #play-list #p-list li {
    display: flex;
    flex-direction: column;
    padding: 4px;
    border-bottom: 1px solid;
    height: 225px;
    cursor: pointer;
    user-select: none;
  }

  #play-list #p-list li:last-child {
    border-bottom: none;
  }

  #play-list #p-list li:hover {
    background-color: rgba(20, 101, 50, 0.5);
  }

  .active {
    background-color: darkslategrey;
  }

  #play-list .cover {
    position: relative;
    pointer-events: none;
    width: 100%;
    text-align: center;
  }

  #play-list .l-name {
    display: inline-block;
    padding-left: 5px;
    font-size: 14px;
    text-align: center;
  }

  #play-list .duration {
    position: absolute;
    display: inline-block;
    right: 0px;
    bottom: 8px;
    padding: 0 4px;
    background-color: black;
    border-radius: 0.25rem;
    font-size: 13px;
  }

  #play-list img {
    max-height: 185px;
  }

  #play-list #p-list::-webkit-scrollbar {
    width: 10px;
  }

  #play-list #v-filter {
    flex-grow: 1;
  }
  #play-list #v-filter .form-control {
    border-radius: 0;
    padding: 0.2rem 0.5rem;
  }
  #play-list .clear-filter {
    right: 6px;
    top: 3px;
  }

  #p-items {
    display: inline-block;
    padding: 0 8px;
  }
  li * {
    pointer-events: none;
  }
  li > span:last-child {
    display: inline-block;
    height: max-content;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.625;
  }
  .b-control {
    text-align: center;
    position: absolute;
    bottom: 4px;
    width: 100%;
  }
  @media screen and (max-width: 600px) {
    #p-list::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }

    #play-list.move {
      top: 56px;
      bottom: 31px;
    }
  }
</style>
