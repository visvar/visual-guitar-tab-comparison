<script>
  // Based on https://observablehq.com/@d3/color-legend#legend
  //    Copyright 2021, Observable Inc.
  //    Released under the ISC license.
  //    https://observablehq.com/@d3/color-legend

  import * as d3 from "d3";
  import { afterUpdate, beforeUpdate, tick } from "svelte";

  export let color;
  export let title;
  export let height = 320;
  export let tickSize = 6;
  export let tickValues = undefined;
  export let tickFormat = undefined;
  export let ticks = height / 64;

  let marginTop = 5;
  let marginLeft = 18;
  let marginBottom = 5;
  let marginRight = 30 + tickSize;
  let width = 58 + tickSize;

  let axisGroup;

  const ramp = (color, n = 256) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = n;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1));
      context.fillRect(0, n - i - 1, 1, 1);
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

  $: colorWidth = width - marginLeft - marginRight;
  $: range = [height - marginBottom, marginTop];

  let y;
  let n;
  let tickFormat2 = tickFormat;
  let tickValues2 = tickValues;

  let adjustTicks = true;
  beforeUpdate(() => {
    if (color.interpolate) {
      // Continuous
      n = Math.min(color.domain().length, color.range().length);
      y = color.copy().rangeRound(d3.quantize(d3.interpolate(...range), n));
    } else if (color.interpolator) {
      // Sequential
      y = Object.assign(
        color.copy().interpolator(d3.interpolateRound(...range)),
        {
          range() {
            return range;
          },
        }
      );
      // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
      if (!y.ticks) {
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
      y = d3
        .scaleLinear()
        .domain([color.range().length - 1, -1])
        .rangeRound(range);
      const thresh2 = thresholds.reverse();
      tickValues2 = d3.range(thresh2.length);
      tickFormat2 = (i) => thresholdFormat(thresh2[i], i);
    } else {
      // Ordinal
      y = d3.scaleBand().domain(color.domain()).rangeRound(range);
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
      g.selectAll(".tick line").attr("x1", -colorWidth);
    }
  });
</script>

<g>
  <g class="title">
    <g transform="rotate(90, 0, 0)">
      <text x={marginTop} y={-4}>
        {title}
      </text>
    </g>
  </g>
  <g class="colors">
    {#if color.interpolate}
      <!-- continuous -->
      <image
        x={marginLeft}
        y={marginTop}
        width={colorWidth}
        height={height - marginTop - marginBottom}
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
        width={colorWidth}
        height={height - marginTop - marginBottom}
        preserveAspectRatio={"none"}
        xlink:href={ramp(color.interpolator()).toDataURL()}
      />
    {:else if color.invertExtent}
      <!-- threshold -->
      {#each color.range().reverse() as d, i}
        <rect
          x={marginLeft}
          y={y(i - 1)}
          height={y(i) - y(i - 1)}
          width={colorWidth}
          fill={d}
        />
      {/each}
    {:else}
      <!-- ordinal -->
      {#each color.domain() as d, i}
        <rect
          x={marginLeft}
          y={y(d)}
          height={Math.max(0, y.bandwidth() - 1)}
          width={colorWidth}
          fill={color(d)}
        />
      {/each}
    {/if}
  </g>
  <g
    class="axis"
    bind:this={axisGroup}
    transform="translate({width - marginRight}, 0)"
    use:axis={{
      axis: d3.axisRight,
      scale: y,
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
