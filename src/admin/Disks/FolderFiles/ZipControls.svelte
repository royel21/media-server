<script>
  import Icons from "src/icons/Icons.svelte";
  import Confirm from "src/admin/Component/Confirm.svelte";

  import { onMount } from "svelte";
  import DelImagesModal from "./DelImagesModal.svelte";
  import CropImagesModal from "./CropImagesModal.svelte";

  export let socket;
  export let selectedList;
  export let bgWorking;

  let showConfirm = false;
  let showDelImageModal = false;
  let showCropModal = false;

  let menuCheck;

  let show = false;

  const fileUnZip = () => {
    bgWorking = true;
    socket.emit("bg-work", { action: "unZip", data: { files: selectedList } });
  };

  const onExtraZip = () => {
    showConfirm = {
      acept: fileUnZip,
      text: "Extra Zip",
    };
  };

  const confirmCombined = () => {
    bgWorking = true;
    socket.emit("bg-work", { action: "combinedZip", data: { files: selectedList } });
  };

  const aceptRemoveImage = (data) => {
    bgWorking = true;
    socket.emit("bg-work", { action: "delImageZip", data });
  };
  const aceptCropImage = (data) => {
    bgWorking = true;
    socket.emit("bg-work", { action: "cropImageInZip", data });
  };

  const onCombined = () => {
    showConfirm = {
      acept: confirmCombined,
      text: "Combined Zip",
    };
  };

  const onHideMenu = ({ target }) => {
    if (menuCheck && target !== menuCheck) {
      menuCheck.checked = false;
    }
  };

  const onShowDelImages = () => (showDelImageModal = !showDelImageModal);
  const onShowCropImages = () => (showCropModal = !showCropModal);

  onMount(() => {
    document.body.addEventListener("click", onHideMenu);

    return () => {
      document.body.removeEventListener("click", onHideMenu);
    };
  });

  $: show = selectedList.filter((f) => !/\.zip$/i.test(f.Name)).length === 0;
</script>

{#if showConfirm}
  <Confirm
    text={`${showConfirm.text} ${selectedList.length} Selected ${selectedList.length === 1 ? "File" : "Files"}`}
    acept={showConfirm.acept}
    cancel={() => (showConfirm = false)}
    data={showConfirm.data}
  />
{/if}

{#if showDelImageModal}
  <DelImagesModal hide={onShowDelImages} acept={aceptRemoveImage} files={selectedList} />
{/if}

{#if showCropModal}
  <CropImagesModal files={selectedList} hide={onShowCropImages} acept={aceptCropImage} />
{/if}

{#if show}
  <label for="check-menu">
    <Icons name="zip" box="0 0 384 512" color="darkgray" />
    <input type="checkbox" id="check-menu" bind:this={menuCheck} />
    <div class="v-menu">
      <div id="film2" on:click={onExtraZip}>Extract Zip</div>
      <div id="video-fix" on:click={onCombined}>Combined Zip</div>
      <div id="video-fix" on:click={onShowDelImages}>Del Image From Zip</div>
      <div id="video-fix" on:click={onShowCropImages}>Crop Image From Zip</div>
    </div>
  </label>
{/if}

<style>
  label {
    position: relative;
  }
  .v-menu {
    display: none;
    position: absolute;
    top: 35px;
    background-color: rgb(58, 58, 58);
    min-width: max-content;
    z-index: 99;
    text-align: left;
    border-radius: 0.3rem;
    overflow: hidden;
  }
  .v-menu:after {
    position: absolute;
    top: -10px;
    left: -50px;
    width: 10;
    height: 10;
    transform: rotate(90deg);
    z-index: 100;
  }
  .v-menu div {
    padding: 4px 8px;
  }
  .v-menu div:hover {
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.5);
  }
  input {
    display: none;
  }
  input:checked + .v-menu {
    display: flex;
    flex-direction: column;
  }
  #film2 :global(.icon-film2) {
    width: 21px;
    top: 5px;
    left: -4px;
  }
  #video-fix {
    position: relative;
  }
  #video-fix :global(.icon-videofix) {
    width: 30px;
    height: 25px;
    top: 0px;
    left: -8px;
  }

  #video-fix :global(.icon-wrench) {
    position: absolute;
    width: 16px;
    left: 1px;
  }
  #film2 {
    position: relative;
  }
  #film2 :global(.icon-videofix) {
    width: 30px;
    height: 25px;
    top: 0px;
    left: -8px;
  }

  #film2 :global(.icon-wrench) {
    position: absolute;
    width: 16px;
    left: 1px;
  }
</style>
