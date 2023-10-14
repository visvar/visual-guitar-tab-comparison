<script>
  import ColorLegendG from "./ColorLegendG.svelte";

  export let color;
  export let title;
  export let width = 320;
  export let tickSize = 6;
  export let tickValues = undefined;
  export let tickFormat = undefined;
  export let ticks = width / 64;

  let height = 44 + tickSize;
</script>

<svg {width} {height} viewBox="0, 0, {width}, {height}">
  <ColorLegendG
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
