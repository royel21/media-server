<script>
  import apiUtils from "src/apiUtils";
  import Icons from "src/icons/Icons.svelte";
  import Filter from "src/ShareComponent/Filter.svelte";
  import { onMount } from "svelte";
  import InputTag from "./InputTag.svelte";

  let items = [];
  let filter = "";
  let filtered = [];
  let editing = "";
  let isMounted = true;

  const filterTags = (tag) => {
    return tag.toLocaleLowerCase().includes(filter.toLocaleLowerCase());
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
      editing = { name: text, tag: text };
      items.unshift(text);
      items = items;
    }
  };
  const editTag = ({ target }) => {
    if (!editing.name) {
      const tag = target.closest("li").textContent.trim();
      editing = { tag, name: tag };
    }
  };
  const save = async () => await apiUtils.post("admin/folders/tags", { tags: items });

  const saveTag = async () => {
    const index = items.findIndex((it) => it === editing.tag);
    if (items[index] !== editing.name.trim()) {
      items[index] = editing.name.trim();
    }
    items.sort();
    editing = {};
    await save();
  };
  const removeTag = ({ target }) => {
    const li = target.closest("li");
    const input = li.querySelector("input");
    const tag = (input?.value || li.textContent).trim();
    if (items.includes(tag)) {
      items = items.filter((it) => it !== tag);
      save();
    }
  };

  const load = async () => {
    const result = await apiUtils.get(["admin", "folders", "tags"]);
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
          <li id={tag} class="list-group-item">
            <span id="trash" class="icon" on:click={removeTag}><Icons name="trash" box="0 0 420 512" /></span>
            <span id="edit" class="icon" on:click={editTag}><Icons name="edit" /></span>
            {#if editing.tag === tag}
              <InputTag tag={editing} {saveTag} />
            {:else}
              {tag}
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
    margin-left: 5px;
    padding: 5px;
    border-radius: 0.25rem;
    background-color: #2196f3;
  }
</style>
