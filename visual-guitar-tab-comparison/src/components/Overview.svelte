<script>
  import * as d3 from 'd3';
  import { arrayMoveImmutable } from 'array-move';
  import _ from 'lodash';
  import { afterUpdate } from 'svelte';
  import {
    selectedBar,
    overviewInfo,
    selectedCriteria,
    alphaApis,
    tabOrder,
    apiAlignments,
    selectedTechniques,
    tabRoutes,
    alignmentActivated,
    maxNumberOfBars,
    visibleBarIndices,
  } from '../store/store';

  export let info;

  let container;

  const fileName = $tabRoutes.filter((d) => d.id === info.id)[0].fileName;

  const createClickHandler = (barCount, infoId) => {
    return () => getBar(`${barCount}`);
  };

  //Gets the clicked bar and updates the store
  const getBar = (bar) => {
    $selectedBar = bar;
  };

  //Creates a bar overview based on the information from TabDisplay Component
  const createBarOverview = (info) => {
    console.log('draw');
    let sequence = $apiAlignments.find((element) => element.id === info.id);
    d3.select(`.overview${info.id}`).selectAll('svg').remove();
    const width = (container?.clientWidth ?? 1000) - 20;
    const height = 42;
    const barStep = (width - 5) / $maxNumberOfBars;
    const barWidth = barStep - 1;
    const barHeight = height - 14;

    const svg = d3
      .select(`.overview${info.id}`)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // indicator showing the currently visible bars in tab view
    svg
      .append('rect')
      .attr('class', 'scroll-indicator')
      .attr('fill', '#ddd')
      .attr('rx', 4)
      .attr('x', $visibleBarIndices[0] * barStep + 2)
      .attr(
        'width',
        ($visibleBarIndices[1] - $visibleBarIndices[0] + 1) * barStep
      )
      .attr('height', height);

    // draw bars
    if (
      $selectedCriteria !== '1 on 1 comparison' &&
      $selectedCriteria !== 'techniques'
    ) {
      // scalar metrics
      let realBarCount = 0;
      let measureCount = 0;
      for (let i = 0; i < $maxNumberOfBars; i++) {
        if ($alignmentActivated) {
          if (sequence.alignment[i] != '-') {
            if (info.colors[i] !== undefined) {
              svg
                .append('rect')
                .attr('class', `rectOverview rectBar${measureCount}`)
                .attr('x', i * barStep + 2)
                .attr('y', 10)
                .attr('width', barWidth)
                .attr('height', barHeight)
                .attr('fill', info.colors[realBarCount])
                .attr('stroke', '#888')
                .attr('stroke-width', 0.5)
                .attr('rx', 4)
                .on('click', createClickHandler(i, info.id));
              // TODO: add title with metric's value
              // .append('title')
              // .text();
            }
            realBarCount = realBarCount + 1;
          }
          measureCount++;
        } else {
          if (info.colors[i] !== undefined) {
            svg
              .append('rect')
              .attr('class', `rectOverview rectBar${i}`)
              .attr('x', i * barStep + 2)
              .attr('y', 10)
              .attr('width', barWidth)
              .attr('height', barHeight)
              .attr('fill', info.colors[i])
              .attr('stroke', '#888')
              .attr('stroke-width', 0.5)
              .attr('rx', 4)
              .on('click', createClickHandler(i, info.id));
          }
        }
        addBarLabel(i, svg, barStep);
      }
    } else {
      // 1 on 1 or techniques
      let realBarCount = 0;
      let measureCount = 0;
      for (let i = 0; i < $maxNumberOfBars; i++) {
        if ($alignmentActivated) {
          if (sequence.alignment[i] != '-') {
            const colors = info.colors[realBarCount];
            //Stacks the colors inside the bars
            const group = svg.append('g');
            if (colors && colors.forEach) {
              colors.forEach((color, position) => {
                group
                  .append('rect')
                  .attr('class', 'technique')
                  .attr('x', i * barStep + 2)
                  .attr('y', 10 + (position * barHeight) / colors.length)
                  .attr('width', barWidth)
                  .attr('height', barHeight / colors.length)
                  .attr('fill', () => {
                    if ($selectedCriteria === 'techniques') {
                      if ($selectedTechniques.includes(color)) {
                        return color;
                      } else {
                        return 'white';
                      }
                    } else {
                      return color;
                    }
                  })
                  .attr('stroke', '#888')
                  .attr('stroke-width', 0.5)
                  .attr('rx', 4)
                  .on('click', createClickHandler(i, info.id));
              });
            }
            realBarCount++;
          }
          measureCount++;
        } else {
          //Stacks the colors inside the bars
          const colors = info.colors[i];
          const group = svg.append('g');
          if (colors && colors.forEach) {
            colors.forEach((color, position) => {
              group
                .append('rect')
                .attr('class', 'technique')
                .attr('x', i * barStep + 2)
                .attr('y', 10 + (position * barHeight) / colors.length)
                .attr('width', barWidth)
                .attr('height', barHeight / colors.length - 1)
                .attr('fill', function () {
                  if ($selectedCriteria === 'techniques') {
                    if ($selectedTechniques.includes(color)) {
                      return color;
                    } else {
                      return 'white';
                    }
                  } else {
                    return color;
                  }
                })
                .attr('stroke', '#888')
                .attr('stroke-width', 0.5)
                .attr('rx', 4)
                .on('click', createClickHandler(i, info.id));
              // .append('title')
              // .text(color);
            });
          }
        }
        addBarLabel(i, svg, barStep);
      }
    }
  };

  const checkFirstPosition = (previousOrder) => {
    if ($tabOrder[0] !== previousOrder[0]) {
      const tempInfo = $alphaApis.sort((a, b) => {
        let indexA = $tabOrder.indexOf(a.id);
        let indexB = $tabOrder.indexOf(b.id);
        return indexA - indexB;
      });
      $alphaApis = tempInfo;
    }
  };

  /**
   * Change version order by moving one down
   */
  const moveOverviewUp = () => {
    const mainTabsDiv = document.querySelector('.alphaTab');
    const childrenOfTabs = mainTabsDiv.childNodes;
    const childOverview = document.querySelector(`.wrappedOverview${info.id}`);
    const parentOverview = childOverview.parentNode;
    const index = Array.prototype.indexOf.call(
      parentOverview.children,
      childOverview
    );
    const comparisonDiv = document.querySelector('.comparison-block');
    const childrenComparisonDiv = comparisonDiv.children;
    const previousOrder = $tabOrder;
    if (index != 1) {
      childrenComparisonDiv[index].parentNode.insertBefore(
        childrenComparisonDiv[index],
        childrenComparisonDiv[index - 1]
      );
      childrenOfTabs[index - 1].parentNode.insertBefore(
        childrenOfTabs[index - 1],
        childrenOfTabs[index - 2]
      );
      const tempOrder = arrayMoveImmutable($tabOrder, index - 1, index - 2);
      $tabOrder = tempOrder;
    }
    checkFirstPosition(previousOrder);
  };

  /**
   * Change version order by moving one down
   */
  const moveOverviewDown = () => {
    const mainTabsDiv = document.querySelector('.alphaTab');
    const childrenOfTabs = mainTabsDiv.childNodes;
    const childOverview = document.querySelector(`.wrappedOverview${info.id}`);
    const parentOverview = childOverview.parentNode;
    const index = Array.prototype.indexOf.call(
      parentOverview.children,
      childOverview
    );
    const comparisonDiv = document.querySelector('.comparison-block');
    const childrenComparisonDiv = comparisonDiv.children;
    const previousOrder = $tabOrder;
    if (index != $overviewInfo.length) {
      childrenComparisonDiv[index + 1].parentNode.insertBefore(
        childrenComparisonDiv[index + 1],
        childrenComparisonDiv[index]
      );
      childrenOfTabs[index].parentNode.insertBefore(
        childrenOfTabs[index],
        childrenOfTabs[index - 1]
      );
      const tempOrder = arrayMoveImmutable($tabOrder, index - 1, index);
      $tabOrder = tempOrder;
    }
    checkFirstPosition(previousOrder);
  };

  /**
   * Remove a version
   */
  const removeTab = () => {
    if (!confirm('Remove this tab?')) {
      return;
    }
    const mainTabsDiv = document.querySelector('.alphaTab');
    const childrenOfTabs = mainTabsDiv.childNodes;
    const childOverview = document.querySelector(`.wrappedOverview${info.id}`);
    const parentOverview = childOverview.parentNode;
    const index = Array.prototype.indexOf.call(
      parentOverview.children,
      childOverview
    );
    const comparisonDiv = document.querySelector('.comparison-block');
    const childrenComparisonDiv = comparisonDiv.children;
    const previousOrder = $tabOrder;
    comparisonDiv.removeChild(childrenComparisonDiv[index]);
    mainTabsDiv.removeChild(childrenOfTabs[index - 1]);
    $tabOrder.splice(index - 1, 1);
    if ($tabOrder[0] !== previousOrder[0]) {
      const tempInfo = $alphaApis.sort((a, b) => {
        let indexA = $tabOrder.indexOf(a.id);
        let indexB = $tabOrder.indexOf(b.id);
        return indexA - indexB;
      });
      $alphaApis = tempInfo;
    }
  };

  // TODO: use lodash _.debounce to avoid rendering multiple times
  // https://docs-lodash.com/v4/debounce/
  const debounced = _.debounce(createBarOverview, 500, {
    maxWait: 1000,
    leading: true,
    trailing: false,
  });
  const draw = () => {
    debounced(info);
    // setTimeout(() => createBarOverview(info), 500);
  };
  afterUpdate(draw);

  /**
   * Adds the bar number to every 5th bar
   * @param i
   * @param svg
   * @param barStep
   */
  function addBarLabel(i, svg, barStep) {
    if ((i + 1) % 5 == 0) {
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', (i + 0.5) * barStep + 2)
        .attr('y', 8)
        .attr('font-size', 10)
        .text(i + 1);
    }
  }
</script>

<div class="{`grid wrappedOverview${info.id}`}" on:resize="{draw}">
  <div class="buttons">
    <button on:click="{() => moveOverviewUp()}" class="move" title="Move up">
      ˄
    </button>
    <button
      on:click="{() => moveOverviewDown()}"
      class="move"
      title="Move down"
    >
      ˅
    </button>
  </div>
  <div bind:this="{container}" class="{`container overview${info.id}`}"></div>
  <div class="buttons">
    <button
      on:click="{() => removeTab()}"
      class="ui red button remove"
      title="Remove {fileName}"
    >
      X
    </button>
  </div>
</div>

<style>
  .grid {
    width: 100%;
    display: flex;
    align-items: center;
  }

  .buttons {
    padding: 2px 0;
    display: grid;
    justify-content: center;
    align-items: center;
    font-size: 12px;
  }

  button.move,
  button.remove {
    flex: 1;
    margin-right: 5px;
    width: 20px;
    color: white;
    background-color: gray;
  }
  .container {
    flex: 1;
  }
</style>
