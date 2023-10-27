<script>
  import * as d3 from 'd3';
  import TabDisplay from './components/TabDisplay.svelte';
  import TopBar from './components/TopBar.svelte';
  import Overview from './components/Overview.svelte';
  import SplitPane from './components/SplitPane.svelte';
  import { VSplitPane } from 'svelte-split-pane';
  import TechniquesLegend from './components/TechniquesLegend.svelte';
  import {
    overviewInfo,
    tabRoutes,
    selectedCriteria,
    legendInfo,
  } from './store/store';
  import ColorLegend from './components/legends/ColorLegend.svelte';
</script>

<div class="main-container">
  <TopBar />
  <!-- <SplitPane minWidth="{50}">
    <div class="comparison-container" slot="left">
      <div class="comparison-block">
        <h2 class="overview-header">Tab Overview</h2>
        {#if $overviewInfo.length === 0}
          <div class="ui placeholder segment">
            <div class="ui icon header">
              Select a metric to see an overview for each tab
            </div>
          </div>
        {:else}
          {#each $overviewInfo as info}
            <Overview info="{info}" />
          {/each}
        {/if}
      </div>
      <div class="legend-container">
        {#if $selectedCriteria !== 'similarity' && $selectedCriteria !== '1 on 1 comparison' && $selectedCriteria !== 'techniques' && $selectedCriteria !== ''}
          <ColorLegend
            color="{d3.scaleSequential(
              [$legendInfo.minForLegend, $legendInfo.maxForLegend],
              $legendInfo.colorScaleForLegend
            )}"
            title="{$selectedCriteria}"
          />
        {/if}
      </div>
      {#if $selectedCriteria === 'techniques'}
        <TechniquesLegend />
      {/if}
    </div>
    <div class="track-container" slot="right">
      <h2 class="tab-header">Tab Display</h2>
      {#if $tabRoutes.length === 0}
        <div class="ui placeholder segment tab-placeholder">
          <div class="ui icon header">Open your tabs and start comparing</div>
        </div>
      {:else}
        <TabDisplay />
      {/if}
    </div>
  </SplitPane> -->
  <VSplitPane>
    <top slot="top">
      <div class="comparison-container">
        <div class="comparison-block">
          {#if $overviewInfo.length > 0}
            {#each $overviewInfo as info}
              <Overview info="{info}" />
            {/each}
          {/if}
        </div>
        <div class="legend-container">
          {#if $selectedCriteria !== 'similarity' && $selectedCriteria !== '1 on 1 comparison' && $selectedCriteria !== 'techniques' && $selectedCriteria !== ''}
            <ColorLegend
              color="{d3.scaleSequential(
                [$legendInfo.minForLegend, $legendInfo.maxForLegend],
                $legendInfo.colorScaleForLegend
              )}"
              title="{$selectedCriteria}"
              tickSize="{4}"
            />
          {/if}
        </div>
        {#if $selectedCriteria === 'techniques'}
          <TechniquesLegend />
        {/if}
      </div>
    </top>
    <down slot="down">
      <div class="track-container">
        {#if $tabRoutes.length > 0}
          <TabDisplay />
        {/if}
      </div>
    </down>
  </VSplitPane>
</div>

<style>
  .main-container {
    /* min-height: 1200px; */
  }
  .comparison-container {
    display: flex;
    flex-direction: column;
    height: auto;
    min-height: 50px;
  }

  .comparison-block {
    flex: 1;
    padding-top: 8px;
    /* overflow-x: auto;
      overflow-y: auto; */
    /* max-width: 100vw;
    max-height: 100vh;
    margin-left: 10px;
    margin-right: 10px; */
  }

  .track-container {
    overflow-y: auto;
    position: relative;
    height: auto;
    background-color: white;
  }

  .tab-placeholder {
    margin-right: 10px;
    margin-left: 10px;
  }

  .tab-header {
    margin-left: 10px;
  }

  .legend-container {
    display: flex;
    justify-content: center;
  }
</style>
