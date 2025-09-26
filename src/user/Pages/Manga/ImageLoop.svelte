<script>
  export let pos = { x: 0, y: 0 };
  export let img = "";
</script>

<div style={`top: ${pos.y}; left: ${pos.x}`}>
  <img src={img} alt="2x loop" />
</div>

<style>
  div {
    position: absolute;
  }
</style>
