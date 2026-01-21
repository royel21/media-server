<script>
  import GameInfo from "./GameInfo.svelte";
  import GameList from "./GameList.svelte";

  let game = {};

  const setInfo = ({ detail }) => {
    game = detail;
  };
</script>

<div class="admin-manager">
  <div class="rows">
    <GameList {setInfo} />
    <GameInfo bind:game />
  </div>
</div>

<style>
  :global(.content) {
    overflow: hidden;
  }
  .admin-manager {
    height: 100%;
    padding: 0;
  }
  .rows {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 100%;
  }
</style>
