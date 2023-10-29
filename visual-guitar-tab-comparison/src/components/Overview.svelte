<script>
  import * as d3 from 'd3';
  import { arrayMoveImmutable } from 'array-move';
  import { afterUpdate, onMount } from 'svelte';
  import {
    selectedBar,
    overviewInfo,
    selectedCriteria,
    alphaApis,
    tabOrder,
    currentBar,
    apiAlignments,
    selectedTechniques,
    tabRoutes,
  } from '../store/store';

  export let info;

  const fileName = $tabRoutes.filter((d) => d.id === info.id)[0].fileName;

  const createClickHandler = (barCount, infoId) => {
    return function () {
      // getBar(`${barCount}${infoId}`);
      getBar(`${barCount}`);
      // highlightBar(barCount)
    };
  };

  //Gets the clicked bar and updates the store
  const getBar = (bar) => {
    $selectedBar = bar;
  };


  //Creates a bar overview based on the information from TabDisplay Component
  const createBarOverview = (info) => {
    let sequence = $apiAlignments.find((element) => element.id === info.id);
    d3.select(`.overview${info.id}`).selectAll('svg').remove();
    const factorWidth = 10;
    const factorHeight = 60;
    const viewSize = `0 0 ${250 * factorWidth} ${
      factorHeight * 1.1
    }`;

    const svg = d3
      .select(`.overview${info.id}`)
      .append('svg')
      .attr('viewBox', viewSize);
    if (
      $selectedCriteria !== '1 on 1 comparison' &&
      $selectedCriteria !== 'techniques'
    ) {
      let realBarCount = 0;
      let measureCount = 0;
      for (let i = 0; i < sequence.alignment.length; i++) {
        if (sequence.alignment[i] != '-') {
          svg
            .append('rect')
            .attr('class', `rectOverview rectBar${measureCount}`)
            .attr('x', i * factorWidth)
            .attr('y', 10)
            .attr('width', factorWidth)
            .attr('height', factorHeight - 10)
            .attr('rx', 4)
            .attr('fill', info.colors[realBarCount])
            .attr('stroke', 'black')
            .attr('stroke-width', 0.3)
            .attr('fill-opacity', 0.3)
            .on(
              'click',
              createClickHandler(i, info.id)
            );
          realBarCount = realBarCount + 1;
        }
        measureCount++;
        addBarLabel(i, svg, factorWidth);
      }
    } else {
      let realBarCount = 0;
      let measureCount = 0;
      for (let i = 0; i < sequence.alignment.length; i++) {
        if (sequence.alignment[i] != '-') {
          svg
            .append('rect')
            .attr('class', `rectOverview rectBar${measureCount}`)
            .attr('x', i * factorWidth)
            .attr('y', 10)
            .attr('width', factorWidth)
            .attr('height', factorHeight - 10)
            .attr('rx', 4)
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .attr('stroke-width', 0.3)
            .on('click', createClickHandler(realBarCount, info.id));

          //Stacks the colors inside the bars
          const group = svg.append('g');
          const colors = info.colors[realBarCount];

          colors.forEach((color, position) => {
            group
              .append('rect')
              .attr('class', 'technique')
              .attr('x', i * factorWidth)
              .attr('y', 10 + (position * (factorHeight - 10)) / colors.length)
              .attr('width', factorWidth)
              .attr('height', (factorHeight - 10) / colors.length)
              .attr('rx', 4)
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
              .attr('stroke', 'black')
              .attr('stroke-width', 0.3)
              .on('click', createClickHandler(i, info.id));
          });
          realBarCount = realBarCount + 1;
        }
        measureCount++;
        addBarLabel(i, svg, factorWidth);
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
    const anotherOrder = previousOrder;
    console.log(previousOrder, '1');
    comparisonDiv.removeChild(childrenComparisonDiv[index]);
    mainTabsDiv.removeChild(childrenOfTabs[index - 1]);
    $tabOrder.splice(index - 1, 1);

    console.log($tabOrder, '2');
    console.log(previousOrder, '3');
    console.log(anotherOrder, '4');
    if ($tabOrder[0] !== previousOrder[0]) {
      const tempInfo = $alphaApis.sort((a, b) => {
        let indexA = $tabOrder.indexOf(a.id);
        let indexB = $tabOrder.indexOf(b.id);
        return indexA - indexB;
      });
      $alphaApis = tempInfo;
    }
  };

  afterUpdate(() => {
    setTimeout(() => {
      createBarOverview(info);
    }, 500);
  });

  /**
   * Adds the bar number to every 5th bar
   * @param i
   * @param svg
   * @param factorWidth
   */
  function addBarLabel(i, svg, factorWidth) {
    if ((i + 1) % 5 == 0) {
      svg
        .append('text')
        .attr('x', i * factorWidth)
        .attr('y', 8)
        .attr('font-size', 10)
        .text(i + 1);
    }
  }
</script>

<div class="{`grid wrappedOverview${info.id}`}">
  <div class="buttons">
    <button on:click="{() => moveOverviewUp()}" class="move" title="Move up">
      ↑
    </button>
    <button
      on:click="{() => moveOverviewDown()}"
      class="move"
      title="Move down"
    >
      ↓
    </button>
  </div>
  <div class="{`container overview${info.id}`}"></div>
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
    display: flex;
  }

  .buttons {
    padding: 2px 0;
    display: grid;
    justify-content: center;
    align-items: center;
    font-size: 12px;
  }

  .move {
    flex: 1;
    cursor: pointer;
    margin-right: 5px;
    width: 20px;
    background-color: gray;
    color: white;
  }
  .remove {
    flex: 1;
    cursor: pointer;
    margin-right: 5px;
    width: 20px;
    background-color: rgb(112, 24, 24);
    color: white;
  }
  .container {
    flex: 1;
    margin-right: 10px;
  }
</style>
