<script>
  import SortItem from "./SortItem.svelte";

  const items = [
    {
      name: "Home",
      SortBy: "nu",
      Items: 0,
    },
  ];
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
