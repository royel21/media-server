<script>
  import keys from "./keys";
  export let item;

  const handleKey = (e) => {
    e.stopPropagation();
    e.preventDefault();
    item.Key = e.keyCode === 46 ? 0 : e.keyCode;
  };
</script>

<div class="input-control">
  <span>{item.Name}</span>
  <label>
    <input type="checkbox" name="ctrlKey" bind:checked={item.CtrlKey} />
    Ctrl <i class={`fa-solid fa-${item.CtrlKey ? "check" : "x"}`}></i>
  </label>
  <label id="alt">
    <input type="checkbox" name="altKey" bind:checked={item.AltKey} />
    Alt <i class={`fa-solid fa-${item.altKey ? "check" : "x"}`}></i>
  </label>
  <label id="shift">
    <input type="checkbox" name="shiftKey" bind:checked={item.ShiftKey} />
    Shift <i class={`fa-solid fa-${item.ShiftKey ? "check" : "x"}`}></i>
  </label>
  <input type="text" name="key" value={keys[item.Key]} on:keydown={handleKey} on:change={handleKey} />
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
    width: 130px;
    font-size: 0.95rem;
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
