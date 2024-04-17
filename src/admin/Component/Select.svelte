<script>
  export let label;
  export let item;
  export let key;
  export let options = [];
  export let changes = () => {};
  let clazz;
  export { clazz as class };
</script>

<div class={"input-control " + clazz}>
  <span class="input-label">{label || key}</span>
  <select name={key} bind:value={item[key]} class="input" on:changes={changes}>
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
