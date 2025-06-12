<script>
  import Input from "src/admin/Component/Input.svelte";

  export let item;
  export let key;
  export let label = "";
  export let subtitleCodes = [];
  export let height = 212;

  let showSubtCodeList = false;
  let filter = "";
  let ref;

  const toggleSubtCodeList = () => (showSubtCodeList = true);

  const hide = () => (showSubtCodeList = false);

  const onSelect = ({ target }) => {
    const lang = target.querySelector("span:first-child").id;
    if (!item[key].includes("|" + lang)) {
      item[key] = item[key] ? `${item[key]}|${lang}` : lang;
    }
  };

  const onFilter = (filter) => (lang) => (lang.code + lang.description).toLowerCase().includes(filter);

  const changes = ({ target: { value: val } }) => {
    item[key] = val;
  };

  $: filtered = subtitleCodes.filter(onFilter(filter));
</script>

<div class="subt" on:click={toggleSubtCodeList} bind:this={ref} on:mouseleave={hide}>
  <Input {label} {key} bind:item paste={false} onChange={changes} />
  <div class="subt-list" style={`height: ${height}px`} class:show-subt-code-list={showSubtCodeList}>
    <div class="sub-row-1 input-control">
      <span class="input-label">Filter</span>
      <input class="input" type="text" bind:value={filter} />
    </div>
    <div class="sub-content" on:click={onSelect}>
      {#each filtered.filter(onFilter) as sub}
        <div class="sub-row">
          <span id={sub.code}>{sub.code}</span>
          <span>{sub.description}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .subt {
    position: relative;
  }
  .subt-list {
    display: none;
    position: absolute;
    top: 30px;
    background-color: black;
    z-index: 99;
    border-radius: 0.25rem;
    width: 100%;
  }
  .sub-row-1 {
    top: 0;
    border-bottom: 1px solid white;
    margin-bottom: 2px;
    padding: 2px 0;
  }
  .subt .input-label {
    font-size: 0.8rem;
    line-height: 1.5;
    padding: 0;
    min-width: 80;
    max-width: 80;
  }
  .input-label,
  .input {
    height: 22px;
  }

  .sub-content {
    height: calc(100% - 30px);
    overflow-y: auto;
  }

  .show-subt-code-list {
    display: block;
  }
  .sub-row {
    display: flex;
    justify-content: space-between;
    padding: 2px 5px;
    user-select: none;
    cursor: pointer;
  }

  .sub-row:not(:last-child) {
    border-bottom: 1px solid;
  }

  .sub-row span {
    display: inline-block;
    width: 35%;
    text-align: left;
    font-size: 0.9rem;
    pointer-events: none;
  }
  .sub-row span:last-child {
    width: 65%;
    white-space: nowrap;
    overflow: hidden;
  }
</style>
