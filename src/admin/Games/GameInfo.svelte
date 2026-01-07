<script>
  export let game = {};

  $: info = game?.Info || {};
</script>

<div id="folder-data" class="file-list col-6">
  <div class="info-item info-name">
    <span>Name</span>
    <textarea class="form-control" name="Name" bind:value={game.Name}></textarea>
  </div>
  <div>
    <span>Codes</span>
    <textarea class="form-control" name="Codes" bind:value={info.Codes}></textarea>
  </div>
  <div>
    <span>Company</span>
    <textarea class="form-control" name="Company" bind:value={info.Company}></textarea>
  </div>
  <div class="info-item info-altname">
    <span>Alt Name</span>
    <textarea class="form-control" name="AltName" bind:value={info.AltName}></textarea>
  </div>
  <div class="info-item">
    <span>Description</span>
    <textarea class="form-control" name="Description" bind:value={info.Description}></textarea>
  </div>
  <div class="info-item">
    <span>Path</span>
    <textarea class="form-control" name="Description" bind:value={game.Path}></textarea>
  </div>
  <div class="info-controls">
    <button class="btn">Save Info</button>
  </div>
</div>

<style>
  #folder-data {
    flex-grow: 1;
    position: relative;
    border-left: 1px solid;
    width: 50%;
    height: 100%;
    min-width: 400px;
    padding: 0 5px;
  }

  #folder-data {
    display: flex;
    flex-direction: column;
  }
  .info-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    flex-grow: 1;
  }
  .info-controls,
  .info-item textarea {
    flex-grow: 1;
    resize: none;
    padding: 0.25rem;
    font-size: 12px;
  }
  #folder-data .form-control {
    font-size: 12px;
    font-weight: 600;
    font-family: "verdana", sans-serif;
  }
  .info-controls {
    text-align: center;
    padding-bottom: 5px;
  }
  .info-name {
    max-height: 100px;
  }
  .info-altname {
    max-height: 150px;
  }
</style>
