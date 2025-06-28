<script>
  import { onMount } from "svelte";
  export let cover;
  let src = "";
  let ref;
  let observer;

  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.intersectionRatio > 0 || entry.isIntersecting) {
          src = cover?.replaceAll("#", "%23");
        }
      },
      {
        root: document.querySelector(".scroll-container"),
        threshold: 0.01,
        rootMargin: "450px 0px 450px 0px",
      }
    );
  });

  $: if (cover !== src) {
    observer?.disconnect();
    observer?.observe(ref);
  }
</script>

<img {src} alt="No Cover Found" bind:this={ref} />

<style>
  img {
    max-height: 100%;
    min-width: 100%;
    font-size: 16px;
    height: initial;
  }
</style>
