<script>
  // Based on https://observablehq.com/@d3/color-legend#Swatches
  //    Copyright 2021, Observable Inc.
  //    Released under the ISC license.
  //    https://observablehq.com/@d3/color-legend

  import * as d3 from "d3";

  export let color;
  export let format = undefined;
  export let formatUnknown = null;
  export let swatchSize = 15;
  export let swatchWidth = swatchSize;
  export let swatchHeight = swatchSize;
  export let swatchRadius = "0px";
  export let columns = undefined;
  export let clicked = null;

  const unknown = formatUnknown == null ? undefined : color.unknown();
  const unknowns =
    unknown == null || unknown === d3.scaleImplicit ? [] : [unknown];
  const domain = color.domain().concat(unknowns);
  if (format === undefined) format = (x) => (x === unknown ? formatUnknown : x);
</script>

<main>
  <div
    class="swatches"
    style={columns
      ? `display: grid; align-items: center; grid-template-columns: ${columns};`
      : ""}
  >
    {#each domain as value}
      <div class="item" on:click={() => (clicked = value)}>
        <div
          class="swatch"
          style="width: {swatchWidth}px; height: {swatchHeight}px; --color: {color(
            value
          )}; border-radius: {swatchRadius}"
        />
        <div
          class="label"
          title={format(value)}
          style="max-width: calc(100% - {+swatchWidth}px - 0.5em);"
        >
          {format(value)}
        </div>
      </div>
    {/each}
  </div>
</main>

<style>
  main {
    margin: 10px 0;
    min-height: 33px;
    font: 10px sans-serif;
  }

  .swatches {
    width: 100%;
    margin-right: 1em;
  }

  .item {
    break-inside: avoid;
    display: inline-flex;
    align-items: center;
    padding-bottom: 3px;
  }

  .label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .swatch {
    display: inline-block;
    margin: 0 0.5em;
    background-color: var(--color);
  }
</style>
