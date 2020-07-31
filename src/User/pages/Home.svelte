<script>
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import axios from "axios";
  import { ProcessFile } from "../Component/Utils";
  let files = [];
  let current = 0;
  let move = {};
  let container;
  let count;

  axios.get("/api/files/recents").then(({ data }) => {
    files = data;
  });

  const scrollItems = ({ target: { classList } }) => {
    let left;
    let behavior = "smooth";
    let { scrollLeft, offsetWidth, scrollWidth } = container;
    if (classList.contains("fa-chevron-circle-left")) {
      left = scrollLeft - offsetWidth;
      if (scrollLeft === 0) {
        left = scrollWidth;
      }
    } else {
      left = scrollLeft + offsetWidth;
      if (scrollLeft === scrollWidth - offsetWidth) {
        left = 0;
      }
    }

    container.scroll({ left, behavior });
  };
  const openFolder = ({ target }) => {
    let file = files.find((f) => f.Id === target.closest(".file").id);
    localStorage.setItem("content", "/");
    navigate(`/${file.FilesType}/viewer/${file.Id}/${file.CurrentFile}`);
  };
  // afterUpdate(scrollTo);
  let tscroll;
  const onScroll = (e) => {
    if (tscroll) clearTimeout(tscroll);
    tscroll = setTimeout(() => {
      let el = document.querySelector(".file");
      current = Math.round(container.scrollLeft / el.offsetWidth + 0.05);
      container.scroll({
        left: current * el.offsetWidth,
        behavior: "smooth",
      });
    }, 100);
  };

  const resize = () => {
    if (container) {
      let tFile = document.querySelector(".file");
      if (tFile) count = container.offsetWidth / tFile.offsetWidth;
    }
  };
  onMount(() => {
    resize();
    window.onresize = resize;
    return () => {
      window.onresize = null;
    };
  });
</script>

<style>
  .content {
    padding-top: 40px;
  }
  .wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    flex-direction: row;
  }

  .carousel {
    display: flex;
    flex-direction: row;
    justify-content: left;
    width: 1400px;
    min-width: 1400px;
    height: 300px;
    overflow-x: auto;
    outline: none;
  }

  .carousel::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
  .wrapper > .fas {
    position: relative;
    top: -20px;
    font-size: 35px;
    align-self: center;
    cursor: pointer;
    transition: 0.1s all;
  }
  .fas:active {
    transform: scale(1.2);
  }
  .fa-chevron-circle-left {
    left: -5px;
  }
  .fa-chevron-circle-right {
    right: -5px;
  }
  .title {
    text-align: center;
  }
  .title span {
    display: inline-block;
    font-size: 1.75rem;
    padding: 0 10px;
    color: black;
    background-color: antiquewhite;
    border-radius: 0.25rem;
    font-family: monospace;
  }

  @media screen and (max-width: 1600px) {
    .carousel {
      width: 1200px;
      min-width: 1200px;
    }
  }
  @media screen and (max-width: 1400px) {
    .carousel {
      width: 1000px;
      min-width: 1000px;
    }
  }
  @media screen and (max-width: 1200px) {
    .carousel {
      width: 800px;
      min-width: 800px;
    }
  }
  @media screen and (max-width: 1000px) {
    .carousel {
      width: 600px;
      min-width: 600px;
    }
  }
  @media screen and (max-width: 700px) {
    .content {
      padding-top: 75px;
    }
    .carousel {
      width: 370px;
      min-width: 370px;
    }
    .wrapper > .fas {
      display: none;
    }
  }
</style>

<div class="content">
  <div class="title">
    <span>
      <i class="fas fa-folder" />
      Recents
    </span>
  </div>
  <div class="wrapper">
    <span class="fas fa-chevron-circle-left" on:click={scrollItems} />
    <div
      class="carousel"
      bind:this={container}
      on:scroll={onScroll}
      tabIndex="0">
      {#each files as { Id, Name, Type, Cover, CurrentPos, Duration, isFav, FileCount, FilesType }, i}
        <div
          class="file"
          class:current={i === current}
          id={Id}
          data-type={Type}
          data-types={FilesType}
          tabIndex="0">
          <div class="file-info">
            <div class="file-btns">
              <span class="file-btn-left" on:click|stopPropagation={openFolder}>
                <i class={'fas fa-folder'} />
              </span>
              <span class="file-progress">{FileCount}</span>
              <span class="remove">
                <i class="fas fa-trash-alt" />
              </span>
            </div>
            <div class="file-cover" on:dblclick|stopPropagation={openFolder}>
              <img src={Cover} alt="No Cover Found" />
            </div>
            <div class="file-name">{Name}</div>
          </div>
        </div>
      {/each}
    </div>
    <span class="fas fa-chevron-circle-right" on:click={scrollItems} />
  </div>
</div>
