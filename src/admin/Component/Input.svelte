<script>
  export let item;
  export let key;
  export let label;
  let clazz;
  export { clazz as class };
  export let onChange = (e) => {};
  const handler = async () => {
    let text = await navigator.clipboard?.readText();
    item[key] = text;
  };
</script>

<div class={"input-control " + clazz}>
  <span class="input-label" on:click={handler} on:keydown={() => {}}>{label || key}</span>
  <input name={key} class="input" bind:value={item[key]} on:change={onChange} />
</div>

<style>
  span {
    user-select: none;
  }
</style>
