<script>
  import Icons from "../../../icons/Icons.svelte";
  import { ConfigStore, updateConfig } from "../../Stores/PageConfigStore";
  export let label;
  export let toggleConfig;
  export let showConfig;

  const items = [
    { value: "nu", label: "\u2B07 Name" },
    { value: "nd", label: "\u2B06 Name" },
    { value: "dd", label: "\u2B06 Date" },
    { value: "du", label: "\u2B07 Date" },
  ];

  const Config = { ...$ConfigStore };

  const onShowConfig = () => {
    toggleConfig(showConfig);
  };

  const save = () => {
    updateConfig(Config);
  };
</script>

<span class="config-list" on:click={onShowConfig}
  ><Icons name="cog" />
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
      <span on:click={save}><Icons name="save" /></span>
    </div>
  {/if}
</span>

<style>
  .config-list {
    position: relative;
    display: inline-block;
    width: 39px;
    height: 34px;
    cursor: pointer;
  }

  .config-list :global(.icon-cog) {
    width: 38px;
    height: 30px;
    top: 2px;
    right: -4px;
  }

  .config-items :global(.icon-save) {
    width: 30px;
    margin-left: 8px;
  }

  .config-items {
    position: absolute;
    display: flex;
    justify-content: space-around;
    top: 39px;
    right: 5px;
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
    right: 9px;
    width: 10px;
    height: 10px;
    transform: rotate(45deg);
    background-color: #4a6083;
  }

  .sortby {
    display: flex;
    margin-right: 15px;
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
    top: 5px;
    height: 24px;
  }
  select option {
    background-color: black;
    color: white;
  }
  input {
    top: -2px;
    width: 51px;
    height: 22px;
    text-align: center;
  }
</style>
