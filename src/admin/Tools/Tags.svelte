<script>
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Filter from "src/ShareComponent/Filter.svelte";
  import { onMount } from "svelte";
  import InputTag from "./InputTag.svelte";
  import { sortByName } from "@share/utils";

  let items = [];
  let filter = "";
  let filtered = [];
  let editing = "";
  let isMounted = true;

  const filterTags = (tag) => {
    return tag.Name.toLocaleLowerCase().includes(filter.toLocaleLowerCase());
  };

  const addTag = async () => {
    let text = "New Tag";

    try {
      if (navigator.clipboard) {
        const tag = await navigator.clipboard?.readText();
        if (!items.includes(tag)) {
          text = tag.trim();
        }
      }
    } catch (error) {
      console.log(error);
    }

    if (!items.includes(text)) {
      editing = { Name: text, name: text, IsRemove: false };
      items.unshift({ Name: text });
      items = items;
    }
  };

  const editTag = ({ target }) => {
    if (!editing.name) {
      const tag = target.closest("li").id;
      const found = items.find((g) => g.Name === tag);

      editing = { ...found, name: found.Name };
    }
  };

  const saveTag = async () => {
    const result = await apiUtils.post("admin/app-config/genres", { Genre: editing });
    if (result.valid) {
      const index = items.findIndex((g) => g.Name === editing.Name);
      if (index > -1) {
        items[index].Id = result.Id;
        items[index].Name = editing.name;
        items[index].IsRemove = editing.IsRemove;
        items.sort(sortByName);
        editing = {};
      }
    }
  };

  const onDisabledTag = async ({ target }) => {
    const li = target.closest("li");
    const found = items.find((it) => it.Name === li.id);
    if (found) {
      const result = await apiUtils.post("admin/app-config/genres", { Genre: { ...found, IsRemove: !found.IsRemove } });
      if (result.valid) {
        found.IsRemove = !found.IsRemove;
        items = items;
      }
    }
  };

  const removeTag = async ({ target }) => {
    const li = target.closest("li");
    const found = items.find((it) => it.Name === li.id);
    if (found) {
      const result = await apiUtils.post("admin/app-config/genres/remove", { Id: found.Id });
      if (result.valid) {
        items = items.filter((it) => it.Name !== li.id);
        editing = {};
      }
    }
  };

  const load = async () => {
    const result = await apiUtils.get(["admin", "app-config", "genres"], "gen-manager");

    if (isMounted && result.length) {
      items = result.sort();
      filtered = items;
    }
  };

  onMount(async () => {
    load();
    return () => {
      isMounted = false;
    };
  });
  $: filter, (filtered = items.filter(filterTags));
</script>

<div id="tag-list" class="file-list">
  <slot name="first-tag" />
  <div class="controls">
    <span class="create-folder" on:click={addTag}><Icons name="squareplus" box="0 0 512 512" /></span>
    <Filter bind:filter />
    <span class="bagde">{filtered.length}</span>
  </div>
  <div class="list-container">
    <ul class="list-group text-dark">
      {#if items.length < 1}
        <li class="list-group-item empty-list">Not Tags Found</li>
      {:else}
        {#each filtered as tag}
          <li id={tag.Name} class="list-group-item" on:dblclick={editTag}>
            <span id="trash" class="icon" on:click={removeTag} on:dblclick|stopPropagation>
              <Icons name="trash" box="0 0 420 512" />
            </span>
            <span class="icon" on:click={onDisabledTag} on:dblclick|stopPropagation>
              <Icons name={`square${tag.IsRemove ? "xmark" : "check"}`} color={tag.IsRemove ? "red" : "green"} />
            </span>
            {#if editing.Name === tag.Name}
              <InputTag bind:editing {saveTag} />
            {:else}
              {tag.Name}
            {/if}
          </li>
        {/each}
      {/if}
    </ul>
  </div>
</div>

<style>
  #tag-list {
    height: 100%;
  }

  #tag-list .list-container {
    height: calc(100% - 60px);
    overflow-y: auto;
    background-color: white;
    border-radius: 5px;
  }
  #tag-list li {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0;
  }
  #tag-list .controls {
    position: initial;
    display: flex;
    align-items: center;
    padding: 0px 0 4px 0;
    justify-content: initial;
  }
  #tag-list .list-group-item {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  #tag-list .empty-list:only-child {
    justify-content: center;
  }
  #tag-list li span:hover {
    cursor: ponter;
  }
  #tag-list li :global(svg) {
    pointer-events: none;
    width: 25px;
  }
  #tag-list .controls :global(.icon-squareplus) {
    top: 3px;
    left: 5px;
    width: 35px;
    height: 35px;
  }
  #tag-list .create-folder {
    margin-right: 8px;
  }
  #tag-list :global(#filter-control) {
    flex-grow: 1;
    max-width: initial;
  }

  #tag-list li .icon {
    cursor: pointer;
    user-select: none;
  }
  #tag-list li > span {
    padding: 5px;
  }
  #tag-list .bagde {
    height: 30px;
    line-height: 1.1;
    margin-left: 5px;
    padding: 5px;
    border-radius: 0.25rem;
    background-color: #2196f3;
  }
</style>
