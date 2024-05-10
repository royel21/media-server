<script>
  export let label = "";
  export let item;
  export let key = "";
  export let options = [];
  export let onChange = () => {};
</script>

<div class={"input-control " + key}>
  <span class="input-label">{label || key}</span>
  <select name={key} bind:value={item[key]} class="input" on:change={onChange}>
    {#each options as { Id, Name }}
      <option value={Id || Name}>{Name || Id}</option>
    {/each}
  </select>
</div>

<style>
  span {
    user-select: none;
  }
</style>
