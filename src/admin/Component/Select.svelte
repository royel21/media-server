<script>
  export let label;
  export let item;
  export let key;
  export let options = [];
  let clazz;
  export { clazz as class };
</script>

<div class={"input-control " + clazz}>
  <span class="input-label">{label || key}</span>
  <select bind:value={item[key]} class="input">
    {#each options as { Id, Name }}
      <option value={Id || Name}>{Name || Id}</option>
    {/each}
  </select>
</div>
