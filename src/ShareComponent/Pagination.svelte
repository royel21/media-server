<script>
  import { createEventDispatcher } from "svelte";
  import paginationInput from "./PageInput";
  import { clamp } from "@share/utils";
  import Icons from "../icons/Icons.svelte";

  const dispatch = createEventDispatcher();

  export let page = 1;
  export let totalPages = 0;
  export let hideFL = false;
  export let full = false;
  const color = "#007bff";

  let showinput = false;

  const pagerClick = (e) => {
    let li = e.target;

    switch (e.target.id) {
      case "prev-page": {
        handlerPage(page - 1);
        break;
      }
      case "next-page": {
        handlerPage(+page + 1);
        break;
      }
      case "first-page": {
        handlerPage(1);
        break;
      }
      case "last-page": {
        handlerPage(totalPages);
        break;
      }
      case "current-page": {
        paginationInput(li, page, totalPages, dispatch);
        break;
      }
      default: {
      }
    }
  };

  const handlerPage = (p) => {
    let pg = +p;
    if (!isNaN(pg)) {
      pg = clamp(pg, 1, totalPages);
      dispatch("gotopage", pg);
    }
  };

  const onShowinput = () => {
    showinput = true;
  };

  const hideInput = () => {
    showinput = false;
  };
  const init = (el) => {
    el.focus();
  };

  const handleChange = (event) => {
    handlerPage(event.target.value);
  };

  const box = "0 0 320 512";
</script>

{#if totalPages > 1}
  <div id="pager" class="usn" on:click={pagerClick} class:full>
    <ul class="pagination">
      <li id="first-page" class="page-link" class:d-none={hideFL}>
        <Icons name="angledoubleleft" {color} />
      </li>
      <li id="prev-page" class="page-link" class:border-r-left={hideFL}>
        <Icons name="angleleft" {color} {box} />
      </li>
      <li class="page-link current-page" on:click={onShowinput}>
        {#if showinput}
          <input
            on:blur={hideInput}
            type="number"
            value={page}
            class="form-control"
            on:change={handleChange}
            use:init
            on:keydown|stopPropagation
          />
        {:else}{page + "/" + totalPages}{/if}
      </li>
      <li id="next-page" class="page-link" class:border-r-right={hideFL}>
        <Icons name="angleright" {color} {box} />
      </li>
      <li id="last-page" class="page-link" class:d-none={hideFL}>
        <Icons name="angledoubleright" {color} />
      </li>
    </ul>
  </div>
{/if}

<style>
  .page-link :global(svg) {
    top: 4px;
    pointer-events: none;
  }
  #pager {
    display: inline-block;
    width: fit-content;
    padding: 0;
    pointer-events: all;
    margin: 0 3px;
  }
  .pagination {
    display: flex;
    padding-left: 0;
    list-style: none;
    border-radius: 0.25rem;
    font-weight: bold;
    margin: 0;
  }
  #pager li {
    height: 30px;
    width: 45px;
    cursor: pointer;
  }
  #pager #prev-page,
  #pager #next-page {
    width: initial;
  }
  #pager #prev-page :global(svg),
  #pager #next-page :global(svg) {
    width: 40px;
  }
  #pager #next-page :global(svg) {
    right: -3px;
  }
  #pager li:not(.current-page) {
    line-height: 2;
    padding: 0 4px;
  }
  #pager .current-page {
    min-width: 60px;
    width: max-content;
    text-align: center;
    font-size: 14px;
    padding: 0 4px;
    line-height: 2.2;
    font-weight: 700;
  }
  .page-link {
    position: relative;
    display: block;
    margin-left: -1px;
    line-height: 1.25;
    color: #007bff;
    background-color: #fff;
    border: 1px solid #dee2e6;
  }

  input {
    min-width: 60px;
    width: max-content;
    max-width: 90px;
    height: 100%;
    text-align: center;
    padding: 0.1rem 0.2rem;
  }

  .d-none {
    display: none;
  }
  .border-r-left {
    border-top-left-radius: 0.25rem;
  }
  .border-r-right {
    border-top-right-radius: 0.25rem;
  }
  #pager .page-link:last-child,
  #pager .page-link:first-child {
    padding: 0 9px;
  }
  @media screen and (max-width: 640px) {
    #pager:not(.full) #last-page,
    #pager:not(.full) #first-page {
      display: none;
    }
    #pager:not(.full) #prev-page {
      border-top-left-radius: 0.25rem;
      border-bottom-left-radius: 0.25rem;
    }

    #pager:not(.full) #next-page {
      border-top-right-radius: 0.25rem;
      border-bottom-right-radius: 0.25rem;
    }
  }
</style>
