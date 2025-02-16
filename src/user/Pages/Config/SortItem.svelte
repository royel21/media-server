<script>
  export let item;
</script>

<div class="sort-item">
  <span>{item.Name}</span>
  <div class="input-control sb">
    <label for="">Sort By</label>
    <select bind:value={item.SortBy}>
      <option value="na">N/A</option>
      <option value="nu">&darr; Name</option>
      <option value="nd">&uarr; Name</option>
      <option value="du">&darr; Date</option>
      <option value="dd">&uarr; Date</option>
    </select>
  </div>
  <div class="input-control s-items">
    <label for="">Items</label>
    <input bind:value={item.Items} type="number" min="0" max="1000" />
  </div>
</div>

<style>
  .sort-item {
    display: flex;
    align-items: center;
    padding: 4px 5px;
  }

  .sort-item > *:not(:last-child) {
    padding-right: 5px;
  }
  .sort-item .input-control {
    margin-bottom: 0;
  }

  span {
    font-weight: 700;
    font-size: 1.1rem;
    height: 38px;
    min-width: 80px;
  }

  label {
    width: 125px;
    padding: 0 5px;
    color: black;
    font-weight: 600;
    background-color: #e9ecef;
    border: 1px solid #ced4da;
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
    user-select: none;
  }

  select,
  input {
    display: block;
    width: 100%;
    font-size: 1rem;
    line-height: 1.5;
    color: #495057;
    padding: 0.3rem;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
  .sb {
    min-width: 180px;
  }

  .s-items label {
    width: 50px;
  }

  input:focus {
    outline: 0;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 25%);
  }
</style>
