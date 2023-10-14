<script>
  import ColorLegendVerticalG from "./ColorLegendVerticalG.svelte";

  export let color;
  export let title;
  export let height = 320;
  export let tickSize = 6;
  export let tickValues = undefined;
  export let tickFormat = undefined;
  export let ticks = height / 64;

  let width = 58 + tickSize;
</script>

<svg {width} {height} viewBox="0, 0, {width}, {height}">
  <ColorLegendVerticalG
    {color}
    {title}
    {width}
    {tickSize}
    {tickValues}
    {tickFormat}
    {ticks}
  />
</svg>

<style>
  svg {
    overflow: visible;
    display: block;
  }
</style>
