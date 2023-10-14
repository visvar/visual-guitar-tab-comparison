<script>
    import * as d3 from 'd3';
    import { arrayMoveImmutable } from 'array-move';
    import { onMount, afterUpdate } from 'svelte';
    import { selectedBar, 
        overviewInfo, 
        tabRoutes, 
        selectedCriteria, 
        previousCriteria,
        alphaApis, 
        tabOrder,
        currentBar,
        apiAlignments } from '../store/store';
    import { nwAlignment} from '../utils/lib';
    import { NWaligner } from 'seqalign';
    import { derived } from 'svelte/store';

    export let info;

    // let mainDiv;

    const getLargestTab = (tabs) => {
        const largestArray = tabs.reduce((prev, current) => {
        if (current.colors.length > prev.colors.length) {
            return current;
        } else {
            return prev;
        }
        });

        return largestArray;
    }


    const createClickHandler = (barCount, infoId) => {
        return function () {
            // getBar(`${barCount}${infoId}`);
            getBar(`${barCount}`);
            // highlightBar(barCount)
        };
    }

    const highlightBar = (bar) => {
        let previousHihlightedBar = $currentBar
        const previousRects = d3.selectAll(`.rectBar${previousHihlightedBar}`);
        previousRects
            .attr("stroke", "black")
            .attr("stroke-width", 0.3)
        const currentRects = d3.selectAll(`.rectBar${bar}`);
        currentRects
            .attr("stroke", "red")
            .attr("stroke-width", 2)
        $currentBar = bar;
        
    }

    //Gets the clicked bar and updates the store
    const getBar = (bar) => {
        // selectedBar.update( newBar => newBar = bar )
        $selectedBar = bar;
        // console.log(previousSelectedBar, $selectedBar)
        // const currentRects = d3.selectAll(`.rectBar${bar}`);
        // console.log(bar)
        // console.log(`.rectBar${bar}`)
        // console.log(currentRects)
        // currentRects.attr("stroke", "red")
        
    }

    const extractColorsAndDashes = (str) => {
        const regex = /(rgb\(\d{1,3}, \d{1,3}, \d{1,3}\))|-/g;
        return str.match(regex);
    }

    //Creates a bar overview based on the information from TabDisplay Component
    const createBarOverview = (info) => {

        let sequence = $apiAlignments.find(element => element.id === info.id);

        if($selectedCriteria !== '1 on 1 comparison' && $selectedCriteria !== 'techniques') {
            // const largestOverviewColors = getLargestTab($overviewInfo)
            // const customAligner = NWaligner({ inDelScore: -3, gapSymbol: '-',})
            // const customResult = customAligner.align(largestOverviewColors.colors, info.colors);
            // const sequenceScore = extractColorsAndDashes(customResult.alignedSequences[1])
            d3.select(`.overview${info.id}`).selectAll('svg').remove();
            const factorWidth = 10;
            const factorHeight = 60;
            const yOffset = 10
            const xOffset = 10

            // const maxNumberOfBars = sequenceScore.length;
            const maxNumberOfBars = sequence.alignment.length;
            const viewSize = `0 0 ${maxNumberOfBars * factorWidth} ${factorHeight}`;
            // const svg = d3.select(`.overview${info.id}`).append('svg').attr('width', info.numberOfBars * factorWidth).attr('height', 20);
            const svg = d3.select(`.overview${info.id}`).append('svg').attr('viewBox', viewSize);
    
            // console.log(alignmentScore)
    
            //Loop through the largets tab
            // for(let i = 0; i < largestOverviewColors.numberOfBars; i++) {
            let realBarCount = 0;
            let measureCount = 0;
            for(let i = 0; i < maxNumberOfBars; i++) {
                //Get the second index of the arrays for alignment
                // const alignedIndex = alignmentScore[i][1];
                // console.log(alignedIndex)
                // const alignedX = alignedIndex !== '-' ? alignedIndex * factorWidth + shift : '-';
                // console.log(alignedX)
                // if(alignedIndex != '-') {
                if(sequence.alignment[i] != '-') {
                    // console.log(i, realBarCount)
                    svg.append('rect')
                        .attr('class',`rectOverview rectBar${measureCount}`)
                        .attr('x', i * factorWidth)
                        // .attr('x', alignedX)
                        .attr('y', 10)
                        .attr('width', factorWidth)
                        .attr('height', factorHeight - 10)
                        // .attr("fill", info.colors[alignmentScore[i][1]])
                        // .attr("fill", sequenceScore[i])
                        .attr("fill", info.colors[realBarCount])
                        .attr("stroke", "black")
                        .attr("stroke-width", 0.3)
                        .attr("fill-opacity", 0.3)
                        .on('click', createClickHandler(realBarCount, info.id)
                            // if(largestOverviewColors.colors.length === info.colors.length)
                                // getBar(`${alignmentScore[i][1]}${info.id}`)
                                // getBar(`${i}${info.id}`)
                                // getBar(`${realBarCount}${info.id}`)
                        );
                    realBarCount = realBarCount + 1;
                }
                measureCount ++
                // if( (i + 1) % 5 == 0) {
                //     svg.append('text')
                //         .attr('x', i * factorWidth)
                //         .attr('y', 8)
                //         .attr('font-size', 10)
                //         .text(i + 1);
                // }
            }
        } else {
            d3.select(`.overview${info.id}`).selectAll('svg').remove();
            const factorWidth = 10;
            const factorHeight = 60;
            const yOffset = 10
            const xOffset = 10
            const maxNumberOfBars = d3.max($overviewInfo, d => d.numberOfBars);
            const viewSize = `0 0 ${maxNumberOfBars * factorWidth} ${factorHeight}`;
            const svg = d3.select(`.overview${info.id}`).append('svg').attr('viewBox', viewSize);
    
            //Loop through the largets tab
            let realBarCount = 0;
            let measureCount = 0;
            for(let i = 0; i < sequence.alignment.length; i++) {

                if(sequence.alignment[i] != '-') {
                    let grad = svg.append('defs')
                        .append('linearGradient')
                        .attr('id', `grad${info.id}${realBarCount}`)
                        .attr('x1', '0%')
                        .attr('x2', '0%')
                        .attr('y1', '0%')
                        .attr('y2', '100%');
    
                    grad.selectAll('stop')
                        .data(info.colors[realBarCount])
                        .enter()
                        .append('stop')
                        .style('stop-color', function(d){ return d; })
                        // .attr('offset', function(d,iterator){
                        //     // console.log(iterator)
                        //     if(iterator > 0) {
                        //         // return 100 * (iterator / (info.colors[realBarCount].length - 1)) + '%';
                        //         return '50%'
                        //     }
                        // })
                        .attr('offset', '50%')
                    
                    svg.append('rect')
                        .attr('class',`rectOverview rectBar${measureCount}`)
                        .attr('x', i * factorWidth)
                        .attr('y', 10)
                        .attr('width', factorWidth)
                        .attr('height', factorHeight - 10)
                        .attr("fill", `url(#grad${info.id}${realBarCount})`)
                        .attr("stroke", "black")
                        .attr("stroke-width", 0.3)
                        .on('click', createClickHandler(realBarCount, info.id))
                        // .on('click', () => {getBar(`${i}`)});
                    realBarCount = realBarCount + 1;
                }
                measureCount ++
                
            }
        } 
        // else {
        //     d3.select(`.overview${info.id}`).selectAll('svg').remove();
        //     const factorWidth = 10;
        //     const yOffset = 10
        //     const xOffset = 10
        //     // const shift = alignmentScore[0][0] * factorWidth;
        //     const maxNumberOfBars = d3.max($overviewInfo, d => d.numberOfBars);
        //     const viewSize = `0 0 ${maxNumberOfBars * factorWidth} 30`;
        //     // const svg = d3.select(`.overview${info.id}`).append('svg').attr('width', info.numberOfBars * factorWidth).attr('height', 20);
        //     const svg = d3.select(`.overview${info.id}`).append('svg').attr('viewBox', viewSize);
    
        //     //Loop through the largets tab
        //     for(let i = 0; i < info.numberOfBars; i++) {
        //         svg.append('rect')
        //             .attr('x', i * factorWidth)
        //             .attr('y', 10)
        //             .attr('width', factorWidth)
        //             .attr('height', 20)
        //             .attr("fill", info.colors[i])
        //             .attr("stroke", "black")
        //             .attr("stroke-width", 0.3)
        //             .attr("fill-opacity", 0.3)
        //             .on('click', () => {getBar(`${i}${info.id}`)});
        //     }
        // }
    }

    const checkFirstPosition = (previousOrder) => {
        if($tabOrder[0] !== previousOrder[0]) {
            const tempInfo = $alphaApis.sort((a, b) => {
                let indexA = $tabOrder.indexOf(a.id);
                let indexB = $tabOrder.indexOf(b.id);
                return indexA - indexB;
            });
            $alphaApis = tempInfo;
        }

    }

    const moveOverviewUp = () => {
        const mainTabsDiv = document.querySelector('.alphaTab')
        const childrenOfTabs = mainTabsDiv.childNodes;

        const childOverview =  document.querySelector(`.wrappedOverview${info.id}`)
        const parentOverview = childOverview.parentNode;
        const index = Array.prototype.indexOf.call(parentOverview.children, childOverview);

        const comparisonDiv =  document.querySelector('.comparison-block')
        const childrenComparisonDiv = comparisonDiv.children;

        const previousOrder = $tabOrder

        if(index != 1) {
            childrenComparisonDiv[index].parentNode.insertBefore(childrenComparisonDiv[index], childrenComparisonDiv[index - 1]);
            childrenOfTabs[index - 1].parentNode.insertBefore(childrenOfTabs[index - 1], childrenOfTabs[index - 2]);
            const tempOrder = arrayMoveImmutable($tabOrder, index - 1, index - 2); 
            $tabOrder = tempOrder;
        }

        checkFirstPosition(previousOrder);

        // if($tabOrder[0] !== previousOrder[0]) {
        //     const tempInfo = $alphaApis.sort((a, b) => {
        //         let indexA = $tabOrder.indexOf(a.id);
        //         let indexB = $tabOrder.indexOf(b.id);
        //         return indexA - indexB;
        //     });
        //     $alphaApis = tempInfo;
        // }
        
    }

    const moveOverviewDown = () => {
        const mainTabsDiv = document.querySelector('.alphaTab')
        const childrenOfTabs = mainTabsDiv.childNodes;

        const childOverview =  document.querySelector(`.wrappedOverview${info.id}`)
        const parentOverview = childOverview.parentNode;
        const index = Array.prototype.indexOf.call(parentOverview.children, childOverview);

        const comparisonDiv =  document.querySelector('.comparison-block')
        const childrenComparisonDiv = comparisonDiv.children;

        const previousOrder = $tabOrder

        if(index != $overviewInfo.length) {
            childrenComparisonDiv[index + 1].parentNode.insertBefore(childrenComparisonDiv[index + 1], childrenComparisonDiv[index]);
            childrenOfTabs[index].parentNode.insertBefore(childrenOfTabs[index], childrenOfTabs[index - 1]);
            const tempOrder = arrayMoveImmutable($tabOrder, index - 1, index); 
            $tabOrder = tempOrder;
        }

        checkFirstPosition(previousOrder);
        
    }

    const removeTab = () => {
        const mainTabsDiv = document.querySelector('.alphaTab')
        const childrenOfTabs = mainTabsDiv.childNodes;

        const childOverview =  document.querySelector(`.wrappedOverview${info.id}`)
        const parentOverview = childOverview.parentNode;
        const index = Array.prototype.indexOf.call(parentOverview.children, childOverview);

        const comparisonDiv =  document.querySelector('.comparison-block')
        const childrenComparisonDiv = comparisonDiv.children;

        const previousOrder = $tabOrder;
        const anotherOrder = previousOrder;
        console.log(previousOrder, '1')
        comparisonDiv.removeChild(childrenComparisonDiv[index]);
        mainTabsDiv.removeChild(childrenOfTabs[index - 1]);
        $tabOrder.splice(index - 1, 1);

        console.log($tabOrder,  '2')
        console.log(previousOrder,  '3')
        console.log(anotherOrder, '4')
        if($tabOrder[0] !== previousOrder[0]) {
            const tempInfo = $alphaApis.sort((a, b) => {
                let indexA = $tabOrder.indexOf(a.id);
                let indexB = $tabOrder.indexOf(b.id);
                return indexA - indexB;
            });
            $alphaApis = tempInfo;
        }

    }

    onMount(() => {
        setTimeout(() => {
            createBarOverview(info);
        }, 1000);
    })

    // afterUpdate(() => {

    // });

