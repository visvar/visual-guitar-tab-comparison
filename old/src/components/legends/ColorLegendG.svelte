<script>
  // Based on https://observablehq.com/@d3/color-legend#legend
  //    Copyright 2021, Observable Inc.
  //    Released under the ISC license.
  //    https://observablehq.com/@d3/color-legend

  import * as d3 from "d3";
  import { afterUpdate, beforeUpdate, tick } from "svelte";

  export let color;
  export let title;
  export let width = 320;
  export let tickSize = 6;
  export let tickValues = undefined;
  export let tickFormat = undefined;
  export let ticks = width / 64;

  let marginTop = 18;
  let marginRight = 0;
  let marginBottom = 16 + tickSize;
  let marginLeft = 0;
  let height = 44 + tickSize;

  let axisGroup;

  const ramp = (color, n = 256) => {
    const canvas = document.createElement("canvas");
    canvas.width = n;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1));
      context.fillRect(i, 0, 1, 1);
    }
    return canvas;
  };

  const axis = (
    node,
    { axis, scale, ticks, tickFormat, tickSize, tickValues }
  ) => {
    const g = d3.select(node);
    function drawAxis({
      axis,
      scale,
      ticks,
      tickFormat,
      tickSize,
      tickValues,
    }) {
      g.call(
        axis(scale)
          .ticks(ticks)
          .tickFormat(tickFormat)
          .tickSize(tickSize)
          .tickValues(tickValues)
      );
    }
    drawAxis({ axis, scale, ticks, tickFormat, tickSize, tickValues });
    return {
      update: drawAxis,
    };
  };

  $: colorHeight = height - marginTop - marginBottom;

  let x;
  let n;
  let tickFormat2 = tickFormat;
  let tickValues2 = tickValues;

  let adjustTicks = true;
  beforeUpdate(() => {
    if (color.interpolate) {
      // Continuous
      n = Math.min(color.domain().length, color.range().length);
      x = color
        .copy()
        .rangeRound(
          d3.quantize(d3.interpolate(marginLeft, width - marginRight), n)
        );
    } else if (color.interpolator) {
      // Sequential
      x = Object.assign(
        color
          .copy()
          .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
        {
          range() {
            return [marginLeft, width - marginRight];
          },
        }
      );
      // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
      if (!x.ticks) {
        if (tickValues === undefined) {
          const n = Math.round(ticks + 1);
          tickValues2 = d3
            .range(n)
            .map((i) => d3.quantile(color.domain(), i / (n - 1)));
        }
        if (typeof tickFormat !== "function") {
          tickFormat2 = d3.format(tickFormat === undefined ? ",f" : tickFormat);
        }
      }
    } else if (color.invertExtent) {
      // Threshold
      const thresholds = color.thresholds
        ? color.thresholds() // scaleQuantize
        : color.quantiles
        ? color.quantiles() // scaleQuantile
        : color.domain(); // scaleThreshold
      const thresholdFormat =
        tickFormat === undefined
          ? (d) => d
          : typeof tickFormat === "string"
          ? d3.format(tickFormat)
          : tickFormat;
      x = d3
        .scaleLinear()
        .domain([-1, color.range().length - 1])
        .rangeRound([marginLeft, width - marginRight]);
      tickValues2 = d3.range(thresholds.length);
      tickFormat2 = (i) => thresholdFormat(thresholds[i], i);
    } else {
      // Ordinal
      x = d3
        .scaleBand()
        .domain(color.domain())
        .rangeRound([marginLeft, width - marginRight]);
      adjustTicks = false;
    }
  });

  afterUpdate(async () => {
    // Need to await svelte's tick so DOM update is applied
    await tick();
    const g = d3.select(axisGroup);
    // Remove axis line
    g.select(".domain").remove();
    // Adjust ticks?
    if (adjustTicks) {
      g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
    }
  });
</script>

<g>
  <g class="title">
    <text x={marginLeft} y={marginTop + marginBottom - height + 23}>
      {title}
    </text>
  </g>
  <g class="colors">
    {#if color.interpolate}
      <!-- continuous -->
      <image
        x={marginLeft}
        y={marginTop}
        width={width - marginLeft - marginRight}
        height={colorHeight}
        preserveAspectRatio={"none"}
        xlink:href={ramp(
          color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))
        ).toDataURL()}
      />
    {:else if color.interpolator}
      <!-- sequential -->
      <image
        x={marginLeft}
        y={marginTop}
        width={width - marginLeft - marginRight}
        height={colorHeight}
        preserveAspectRatio={"none"}
        xlink:href={ramp(color.interpolator()).toDataURL()}
      />
    {:else if color.invertExtent}
      <!-- threshold -->
      {#each color.range() as d, i}
        <rect
          x={x(i - 1)}
          y={marginTop}
          width={x(i) - x(i - 1)}
          height={colorHeight}
          fill={d}
        />
      {/each}
    {:else}
      <!-- ordinal -->
      {#each color.domain() as d, i}
        <rect
          x={x(d)}
          y={marginTop}
          width={Math.max(0, x.bandwidth() - 1)}
          height={colorHeight}
          fill={color(d)}
        />
      {/each}
    {/if}
  </g>
  <g
    class="axis"
    bind:this={axisGroup}
    transform="translate(0, {height - marginBottom})"
    use:axis={{
      axis: d3.axisBottom,
      scale: x,
      ticks,
      tickFormat:
        typeof tickFormat2 === "string" ? d3.format(tickFormat2) : tickFormat2,
      tickSize,
      tickValues: tickValues2,
    }}
  />
</g>

<style>
  .title text {
    font-size: 13px;
    fill: currentColor;
    text-anchor: start;
  }
</style>
