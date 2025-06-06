<script>
  import { map } from "../Utils";

  export let item = {};
  export let key = "";
  export let label = "";
  export let onChange = (e) => {};

  let time = ["00", "00", "00"];

  const handler = ({ target: { name, value } }) => {
    value = map(value, 0, 60).toString();
    time[+name] = value.padStart(2, "0");
    item[key] = time.join(":");
    onChange(item[key]);
  };
</script>

<div class={"input-control " + key}>
  <span class="input-label">{label || key}</span>
  <span>
    <input name={0} type="number" class="input" min="0" max="60" bind:value={time[0]} on:change={handler} />
  </span>
  <span>
    <input name={1} type="number" class="input" min="0" max="60" bind:value={time[1]} on:change={handler} />
  </span>
  <span>
    <input name={2} type="number" class="input" min="0" max="60" bind:value={time[2]} on:change={handler} />
  </span>
</div>

<style>
  .input-control {
    position: relative;
  }
  span {
    user-select: none;
    width: 100%;
  }
  .clear {
    display: none;
    position: absolute;
    right: 0;
    font-size: 14px;
  }
  .input-control input {
    height: 30px;
    padding: 0.2rem 0.2rem 0.2rem 0.2rem;
    border-radius: 0;
    text-align: center;
  }

  .input-control span:last-child .input {
    border-radius: 0 0.25rem 0.25rem 0;
  }
</style>
