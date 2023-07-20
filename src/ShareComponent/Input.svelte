<script>
  export let type = "text";
  export let value;
  export let name;
  export let label;
  export let placeholder;
  export let width;

  function typeAction(node) {
    node.type = type;
  }
</script>

<div class="input-control">
  <span style={`width: ${width};`}>
    {#if label}
      {label || name}
    {:else}
      <slot name="label" />
    {/if}
  </span>
  <input use:typeAction {name} bind:value {placeholder} autocomplete={type === "password" ? "current-password" : ""} />
</div>

<style>
  .input-control {
    display: flex;
  }
  span {
    background-color: #e9ecef;
    border: 1px solid #ced4da;
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
  }

  input {
    display: block;
    width: 100%;
    font-size: 1rem;
    line-height: 1.5;
    color: #495057;
    padding: 0.3rem 0.5rem;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }

  input:focus {
    outline: 0;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 25%);
  }
</style>
