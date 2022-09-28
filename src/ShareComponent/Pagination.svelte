<script>
  import { createEventDispatcher } from "svelte";
  import paginationInput from "./PageInput";
  import { clamp } from "./utils";

  const dispatch = createEventDispatcher();

  export let page = 1;
  export let totalPages = 0;
  export let hideFL = false;
  let showinput = false;

  const pagerClick = (e) => {
    window.localStorage.setItem("selected", 0);
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
</script>

{#if totalPages > 1}
  <div id="pager" on:click={pagerClick}>
    <ul class="pagination">
      <li id="first-page" class="page-link" class:d-none={hideFL}>
        <i class="fas fa-angle-double-left" />
      </li>
      <li id="prev-page" class="page-link" class:border-r-left={hideFL}>
        <i class="fas fa-angle-left" />
      </li>
      <li id="current-page" class="page-link" on:click={onShowinput}>
        {#if showinput}
          <input
            on:blur={hideInput}
            type="text"
            value={page}
            class="form-control"
            on:change={handleChange}
            use:init
            on:keydown|stopPropagation
          />
        {:else}{page + "/" + totalPages}{/if}
      </li>
      <li id="next-page" class="page-link" class:border-r-right={hideFL}>
        <i class="fas fa-angle-right" />
      </li>
      <li id="last-page" class="page-link" class:d-none={hideFL}>
        <i class="fas fa-angle-double-right" />
      </li>
    </ul>
  </div>
{/if}

<style>
  #pager {
    display: inline-block;
    width: fit-content;
    padding: 0;
    pointer-events: all;
    user-select: none;
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
    height: 32px;
    cursor: pointer;
  }
  #pager li:not(#current-page) {
    line-height: 2;
    padding: 0 15px;
  }
  #pager #current-page {
    min-width: 70px;
    max-width: 85px;
    text-align: center;
    font-size: 14px;
    padding: 0 4px;
    line-height: 2;
    font-weight: 700;
  }
  .page-link {
    position: relative;
    display: block;
    padding: 0.5rem 0.75rem;
    margin-left: -1px;
    line-height: 1.25;
    color: #007bff;
    background-color: #fff;
    border: 1px solid #dee2e6;
  }
  .fas {
    pointer-events: none;
  }
  #current-page {
    user-select: none;
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
  @media screen and (max-width: 600px) {
    #last-page,
    #first-page {
      display: none;
    }
    #prev-page {
      border-top-left-radius: 0.25rem;
      border-bottom-left-radius: 0.25rem;
    }

    #next-page {
      border-top-right-radius: 0.25rem;
      border-bottom-right-radius: 0.25rem;
    }
  }
</style>
