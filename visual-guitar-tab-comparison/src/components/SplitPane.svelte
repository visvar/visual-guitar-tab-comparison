<script>
  import { onMount, afterUpdate } from 'svelte';
  export let minWidth = 30;
  export let splitterWidth = 6;
  let mousePos;
  let delta = 0;
  let isMouseDown = false;
  let containerW;
  let initialL;
  let leftW;
  let rightW;
  const initialLeft = 0.35;
  const initialRight = 0.65;

  let clientHeight = 0;

  onMount(() => {
    leftW = (containerW * initialLeft - splitterWidth) / 2;
    rightW = (containerW * initialRight - splitterWidth) / 2;
  });

  afterUpdate(() => {
    let pastClientHeight = clientHeight;
    const trackContainer = document.querySelector('.track-container');
    clientHeight = trackContainer.clientHeight;
    if (clientHeight != pastClientHeight) {
      setTimeout(() => {
        const splitter = document.getElementById('splitter');
        if (splitter) {
          splitter.style.setProperty('--min-height', `${clientHeight}px`);
        }
      }, 1000);
    }
  });

  const handleMouseMove = (e) => {
    if (isMouseDown) {
      delta = mousePos - e.clientX;
      leftW =
        initialL - delta <= minWidth
          ? minWidth
          : initialL - delta >= containerW - splitterWidth - minWidth
          ? containerW - splitterWidth - minWidth
          : initialL - delta;

      rightW = containerW - leftW - splitterWidth;
    }
  };

  const handleMouseDown = (e) => {
    mousePos = e.clientX;
    initialL = leftW;
    isMouseDown = true;
  };

  const handleMouseUp = () => {
    isMouseDown = false;
  };

  $: if (
    leftW &&
    rightW & containerW &&
    leftW + rightW !== containerW - splitterWidth
  ) {
    const leftRatio = leftW / (leftW + rightW - splitterWidth / 2);
    leftW = containerW * leftRatio - splitterWidth / 2;
    rightW = containerW - leftW - splitterWidth / 2;
  }
</script>

<svelte:window on:mousemove="{handleMouseMove}" on:mouseup="{handleMouseUp}" />
<section
  bind:clientWidth="{containerW}"
  class="{isMouseDown ? 'disable-select' : ''}"
>
  <div style="width:{leftW}px" id="left">
    <slot name="left" />
    {#if isMouseDown}
      <div class="window-hook"></div>
    {/if}
  </div>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    on:mousedown="{handleMouseDown}"
    id="splitter"
    style="width:{splitterWidth}px"
  ></div>
  <div style="width:{rightW}px" id="right">
    <slot name="right" />
    {#if isMouseDown}
      <div class="window-hook"></div>
    {/if}
  </div>
</section>

<style>
  section {
    height: 100vh;
    width: 100%;
    display: flex;
  }

  #left {
    height: 100%;
  }

  #right {
    height: 100%;
  }

  #splitter {
    min-height: var(--min-height, 0);
    background-color: gray;
    cursor: col-resize;
  }

  div.window-hook {
    height: 100%;
    width: 100%;
    z-index: 5000;
    position: absolute;
    top: 0;
    left: 0;
  }

  .disable-select,
  .disable-select * {
    user-select: none;
    cursor: col-resize;
  }
</style>
