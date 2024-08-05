<script>
  export let label = "";
  export let item;
  export let key = "";
  export let options = [];
  export let onChange = () => {};
</script>

<div class={"input-control " + key}>
  <span class="input-label">{label || key}</span>
  <select name={key} bind:value={item} class="input" on:change={onChange}>
    {#each options as op}
      <option value={op}>{op.Name || op.Id}</option>
    {/each}
  </select>
</div>

<style>
  span {
    user-select: none;
  }
</style>