</script>

<div class={`grid wrappedOverview${info.id}`}>
    <div class="buttons">
        <button on:click={() => moveOverviewUp()} class="ui icon button arrow" title="Move Tab Up"><i class="angle up icon"></i></button>
        <button on:click={() => moveOverviewDown()} class="ui icon button arrow" title="Move Tab Down"><i class="angle down icon"></i></button>
    </div>
    <div class={`container overview${info.id}`}>
    </div>
    <div>
        <button on:click={() => removeTab()} class="ui red button remove" title="Remove Tab"> <i class="minus icon"></i> </button>
    </div>
</div>

<style>
    .grid {
        display: flex;
        /* margin-bottom: 10px; */
    }
    .arrow-up {
        flex: 1;
        padding: 3px;
        border: solid black;
        border-width: 0 3px 3px 0;
        transform: rotate(-135deg);
        margin-right: 5px;
        cursor: pointer;
    }

    .arrow-down {
        flex: 1;
        padding: 3px;
        border: solid black;
        border-width: 0 3px 3px 0;
        transform: rotate(45deg);
        margin-right: 5px;
        cursor: pointer;
    }

    .arrow-fake {
        flex: 1;
        padding: 3px;
        border: none;
        border-width: 0 3px 3px 0;
        transform: rotate(45deg);
        margin-right: 8px;
    }

    .remove {
        flex: 1;
        cursor: pointer;
        margin-right: 5px;
        font-size: 6px;
    }

    .arrow {
        flex: 1;
        font-size: 7px;
    }

    .container {
        flex: 1;
        margin-right: 10px;
    }
</style>