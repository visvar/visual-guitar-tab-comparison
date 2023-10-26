<script>
    import { onMount, afterUpdate } from 'svelte';
  
    export let minHeight = 30; // Minimum height for each pane
    export let splitterHeight = 6; // Height of the splitter
  
    let mousePos;
    let delta = 0;
    let isMouseDown = false;
    let containerH;
    let initialT;
    let topH;
    let bottomH;
    const initialTop = 0.35; // Initial height ratio for the top pane
    const initialBottom = 0.65; // Initial height ratio for the bottom pane
  
    let clientWidth = 0;
  
    onMount(() => {
      topH = containerH * initialTop;
      bottomH = containerH * initialBottom;
    });
  
    afterUpdate(() => {
      let pastClientWidth = clientWidth;
      const trackContainer = document.querySelector('.track-container');
      clientWidth = trackContainer.clientWidth;
      if (clientWidth != pastClientWidth) {
        const splitter = document.getElementById('splitter');
        if (splitter) {
          splitter.style.setProperty('--min-width', `${clientWidth}px`);
        }
      }
    });
  
    const handleMouseMove = (e) => {
      if (isMouseDown) {
        delta = mousePos - e.clientY;
        topH = initialT - delta;
        bottomH = containerH - topH - splitterHeight;
      }
    };
  
    const handleMouseDown = (e) => {
      mousePos = e.clientY;
      initialT = topH;
      isMouseDown = true;
    };
  
    const handleMouseUp = () => {
      isMouseDown = false;
    };
  
    $: if (
      topH &&
      bottomH &&
      containerH &&
      topH + bottomH !== containerH - splitterHeight
    ) {
      const topRatio = topH / (topH + bottomH - splitterHeight / 2);
      topH = containerH * topRatio - splitterHeight / 2;
      bottomH = containerH - topH - splitterHeight / 2;
    }
  </script>
  
  <svelte:window on:mousemove="{handleMouseMove}" on:mouseup="{handleMouseUp}" />
  <div
    bind:clientHeight="{containerH}"
    class="{isMouseDown ? 'disable-select' : ''}"
  >
    <div style="height:{topH}px" id="top">
      <slot name="top"></slot>
      {#if isMouseDown}
      <div class="window-hook"></div>
    {/if}
    </div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      on:mousedown="{handleMouseDown}"
      id="splitter"
      style="height:{splitterHeight}px"
    ></div>
    <div style="height:{bottomH}px" id="bottom">
      <slot name="bottom"></slot>
      {#if isMouseDown}
      <div class="window-hook"></div>
    {/if}
    </div>
  </div>
  
  <style>
    .first-section {
      width: 100%;
      display: flex;
      flex-direction: column;
    }
  
    .pane {
      flex: 1;
    }

    #top {
        height: 100%;
    }

    #bottom{
        height: 100%;
    }
  
    #splitter {
      min-width: var(--min-width, 0);
      background-color: gray;
      cursor: row-resize;
    }
  
    div.window-hook {
      width: 100%;
      height: 100%;
      z-index: 5000;
      position: absolute;
      top: 0;
      left: 0;
    }
  
    .disable-select,
    .disable-select * {
      user-select: none;
      cursor: row-resize;
    }
  </style>