<script>
  export let type = "text";
  export let label;
  export let icon;
  export let value;
  export let name;
  export let placeholder;
  export let error;
  export let mr = 0;
  export let ml = 0;
  export let mt = 0;
  export let mb = 0;
  export let mx = 0;
  export let my = 0;
  export let width;

  let style = `margin: ${mt || my} ${mr || mx} ${mb || my} ${ml || mx}`;

  function typeAction(node) {
    node.type = type;
  }
</script>

<div class="input-control" {style}>
  <span style={`width: ${width};`}>
    {#if icon}
      <i class={icon} />
    {:else}
      {name || label}
    {/if}
  </span>
  <input use:typeAction {name} bind:value {placeholder} />
  {#if error && error[name]}
    <div class="error">{error[name]}</div>
  {/if}
</div>

<style>
  .input-control {
    position: relative;
    display: flex;
    align-items: stretch;
  }
  .error {
    padding: 8px 0;
    color: firebrick;
    font-weight: 600;
  }

  span,
  input {
    padding: 0.3rem 0.5rem;
    border-radius: 0.25rem;
    color: #495057;
  }

  span {
    text-align: center;
    white-space: nowrap;
    font-size: 1.5rem;
    background-color: #e9ecef;
    border: 1px solid #ced4da;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  input {
    display: block;
    width: 100%;
    font-size: 1rem;
    line-height: 1.5;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  input:focus {
    color: #495057;
    background-color: #fff;
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 25%);
  }
</style>
