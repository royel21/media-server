<script>
  import Dialog from "src/ShareComponent/Dialog.svelte";
  import TimeInput from "src/admin/Component/TimeInput.svelte";

  export let socket;
  export let bgWorking;
  export let selectedList = [];
  export let showVideoSubTract;

  let item = {
    Start: "00:00:00",
    End: "00:00:00",
  };

  const hide = () => (showVideoSubTract = false);

  const extractSubVideo = (options) => {
    socket.emit("bg-work", { action: "extractSubVideo", data: { files: selectedList, ...options } });
    showVideoSubTract = false;
    bgWorking = true;
  };

  let errors = [];

  const onConfirm = () => {
    errors = [];
    const formatValitator = /^[0-9]{2,2}\:[0-9]{2,2}\:[0-9]{2,2}$/g;
    if (item.Start === item.End) {
      return (errors = [`Start and End should no be equal`]);
    }

    if (!formatValitator.test(item.Start)) {
      errors = [`Start: ${item.Start} Format not valid`];
      return;
    }

    if (!formatValitator.test(item.End)) {
      errors = [`End: ${item.End} Format not valid`];
      return;
    }

    if (item.End !== "00:00:00") {
      const startParts = item.Start.split(":");
      const endParts = item.End.split(":");
      if (+endParts[2] <= +startParts[2] && +endParts[1] <= +startParts[1] && +endParts[0] <= +startParts[0]) {
        errors = [`End Time must be higher than Time Start`];
        return;
      }
    }

    return extractSubVideo(item);
  };
</script>

<div id="v-subtract">
  <Dialog cancel={hide} confirm={onConfirm} {errors} canDrag={true}>
    <h4 slot="modal-header">Extract Sub Video Options</h4>
    <div class="content" slot="modal-body">
      <TimeInput key="Start" {item} />
      <TimeInput key="End" {item} />
    </div>
  </Dialog>
</div>

<style>
  #v-subtract :global(.modal-container .modal) {
    min-width: 320px;
    max-width: 320px;
  }
  #v-subtract :global(.input-label:not(#t-label)) {
    min-width: 80px;
    max-width: 80px;
    text-align: right;
    padding-right: 5px;
  }

  #v-subtract :global(.modal-footer .btn:first-child) {
    margin-right: 10px;
  }
  .content {
    padding: 0 25px;
  }

  @media screen and (max-width: 600px) {
    #v-subtract :global(.modal-container .modal) {
      min-width: initial;
    }
  }
</style>
