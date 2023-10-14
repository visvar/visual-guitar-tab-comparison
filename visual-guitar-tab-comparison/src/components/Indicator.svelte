<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    onMount(() => {
      const svg = d3.select('#vertical-rect-container');
  
      svg
        .append('rect')
        .attr('x', 50) // Adjust the x-coordinate as needed
        .attr('y', 10) // Adjust the y-coordinate as needed
        .attr('width', 5) // Adjust the width as needed
        .attr('height', 5) // Set the height to 500px
        .attr('fill', 'blue'); // Set the fill color as desired
    });
</script>
  
<svg id="vertical-rect-container" width="100" height="30"></svg>