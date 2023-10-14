<script>
  import * as d3 from "d3";
  import ColorLegend from "./ColorLegend.svelte";
  import ColorLegendVertical from "./ColorLegendVertical.svelte";
  import ColorLegendG from "./ColorLegendG.svelte";
  import Swatches from "./Swatches.svelte";
</script>

<main>
  <h2>Color Legends</h2>

  <ColorLegend
    title="scaleSequential"
    color={d3.scaleSequential([0, 100], d3.interpolateViridis)}
  />
  <ColorLegend
    title="scaleSequentialSqrt"
    color={d3.scaleSequentialSqrt([0, 1], d3.interpolateTurbo)}
  />
  <ColorLegend
    title="scaleDiverging"
    tickFormat={(d) => (d * 100).toFixed(0.1) + "%"}
    color={d3.scaleDiverging([-0.1, 0, 0.1], d3.interpolatePiYG)}
  />
  <ColorLegend
    title="scaleDivergingSqrt"
    tickFormat={(d) => (d * 100).toFixed(0.1) + "%"}
    color={d3.scaleDivergingSqrt([-0.1, 0, 0.1], d3.interpolateRdBu)}
  />
  <ColorLegend
    title="scaleSequentialLog"
    ticks={10}
    color={d3.scaleSequentialLog([1, 100], d3.interpolateBlues)}
  />
  <ColorLegend
    title="scaleSequentialQuantile"
    tickFormat=".2f"
    color={d3.scaleSequentialQuantile(
      d3.range(100).map(() => Math.random() ** 2),
      d3.interpolateBlues
    )}
  />
  <ColorLegend
    title="scaleSqrt"
    color={d3.scaleSqrt([-100, 0, 100], ["blue", "white", "red"])}
  />
  <ColorLegend
    title="scaleQuantize"
    color={d3.scaleQuantize([1, 10], d3.schemePurples[9])}
  />
  <ColorLegend
    title="scaleQuantile"
    tickFormat=".0f"
    color={d3.scaleQuantile(
      d3.range(1000).map(d3.randomNormal(100, 20)),
      d3.schemeSpectral[9]
    )}
  />
  <ColorLegend
    title="scaleThreshold"
    tickSize={0}
    color={d3.scaleThreshold(
      [2.5, 3.1, 3.5, 3.9, 6, 7, 8, 9.5],
      d3.schemeRdBu[9]
    )}
  />
  <ColorLegend
    title="scaleOrdinal"
    color={d3.scaleOrdinal(
      [
        "<10",
        "10-19",
        "20-29",
        "30-39",
        "40-49",
        "50-59",
        "60-69",
        "70-79",
        "≥80",
      ],
      d3.schemeSpectral[10]
    )}
    tickSize={0}
  />

  <p>Color Legend as &lt;g&gt; Element in Your SVG:</p>

  <svg width="400" height="200" viewBox="0, 0, 400, 200">
    <ColorLegendG
      title="scaleOrdinal"
      color={d3.scaleOrdinal(
        [
          "<10",
          "10-19",
          "20-29",
          "30-39",
          "40-49",
          "50-59",
          "60-69",
          "70-79",
          "≥80",
        ],
        d3.schemeSpectral[10]
      )}
      tickSize={0}
    />
    <circle cx={50} cy={70} r={20} fill={d3.schemeSpectral[10][8] + ""} />
    <circle cx={80} cy={90} r={10} fill={d3.schemeSpectral[10][5] + ""} />
    <circle cx={120} cy={99} r={15} fill={d3.schemeSpectral[10][2] + ""} />
  </svg>

  <h2>Swatches</h2>

  <p>Simple:</p>

  <Swatches
    color={d3.scaleOrdinal(
      ["blueberries", "oranges", "apples"],
      d3.schemeCategory10
    )}
  />

  <Swatches
    color={d3.scaleOrdinal(
      [
        "Wholesale and Retail Trade",
        "Manufacturing",
        "Leisure and hospitality",
        "Business services",
        "Construction",
        "Education and Health",
        "Government",
        "Finance",
        "Self-employed",
        "Other",
      ],
      d3.schemeTableau10
    )}
    swatchWidth={10}
  />

  <p>
    With a grid (you can define any value for <i>grid-template-columns</i>)
  </p>

  <Swatches
    color={d3.scaleOrdinal(
      [
        "Wholesale and Retail Trade",
        "Manufacturing",
        "Leisure and hospitality",
        "Business services",
        "Construction",
        "Education and Health",
        "Government",
        "Finance",
        "Self-employed",
        "Other",
      ],
      d3.schemeTableau10
    )}
    columns="repeat(3, 150px)"
    swatchWidth={10}
    swatchRadius="5px"
  />

  <h2>Color Legends in Vertical</h2>

  <div class="grid">
    <ColorLegendVertical
      title="scaleSequential"
      color={d3.scaleSequential([0, 100], d3.interpolateViridis)}
    />
    <ColorLegendVertical
      title="scaleSequentialSqrt"
      color={d3.scaleSequentialSqrt([0, 1], d3.interpolateTurbo)}
    />
    <ColorLegendVertical
      title="scaleDiverging"
      tickFormat={(d) => (d * 100).toFixed(0.1) + "%"}
      color={d3.scaleDiverging([-0.1, 0, 0.1], d3.interpolatePiYG)}
    />
    <ColorLegendVertical
      title="scaleDivergingSqrt"
      tickFormat={(d) => (d * 100).toFixed(0.1) + "%"}
      color={d3.scaleDivergingSqrt([-0.1, 0, 0.1], d3.interpolateRdBu)}
    />
    <ColorLegendVertical
      title="scaleSequentialLog"
      ticks={10}
      color={d3.scaleSequentialLog([1, 100], d3.interpolateBlues)}
    />
    <ColorLegendVertical
      title="scaleSequentialQuantile"
      tickFormat=".2f"
      color={d3.scaleSequentialQuantile(
        d3.range(100).map(() => Math.random() ** 2),
        d3.interpolateBlues
      )}
    />
    <ColorLegendVertical
      title="scaleSqrt"
      color={d3.scaleSqrt([-100, 0, 100], ["blue", "white", "red"])}
    />
    <ColorLegendVertical
      title="scaleQuantize"
      color={d3.scaleQuantize([1, 10], d3.schemePurples[9])}
    />
    <ColorLegendVertical
      title="scaleQuantile"
      tickFormat=".0f"
      color={d3.scaleQuantile(
        d3.range(1000).map(d3.randomNormal(100, 20)),
        d3.schemeSpectral[9]
      )}
    />
    <ColorLegendVertical
      title="scaleThreshold"
      tickSize={0}
      color={d3.scaleThreshold(
        [2.5, 3.1, 3.5, 3.9, 6, 7, 8, 9.5],
        d3.schemeRdBu[9]
      )}
    />
    <ColorLegendVertical
      title="scaleOrdinal"
      color={d3.scaleOrdinal(
        [
          "<10",
          "10-19",
          "20-29",
          "30-39",
          "40-49",
          "50-59",
          "60-69",
          "70-79",
          "≥80",
        ],
        d3.schemeSpectral[10]
      )}
      tickSize={0}
    />
  </div>
</main>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(11, 75px);
  }
</style>
