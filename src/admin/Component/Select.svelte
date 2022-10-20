<script>
  export let label;
  export let item;
  export let key;
  export let options = [];
  export let labelWidth = 100;
  export let mb = 0;
  export let mt = 0;
  export let ml = 0;
  export let mr = 0;
  export let mx = 0;
  export let my = 0;

  let style = `margin: ${mt || my} ${mr || mx} ${mb || my} ${ml || mx};`;
</script>

<div class="check-control" {style}>
  <span class="check-label">{label || key}</span>
  <select bind:value={item[key]} class="select-control" style="width: ${labelWidth};">
    {#each options as { Id, Name }}
      <option value={Id}>{Name}</option>
    {/each}
  </select>
</div>

<style>
  .check-control {
    display: flex;
    flex-direction: row;
  }
  .check-control > * {
    display: inline-block;
    height: 30px;
  }
  .check-label {
    width: 100px;
    color: #495057;
    background-color: #e9ecef;
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
    text-align: center;
    line-height: 1.8;
  }
  .select-control {
    text-align: left;
    flex-grow: 1;
    margin: 0;
    font-size: 18px;
    cursor: pointer;
    color: black;
    background-color: white;
    border: 1px solid #ced4da;
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    outline: none;
  }
</style>
