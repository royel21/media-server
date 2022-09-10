<script>
  import { PageConfig, updateConfig } from "../../Stores/PageConfigStore";
  export let label;
  export let items = [];

  const Config = { ...$PageConfig };
  const applyChanges = () => {
    updateConfig(Config);
    console.log(Config);
  };
</script>

<div class="sortby">
  <label for="orderby">{label}</label>
  <select id="orderby" name="select-sort" class="fa" on:change={applyChanges} bind:value={Config.Content.sort}>
    {#each items as { value, label }}
      <option {value}>{label}</option>
    {/each}
  </select>
</div>
<div>
  <label for="items">Items: </label>
  <input id="items" name="items" type="text" on:change={applyChanges} bind:value={Config.Content.items} />
</div>

<style>
  .sortby {
    display: flex;
    width: 155x;
    padding: 0 10px;
  }
  label {
    height: 30px;
    margin-right: 5px;
  }
  select,
  input {
    position: relative;
    color: white;
    border: none;
    border-bottom: 1px solid;
    background: #14243d;
    outline: none;
  }
  select {
    top: 1px;
    height: 24px;
  }
  select option {
    background-color: black;
    color: white;
  }
  input {
    top: -1px;
    width: 51px;
    height: 22px;
    text-align: center;
  }
  @media screen and (max-width: 600px) {
    input {
      top: 1px;
    }
  }
</style>
