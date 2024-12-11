<script>
  export let href = "";
</script>

<a {href} on:click|preventDefault on:focus on:blur><slot /></a>
