<script>
  export let file;
  export let key;
  export let label;
  export let style;
</script>

<div class="input-body" {style}>
  <div for="Name" class="input-text">{label || key}</div>
  <textarea name="Name" class="input-control" rows="3" bind:value={file[key]} />
</div>

<style>
  .input-body {
    position: relative;
    display: flex;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    -ms-flex-align: stretch;
    align-items: stretch;
  }
  .input-text {
    display: inline-block;
    width: 100%;
    color: #495057;
    text-align: center;
    white-space: nowrap;
    background-color: #e9ecef;
    border: 1px solid #ced4da;
    border-top-right-radius: 0.25rem;
    border-top-left-radius: 0.25rem;
  }
  .input-control {
    width: 100%;
    padding: 0.3rem;
    font-size: 0.7rem;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    border-bottom-right-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
    outline: none;
  }
  .input-control:focus {
    color: #495057;
    background-color: #fff;
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 25%);
  }
  .input-control::-webkit-scrollbar {
    width: 10px;
  }
</style>
