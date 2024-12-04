<script>
  import { getContext, onDestroy } from "svelte";
  import SortItem from "./SortItem.svelte";
  import apiUtils from "src/apiUtils";
  import UserStore from "src/user/Stores/UserStore";

  const User = getContext("User");

  const items = User.sortTabs.sort((a, b) => a.Id - b.Id);

  const save = async () => {
    UserStore.set(User);
    await apiUtils.post("users/update-sorttabs", { sorttab: items });
  };

  const saveData = (e) => {
    if (e.keyCode === 13) {
      save();
    }
  };

  onDestroy(async () => {
    await save();
  });
</script>

<div on:keydown={saveData} class="sfcg">
  <div class="sort-config">
    {#each items as item}
      <SortItem bind:item />
    {/each}
  </div>
  <div class="btn-bar">
    <button class="btn" on:click={save}>Save</button>
  </div>
</div>

<style>
  .sfcg {
    height: 99%;
  }
  .sort-config {
    margin: 0 auto;
    max-width: 400px;
    height: calc((100% - 42px));
  }
  .btn-bar {
    text-align: right;
    padding-right: 5px;
  }
</style>
