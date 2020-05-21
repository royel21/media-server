<script>
  import { onMount, afterUpdate } from "svelte";
  import { ToggleMenu } from "../../ShareComponent/ToggleMenu";
  import { formatTime } from "./Utils";
  export let files = [];
  export let fileId;

  let observer;
  let playList;
  let hideList = true;
  const setObserver = () => {
    if (observer) {
      observer.disconnect();
    }
    if (playList) {
      let imgs = document.querySelectorAll("#play-list li img");
      observer = new IntersectionObserver(
        (entries) => {
          for (let entry of entries) {
            let img = entry.target;
            if (entry.isIntersecting) {
              img.src = img.dataset.src;
            } else {
              img.src = "";
            }
          }
        },
        {
          root: playList,
          rootMargin: "1000px",
          threshold: 0,
        }
      );

      imgs.forEach((lazyImg) => {
        observer.observe(lazyImg);
      });
    }
  };
  // afterUpdate(() => {});
  $: if (!hideList) {
    if (playList) {
      let current = document.querySelector("#play-list .active");
      console.log(current.offsetTop, playList.offsetTop);
      playList.scroll({
        top: current.offsetTop - 250,
      });
      setObserver();
      setTimeout(() => {
        playList.scroll({
          top: current.offsetTop - 250,
        });
      }, 300);
    }
  }
</script>

<style>
  label {
    margin: 0;
  }
  .show-list {
    position: fixed;
    right: 5px;
    bottom: 40px;
    transition: 0.3s all;
    z-index: 10;
    background-color: black;
    padding: 4px 6px;
    border-radius: 0.25rem;
  }
  .show-list i {
    font-size: 20px;
  }
  .move {
    right: 230px;
  }
  input[type="checkbox"] {
    display: none;
  }

  #play-list {
    position: absolute;
    top: 0px;
    right: 0;
    bottom: 0;
    width: 220px;
    background-color: black;
    border-left: 2px solid;
    transition: 0.3s all;
    z-index: 11;
    overflow: hidden;
  }
  #play-list.move {
    top: 34px;
  }
  #p-list {
    overflow-y: auto;
    height: calc(100% - 40px);
    overflow-x: hidden;
  }

  #play-list .p-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    transition: 0.3s all;
    border-top: 1px solid;
  }

  #p-hide:checked + #play-list {
    width: 0;
    border: none;
  }

  #play-list label i {
    transition: 0.3s all;
  }

  #p-hide:checked + #play-list .p-controls .form-control {
    display: none;
  }

  #play-list .p-controls .p-sort {
    margin: 0;
    width: 32px;
    font-size: 30px;
    padding: 0 8px;
    flex-grow: 0;
  }

  #play-list .p-controls .form-control {
    display: inline-block;
    height: 30px;
    margin: 0 4px;
  }

  #play-list ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  #play-list #p-list li {
    display: flex;
    flex-direction: column;
    padding: 4px;
    border-bottom: 1px solid;
    min-height: 100px;
    cursor: pointer;
    user-select: none;
  }

  #play-list #p-list li:last-child {
    border-bottom: none;
  }

  #play-list #p-list li:hover {
    background-color: rgba(20, 101, 50, 0.5);
  }

  .active {
    background-color: darkslategrey;
  }

  #play-list .cover {
    position: relative;
    pointer-events: none;
    width: 100%;
    text-align: center;
  }

  #play-list .l-name {
    display: inline-block;
    padding-left: 5px;
    font-size: 14px;
  }

  #play-list .duration {
    position: absolute;
    display: inline-block;
    right: 0px;
    bottom: 8px;
    padding: 0 4px;
    background-color: black;
    border-radius: 0.25rem;
    font-size: 13px;
  }

  #play-list img {
    max-height: 185px;
  }

  #play-list #p-list::-webkit-scrollbar {
    width: 10px;
  }

  #play-list #v-filter {
    flex-grow: 1;
  }

  #play-list .clear-filter {
    right: 14px;
  }

  #p-items {
    display: inline-block;
    padding: 0 8px;
  }
  li * {
    pointer-events: none;
  }
  li > span:last-child {
    display: inline-block;
    height: max-content;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.625;
  }
  @media screen and (max-width: 600px) {
    #p-list::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }

    #play-list.move {
      top: 66px;
    }
  }
</style>

<label
  class={'show-list' + (!hideList ? ' move' : '')}
  for="p-hide"
  style="bottom: 35px">
  <span class="p-sort">
    <i class="fas fa-list" />
  </span>
</label>

<input type="checkbox" id="p-hide" bind:checked={hideList} />
<div id="play-list" class:move={!$ToggleMenu}>
  <div id="p-list" bind:this={playList}>
    <ul>
      {#each files as { Id, Name, Cover, CurrentPos, Duration, Type }, i}
        <li id={Id} class={Id === fileId ? 'active' : ''} on:click>
          <span class="cover">
            <img data-src={Cover} src="" alt="" />
            <span class="duration">
              {Type.includes('Manga') ? `${CurrentPos + 1}/${Duration}` : formatTime(Duration)}
            </span>
          </span>
          <span class="l-name">{Name}</span>
        </li>
      {/each}
    </ul>
  </div>
  <div class="p-controls">
    <div id="v-filter">
      <input type="text" placeholder="Filter" class="form-control" />
      <span class="clear-filter">
        <i class="fas fa-times-circle" />
      </span>
    </div>
    <span id="p-items">
      {`${files.findIndex((i) => i.Id === fileId) + 1}/${files.length}`}
    </span>
  </div>
</div>
