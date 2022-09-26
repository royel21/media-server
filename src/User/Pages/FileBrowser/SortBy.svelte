<script>
  import { PageConfig, updateConfig } from "../../Stores/PageConfigStore";
  export let label;
  export let toggleConfig;
  export let showConfig;

  const items = [
    { value: "nu", label: "\u2B07 Name" },
    { value: "nd", label: "\u2B06 Name" },
    { value: "dd", label: "\u2B06 Date" },
    { value: "du", label: "\u2B07 Date" },
  ];

  const Config = { ...$PageConfig };

  const onShowConfig = () => {
    toggleConfig(showConfig);
  };

  const save = () => {
    updateConfig(Config);
  };
</script>

<span class="config-list fas fa-cog" on:click={onShowConfig} />
{#if showConfig}
  <div class="config-items">
    <div class="sortby">
      <label for="orderby">{label}</label>
      <select id="orderby" name="select-sort" class="fa" bind:value={Config.Content.sort}>
        {#each items as { value, label }}
          <option {value}>{label}</option>
        {/each}
      </select>
    </div>
    <div>
      <label for="items">Items: </label>
      <input id="items" name="items" type="number" bind:value={Config.Content.items} min="0" max="500" />
    </div>
    <span class="fas fa-save" on:click={save} />
  </div>
{/if}

<style>
  .config-list {
    line-height: 1.15;
    margin-left: 5px;
    font-size: 22px;
    cursor: pointer;
  }
  .fa-save {
    cursor: pointer;
  }

  .fa-save:active,
  .config-list:active {
    transform: scale(1.1);
  }

  .config-items {
    position: absolute;
    display: flex;
    justify-content: space-around;
    top: 30px;
    z-index: 9;
    background-color: #4a6083;
    padding: 0 5px;
    border-radius: 0.25rem;
    width: max-content;
    font-size: 20px;
  }
  .config-items::after {
    content: " ";
    position: absolute;
    top: -4px;
    left: calc(50% - -32px);
    width: 10px;
    height: 10px;
    transform: rotate(45deg);
    background-color: #4a6083;
  }

  .sortby {
    display: flex;
    margin-right: 15px;
  }

  .fa-save {
    font-size: 30px;
    margin-left: 10px;
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
    top: 6px;
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
