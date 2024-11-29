<script>
  import keys from "./keys";
  export let item;
  export let key;
  export let onChange;

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

<div class="input-control">
  <span>{item.name || key}</span>
  <label>
    <input type="checkbox" name="ctrlKey" checked={item.ctrlKey} on:change={handler} />
    Ctrl <i class={`fa-solid fa-${item.ctrlKey ? "check" : "x"}`}></i>
  </label>
  <label id="alt">
    <input type="checkbox" name="altKey" checked={item.altKey} on:change={handler} />
    Alt <i class={`fa-solid fa-${item.altKey ? "check" : "x"}`}></i>
  </label>
  <label id="shift">
    <input type="checkbox" name="shiftKey" checked={item.shiftKey} on:change={handler} />
    Shift <i class={`fa-solid fa-${item.shiftKey ? "check" : "x"}`}></i>
  </label>
  <input type="text" name="key" value={keys[item.key]} on:keydown={handleKey} on:change={handleKey} />
</div>

<style>
  .input-control {
    display: flex;
    align-items: center;
    padding: 4px 5px;
  }

  .input-control:not(:last-child) {
    border-bottom: 1px solid;
  }

  .input-control label {
    width: 50px;
    cursor: pointer;
  }

  .input-control label:active i {
    transform: scale(1.2);
  }

  .input-control span {
    width: 150px;
  }

  .input-control input[type="text"] {
    border-radius: 0.25rem;
    padding: 0.15rem 0.35rem;
    width: 95px;
  }
  #alt {
    width: 45px;
  }
  #shift {
    width: 60px;
  }
</style>
