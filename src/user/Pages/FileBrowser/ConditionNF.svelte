<script>
  export let data;
  export let split;
</script>

{#if data}
  {#each data.split(split) as d}
    <span class="g-item" on:click|preventDefault on:keydown> {d}</span>
  {/each}
{:else}
  <span>N/F</span>
{/if}

<style>
  .g-item:hover {
    cursor: pointer;
    text-decoration: underline;
  }
</style>
