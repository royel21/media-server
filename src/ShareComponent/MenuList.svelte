<script>
  export let items;
  export let title;
  export let itemClass;
</script>

<label for={title}>
  <i class={"fas fa-" + itemClass} />
  {title}
  <ul class="down-list">
    {#each items as item}
      <li class="list-item" id="{item.Id}}">{item.Name}</li>
    {/each}
  </ul>
</label>

<style>
  label {
    cursor: pointer;
    position: relative;
  }
  ul {
    display: none;
    position: absolute;
    top: 33px;
    left: -5px;
    width: 112.5%;
    text-align: left;
    background-color: #317ac4;
    border-radius: 0 0 0.25rem 0.25rem;
  }
  label:hover ul {
    display: initial;
  }
  ul:hover {
    display: initial;
  }
  li {
    padding: 0 8px;
    font-size: 16px;
  }

  li:not(:last-child) {
    border-bottom: 1px solid;
  }
  li:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
</style>
