<script>
  import keys from "./keys";
  export let item;

  const options = [
    { Id: 1, Name: "Global" },
    { Id: 2, Name: "Manga" },
    { Id: 3, Name: "Video" },
  ];

  const onType = ({ target: { value } }) => (item.Type = +value);

  const handleKey = (e) => {
    e.stopPropagation();
    e.preventDefault();
    item.Key = e.keyCode === 46 ? 0 : e.keyCode;
  };
</script>

<div class="input-control2">
  <span>{item.Name}</span>
  <span id="type" for="ucfg-type">Type:</span>
  <select id="ucfg-type" value={item.Type} on:change={onType}>
    {#each options as op}
      <option value={op.Id}>{op.Name}</option>
    {/each}
  </select>
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
  .input-control2 {
    display: flex;
    align-items: center;
    padding: 4px 5px;
    width: max-content;
  }

  .input-control2:not(:last-child) {
    border-bottom: 1px solid;
  }

  .input-control2 label {
    display: flex;
    width: 50px;
    cursor: pointer;
  }

  .input-control2 label:active i {
    transform: scale(1.2);
  }

  .input-control2 span:not(#type) {
    display: inline-block;
    min-width: 125px;
    font-size: 0.95rem;
    user-select: none;
  }
  input[type="text"] {
    border-radius: 0.25rem;
    padding: 0.15rem 0.35rem;
    width: 95px;
  }
  select {
    margin: 0 5px;
    padding: 0.15rem 0.1rem;
  }
  #alt {
    width: 45px;
  }
  #shift {
    width: 60px;
  }
</style>
