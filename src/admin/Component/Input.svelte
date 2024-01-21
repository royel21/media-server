<script>
  export let item;
  export let key;
  export let label;
  let clazz;
  export { clazz as class };
  export let onChange = (e) => {};
</script>

<div class={"input-control " + clazz}>
  <span class="input-label">{label || key}</span>
  <input class="input" bind:value={item[key]} on:change={onChange} />
</div>

<style>
  span {
    user-select: none;
  }
</style>
