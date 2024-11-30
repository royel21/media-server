<script>
  import { getContext, onDestroy } from "svelte";
  import SortItem from "./SortItem.svelte";
  import apiUtils from "src/apiUtils";

  const User = getContext("User");

  const items = User.sortTabs.sort((a, b) => a.Id - b.Id);

  onDestroy(async () => {
    await apiUtils.post("users/update-sorttabs", { sorttab: items });
  });
</script>

<div class="sort-config">
  {#each items as item}
    <SortItem bind:item />
  {/each}
</div>

<style>
  .sort-config {
    margin: 0 auto;
    max-width: 400px;
  }
</style>
