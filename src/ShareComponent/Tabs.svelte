<script>
  import { onMount, getContext } from "svelte";
  import Icons from "src/icons/Icons.svelte";
  import { isValidKey } from "./utils";
  export let tab;
  export let tabs;

  let clazz = "";
  export { clazz as class };

  let component = tabs[0].component;

  $: component = (tabs.find((t) => t.id === tab) || tabs[0]).component;

  const hotkeys = getContext("User").hotkeys;
  const prevTab = hotkeys.find((h) => h.Name === "Prev Tab");
  const nextTab = hotkeys.find((h) => h.Name === "Next Tab");

  const onkeydown = (e) => {
    const found = document.querySelector(`.disk-controls .checked`);
    if (found && [nextTab.Key, prevTab.Key].includes(e.keyCode)) {
      let item;
      if (isValidKey(e, { ...prevTab, AltKey: true })) {
        item = found.previousElementSibling;
      }

      if (isValidKey(e, { ...nextTab, AltKey: true })) {
        item = found.nextElementSibling;
      }

      if (item) {
        item.querySelector("label")?.click();
      }
      e.preventDefault();
      e.stopPropagation();
    }
  };
  onMount(() => {
    document.addEventListener("keydown", onkeydown);

    return () => {
      document.removeEventListener("keydown", onkeydown);
    };
  });
</script>

<div class={`card bg-dark text-light tabs ${clazz}`}>
  <div class="disk-controls">
    <div class="usn nav nav-tabs">
      {#each tabs as t, i}
        <div class="nav-item" class:checked={tab === t.id}>
          <input type="radio" bind:group={tab} value={t.id} id={t.id + i} />
          <label class="nav-link" for={t.id + i}>
            <Icons name={t.icon} />
            <span id="cogs">{t.name}</span>
          </label>
        </div>
      {/each}
    </div>
  </div>
  <div id="tabs-content">
    <svelte:component this={component} />
  </div>
</div>

<style>
  #tabs-content {
    height: calc(100% - 50px);
  }
  .tabs {
    position: relative;
    height: 100%;
    padding: 10px 0 0;
  }
  .tabs .disk-controls {
    border-bottom: 1px solid;
  }
  .tabs label span {
    display: none;
  }
  .tabs input:checked label span {
    display: inline-block;
  }

  .tabs .disk-controls :global(svg) {
    top: 0px;
    width: 32px;
    height: 24px;
  }

  .tabs .nav-link {
    padding: 5px 10px;
  }

  .tabs input[type="radio"] {
    display: none;
  }
  .tabs .usn.nav label {
    display: inline-block;
    margin: 0;
    cursor: pointer;
    color: white;
  }
  .tabs .nav-link span {
    position: relative;
    top: -4px;
    font-size: 14px;
  }
  .tabs .nav input[type="radio"]:not(:checked) label:hover {
    background-color: #007bff27;
  }
  .tabs .nav input[type="radio"]:checked + label:hover,
  .tabs .nav input[type="radio"]:checked + label {
    position: relative;
    font-weight: 600;
    border: 1px solid;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    border-bottom: transparent;
  }
  .tabs .nav input[type="radio"]:checked + label:after {
    position: absolute;
    content: " ";
    bottom: -1px;
    left: 0;
    height: 1px;
    width: 100%;
    background-color: #343a40 !important;
  }
  .tabs input[type="radio"]:checked + label span {
    display: inline-block;
  }
</style>
