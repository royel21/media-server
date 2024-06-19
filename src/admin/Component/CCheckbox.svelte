<script>
  export let id = "";
  export let isChecked = false;
  export let title = "";
</script>

<label {id} class="select-file" {title}>
  <input type="checkbox" on:change />
  <span class="checkmark" class:checked={isChecked}></span>
</label>

<style>
  .select-file {
    display: inline-block;
    position: relative;
    height: 20px;
    width: 20px;
    cursor: pointer;
  }
  .select-file input {
    display: none;
  }
  .select-file:hover input ~ .checkmark {
    background-color: #ccc;
  }
  .checkmark {
    position: absolute;
    top: 4px;
    height: 20px;
    width: 20px;
    background-color: #eee;
  }
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  .select-file:hover input ~ .checkmark {
    background-color: #ccc;
  }

  .checked {
    background-color: #2196f3;
  }

  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  .checked:after {
    display: block;
  }

  .select-file .checkmark:after {
    left: 6px;
    top: 2px;
    width: 8px;
    height: 12px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }
  .select-file:hover .checkmark:after {
    border: solid black;
    border-width: 0 3px 3px 0;
  }
</style>
