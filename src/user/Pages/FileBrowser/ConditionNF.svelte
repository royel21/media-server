<script>
  export let data;
  export let split;
</script>

{#if data}
  {#each data.split(split) as d}
    <span on:click|preventDefault on:keydown> {d}</span>
  {/each}
{:else}
  <span>N/F</span>
{/if}
