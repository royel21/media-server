<script>
  import CCheckbox from "src/ShareComponent/Checkbox.svelte";
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import Input from "src/ShareComponent/Input.svelte";
  export let hide;
  export let playerConfig;

  const save = () => {
    localStorage.setObject("playerConfig", playerConfig);
    hide();
  };
</script>

<Dialog id="player-config" btnOk="Save" confirm={save} cancel={hide}>
  <div slot="modal-header">
    <h2>Player Config</h2>
  </div>
  <div slot="modal-body">
    <Input label="Seek Rate" bind:value={playerConfig.seekRate} type="number" />
    <CCheckbox label="Auto Play List" item={playerConfig} key="autoPlayList" />
  </div>
</Dialog>

<style>
  :global(#player-config) {
    min-width: 300px;
  }
  :global(#player-config .input-label) {
    min-width: 115px;
    text-align: right;
    padding-right: 5px;
  }

  @media screen and (min-width: 700px) {
    :global(.modal-container) {
      position: initial;
      width: initial;
      height: initial;
      min-height: initial;
    }
    :global(#player-config) {
      position: absolute;
      right: 0;
      bottom: 41px;
    }
    :global(#player-config::after) {
      content: "";
      position: absolute;
      bottom: -10px;
      right: 8px;
      width: 0;
      height: 0;
      transform: rotate(180deg);
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-bottom: 10px solid white;
    }
  }
</style>
