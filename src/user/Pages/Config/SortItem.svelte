<script>
  import Input from "src/ShareComponent/Input.svelte";

  export let item;

  const handler = ({ target: { name, checked } }) => {
    item[name] = checked;
    onChange(key, { ...item });
  };

  const handleKey = (e) => {
    e.stopPropagation();
    e.preventDefault();
    item.key = e.keyCode === 46 ? 0 : e.keyCode;
    onChange(key, item);
  };
</script>

<div class="sort-item">
  <span>{item.name}</span>
  <div class="input-control" id="sb">
    <label for="">Sort By</label>
    <select bind:value={item.SortBy}>
      <option value="nu">&darr; Name</option>
      <option value="nd">&uarr; Name</option>
      <option value="du">&darr; Date</option>
      <option value="dd">&uarr; Date</option>
    </select>
  </div>
  <div class="input-control">
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

  span {
    font-weight: 700;
    font-size: 1.2rem;
    height: 30px;
    height: 38px;
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
  #sb {
    min-width: 180px;
  }
  input:focus {
    outline: 0;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 25%);
  }
</style>
