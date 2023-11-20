<script>
  import { onMount, afterUpdate } from 'svelte';
  // TODO: imported in index.html to fix vite build
  // import * as alphaTab from '@coderline/alphatab';
  import * as d3 from 'd3';
  import {
    selectedBar,
    tabRoutes,
    overviewInfo,
    selectedCriteria,
    previousCriteria,
    dataModel,
    tabOrder,
    alphaApis,
    selectedTracks,
    apiAlignments,
    originalTabSizes,
    legendInfo,
    alignmentActivated,
    maxNumberOfBars,
    visibleBarIndices,
  } from '../store/store';
  import {
    getDistanceMatrix,
    getColorsViaMDSFromDistances,
    getDensityVector,
    getColorsFromCriteria,
    getFretSpans,
    getStringSwap,
    getFretSpansInCm,
    oneOnOneComparison,
    getColorsForComparison,
    getAlignmentNotes,
    getTechniquesColors,
  } from '../utils/lib';

  import BeatNoteSelector from './BeatNoteSelector.svelte';
  import OneOnOneLegend from './OneOnOneLegend.svelte';
  import { addMasterBar, addBar } from '../utils/alphaCustomLib';

  let wrapper;

  // Zoom variables
  const defaultZoom = 70;
  let zoom = defaultZoom;
  const zoomScale = 10;

  // Bar width variables
  const defaultBarWidth = 250;
  let barWidth = defaultBarWidth;
  const barWidthScale = 25;

  // Variables to bind to components
  let main;
  let api;
  let svg;
  let apis = [];
  let customApi;

  // Settings to render AlphaTab
  const settings = {
    importer: {
      // TODO: maybe useful for multiple voices
      // mergePartGroupsInMusicXml: true
    },
    display: {
      layoutMode: 'horizontal',
      stretchForce: 1,
      StaveProfile: 'Tab',
      scale: defaultZoom / 100,
      systemsLayoutMode: 'UseModelLayout',
      padding: [20, 0, 20, 0], // Reduces whitespace between each tab
    },
    core: {
      fontDirectory: './alphatabFont/',
      // useWorkers: false, // breaks vite dev
      // scriptFile: '', // TODO: might fix build fail?
      includeNoteBounds: true,
    },
    notation: {
      elements: {
        // https://www.alphatab.net/docs/reference/settings/notation/elements/
        effectTempo: false,
        effectText: false,
        effectLetRing: false,
        effectMarker: false,
        scoreTitle: false,
        scoreSubTitle: false,
        scoreArtist: false,
        scoreAlbum: false,
        scoreWords: false,
        scoreMusic: false,
        scoreWordsAndMusic: false,
        scoreCopyright: false,
        guitarTuning: true,
        // guitarTuning: false,
        trackNames: false,
      },
    },
  };

  let noteCollections = [];
  let colors = [];
  let colorsForZoom = [];

  // let previousCriteria;
  let previousRoutes = $tabRoutes;
  let previousSelectedTracks = $selectedTracks;

  //value for Beat or Note selection
  let beatNoteSelection = [];

  const handleTabColoring = () => {
    if (noteCollections.length !== 0) {
      //Empty arrays for new settings
      colorsForZoom = [];
      $overviewInfo = [];
      if ($selectedCriteria === 'similarity') {
        const matrix = getDistanceMatrix(noteCollections);
        colors = getColorsViaMDSFromDistances(matrix);
      } else if ($selectedCriteria === 'density') {
        const dVector = getDensityVector(noteCollections);
        colors = getColorsFromCriteria(dVector, $selectedCriteria);
        $legendInfo.minForLegend = d3.min(dVector);
        $legendInfo.maxForLegend = d3.max(dVector);
        $legendInfo.colorScaleForLegend = d3.interpolateBlues;
      } else if ($selectedCriteria === 'fret span') {
        const sVector = getFretSpans(noteCollections);
        colors = getColorsFromCriteria(sVector, $selectedCriteria);
        $legendInfo.minForLegend = d3.min(sVector);
        $legendInfo.maxForLegend = d3.max(sVector);
        $legendInfo.colorScaleForLegend = d3.interpolateYlOrRd;
      } else if ($selectedCriteria === 'string change') {
        const ssVector = getStringSwap(noteCollections);
        colors = getColorsFromCriteria(ssVector, $selectedCriteria);
        $legendInfo.minForLegend = d3.min(ssVector);
        $legendInfo.maxForLegend = d3.max(ssVector);
        $legendInfo.colorScaleForLegend = d3.interpolateReds;
      } else if ($selectedCriteria === 'fret span in mm') {
        const ssVector = getFretSpansInCm(noteCollections);
        colors = getColorsFromCriteria(ssVector, $selectedCriteria);
        $legendInfo.minForLegend = d3.min(ssVector);
        $legendInfo.maxForLegend = d3.max(ssVector);
        $legendInfo.colorScaleForLegend = d3.interpolateYlOrRd;
      } else if ($selectedCriteria === 'techniques') {
        colors = getTechniquesColors(noteCollections);
        // console.log(colors, 'colooooors')
      } else if ($selectedCriteria === '1 on 1 comparison') {
        let markedNotes = oneOnOneComparison(noteCollections);
        Promise.all(
          apis.map((element, i) => {
            let size = $originalTabSizes.find((size) => size.id === element.id);
            let api = element.content;
            api.render();
            return waitForSvg(svg, main).then((svg) => {
              let colorScale = [];
              if (i !== 0) {
                let colorsForMarks = markedNotes[i - 1];
                colorScale = getColorsForComparison(colorsForMarks, size.size);
                // console.log(colorScale, 'colorscaaaale')
                setTimeout(() => {
                  colorizeNotes(api, colorsForMarks, element.id);
                }, 500);
              } else {
                for (let iterator = 0; iterator < size.size; iterator++) {
                  const innerArray = ['white'];
                  colorScale.push(innerArray);
                }
              }
              return {
                id: i,
                y: api.renderer.boundsLookup._masterBarLookup.entries().next()
                  .value[1].lineAlignedBounds.y,
                height: api.canvasElement.element.clientHeight,
                width: api.canvasElement.element.clientWidth,
                numberOfBars: api.renderer.boundsLookup._masterBarLookup.size,
                colors: colorScale,
              };
            });
          })
        )
          .then((info) => {
            // Order information of overview for better display according to the tab
            const tempInfo = info.sort((a, b) => {
              let indexA = $tabOrder.indexOf(a.id);
              let indexB = $tabOrder.indexOf(b.id);
              return indexA - indexB;
            });

            const filteredInfo = tempInfo.filter((item) =>
              $tabOrder.includes(item.id)
            );
            $overviewInfo = filteredInfo;
          })
          .catch((error) => {
            console.error(error);
          });
      }
      //Loop through all the apis and render them
      if ($selectedCriteria !== '1 on 1 comparison') {
        Promise.all(
          apis.map((element, i) => {
            let size = $originalTabSizes.find((size) => size.id === element.id);
            let api = element.content;
            api.render();
            return waitForSvg(svg, main).then((svg) => {
              if ($selectedCriteria != 'techniques') {
                const colorScale = colors.splice(0, size.size);
                colorsForZoom.push(colorScale);
                colorizeBars(api, svg, element.id, colorScale);
                return {
                  id: element.id,
                  y: api.renderer.boundsLookup._masterBarLookup.entries().next()
                    .value[1].lineAlignedBounds.y,
                  height: api.canvasElement.element.clientHeight,
                  width: api.canvasElement.element.clientWidth,
                  numberOfBars: size.size,
                  colors: colorScale,
                };
              } else {
                // console.log(colors[i], 'colooooors')
                colorizeBars(api, svg, element.id, []);
                return {
                  id: element.id,
                  y: api.renderer.boundsLookup._masterBarLookup.entries().next()
                    .value[1].lineAlignedBounds.y,
                  height: api.canvasElement.element.clientHeight,
                  width: api.canvasElement.element.clientWidth,
                  numberOfBars: size.size,
                  colors: colors[i],
                };
              }
            });
          })
        )
          .then((info) => {
            // $overviewInfo = info;
            // Order information of overview for better display according to the tab
            const tempInfo = info.sort((a, b) => {
              let indexA = $tabOrder.indexOf(a.id);
              let indexB = $tabOrder.indexOf(b.id);
              return indexA - indexB;
            });

            const filteredInfo = tempInfo.filter((item) =>
              $tabOrder.includes(item.id)
            );
            $overviewInfo = filteredInfo;
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  };

  // re-color when metric changes
  selectedCriteria.subscribe(() => {
    handleTabColoring();
  });

  alphaApis.subscribe((elements) => {
    if ($selectedCriteria === '1 on 1 comparison') {
      $overviewInfo = [];
      let markedNotes = oneOnOneComparison(noteCollections);
      Promise.all(
        elements.map((element, i) => {
          let size = $originalTabSizes.find((size) => size.id === element.id);
          let api = element.content;
          api.render();
          return waitForSvg(svg, main).then((svg) => {
            let colorScale = [];
            if (i !== 0) {
              let colorsForMarks = markedNotes[i - 1];
              colorScale = getColorsForComparison(colorsForMarks, size.size);
              setTimeout(() => {
                colorizeNotes(api, colorsForMarks, element.id);
              }, 500);
            } else {
              for (let iterator = 0; iterator < size.size; iterator++) {
                const innerArray = ['white'];
                colorScale.push(innerArray);
              }
            }
            return {
              id: element.id,
              y: api.renderer.boundsLookup._masterBarLookup.entries().next()
                .value[1].lineAlignedBounds.y,
              height: api.canvasElement.element.clientHeight,
              width: api.canvasElement.element.clientWidth,
              numberOfBars: api.renderer.boundsLookup._masterBarLookup.size,
              colors: colorScale,
            };
          });
        })
      )
        .then((info) => {
          // Order information of overview for better display according to the tab
          const tempInfo = info.sort((a, b) => {
            let indexA = $tabOrder.indexOf(a.id);
            let indexB = $tabOrder.indexOf(b.id);
            return indexA - indexB;
          });

          const filteredInfo = tempInfo.filter((item) =>
            $tabOrder.includes(item.id)
          );
          $overviewInfo = filteredInfo;
        })
        .catch((error) => {
          console.error(error);
        });
    }
  });
  //Metod to wait to render SVG Tab from AlphaTab
  const waitForSvg = (svg, element) => {
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (element && element.getElementsByTagName) {
          svg = element.getElementsByTagName('svg')[0];
        }
        if (svg) {
          clearInterval(intervalId);
          resolve(svg);
        }
      }, 500);
    });
  };

  const handleBeatNoteSelection = (event) => {
    beatNoteSelection = event.detail;
    let beats = false;
    let notes = false;
    if (beatNoteSelection.includes('beat')) {
      beats = true;
    }
    if (beatNoteSelection.includes('note')) {
      notes = true;
    }

    if (!beats) {
      let beatsRects = d3.selectAll('.isChord1');
      beatsRects.attr('fill', 'none').attr('stroke', 'none');
    } else {
      let beatsRects = d3.selectAll('.isChord1');
      beatsRects._groups[0].forEach((element) => {
        let rect = d3.select(element);
        let color = [...rect._groups[0][0].classList].slice(-1)[0];
        rect
          .attr('fill', color)
          .attr('stroke', color)
          .attr('fill-opacity', 0.1);
      });
    }
    if (!notes) {
      let notesRects = d3.selectAll('.isChord0');
      notesRects.attr('fill', 'none').attr('stroke', 'none');
    } else {
      let notesRects = d3.selectAll('.isChord0');
      notesRects._groups[0].forEach((element) => {
        let rect = d3.select(element);
        let color = [...rect._groups[0][0].classList].slice(-1)[0];
        rect
          .attr('fill', color)
          .attr('stroke', color)
          .attr('fill-opacity', 0.1);
      });
    }
  };

  const colorizeNotes = (api, markedNotes, id) => {
    // let sequence = $apiAlignments.find((element) => element.id === id);
    const bars = d3
      .select(api.canvasElement.element)
      .append('svg')
      .attr('width', api.canvasElement.element.clientWidth)
      .attr('height', api.canvasElement.element.clientHeight);
    markedNotes.map((note, i) => {
      bars
        .append('rect')
        .attr(
          'class',
          `coloredMeasure measure${note.barNumber} isChord${note.isChord} ${note.color}`
        )
        .attr('x', note.x - 3)
        .attr('y', note.y)
        .attr('width', note.w + 5)
        .attr('height', note.h - 5)
        .attr('rx', note.isChord === '0' ? 20 : 4)
        .attr('fill', note.color)
        .attr('stroke', note.color)
        .attr('fill-opacity', 0.1);
    });
  };

  // Method to colorize bars
  const colorizeBars = (api, svg, id, colors) => {
    let sequence = $apiAlignments.find((element) => element.id === id);
    const bars = d3
      .select(api.canvasElement.element)
      .append('svg')
      .attr('width', api.canvasElement.element.clientWidth)
      .attr('height', api.canvasElement.element.clientHeight);

    d3.select(svg).selectAll('.coloredMeasure').remove();
    const masterBars = api.renderer.boundsLookup._masterBarLookup;

    let realColorCount = 0;
    let measureCount = 0;
    for (let [key, value] of masterBars) {
      if ($alignmentActivated) {
        /* This is in case empty bars are added */
        if (sequence.alignment[key] !== '-') {
          const measures = value.realBounds;
          bars
            .append('rect')
            .attr('class', `coloredMeasure measure${key} version${id}`)
            .attr('x', measures.x)
            .attr('y', measures.y)
            .attr('width', measures.w - 2)
            .attr('height', measures.h)
            .attr(
              'fill',
              $selectedCriteria !== 'techniques'
                ? colors[realColorCount]
                : 'white'
            )
            .attr('stroke', '#aaa')
            .attr('stroke-width', 1)
            .attr('rx', 6)
            .attr('fill-opacity', 0.2);
          realColorCount++;
        } else {
          // Colors empty bars
          const measures = value.realBounds;
          bars
            .append('rect')
            .attr('class', `coloredMeasure measure${key} version${id}`)
            .attr('x', measures.x)
            .attr('y', measures.y)
            .attr('width', measures.w - 2)
            .attr('height', measures.h)
            .attr('fill', 'white') // TODO: does not correctly hide the bar
            .attr('stroke', 'none')
            .attr('fill-opacity', 1);
        }
        measureCount++;
      } else {
        /* This is in case empty bars are not added */
        const measures = value.realBounds;
        bars
          .append('rect')
          .attr('class', `coloredMeasure measure${key} version${id}`)
          .attr('x', measures.x)
          .attr('y', measures.y)
          .attr('width', measures.w - 2)
          .attr('height', measures.h)
          .attr(
            'fill',
            $selectedCriteria !== 'techniques' ? colors[key] : 'white'
          )
          .attr('stroke', '#aaa')
          .attr('stroke-width', 1)
          .attr('rx', 6)
          .attr('fill-opacity', 0.2);
      }
    }
  };

  /**
   * Get notes by bar, with all techniques and other information
   * @param bars
   */
  const getNotes = (bars) => {
    // console.log(bars)
    let totalBars = [];
    for (let [key, value] of bars) {
      value.bars.forEach((barElement) => {
        barElement.beats.forEach((beat, beatNumber) => {
          if (beat.notes === null) {
            // no notes
            totalBars = [
              ...totalBars,
              {
                barNumber: key,
                fret: '',
                string: '',
                bendStyle: 0,
                bendType: 0,
                hammerPullOrigin: null,
                harmonicType: 0,
                harmonicValue: 0,
                isDead: false,
                isPalmMute: false,
                isStaccato: false,
                slideOrigin: null,
                slideTarget: null,
                isGhost: false,
                tap: false,
                slap: false,
                hasRasgueado: false,
                hasWhammyBar: false,
                isChord: '',
                beat: beatNumber,
                x: '',
                y: '',
                w: '',
                h: '',
              },
            ];
          } else if (beat.notes.length === 1) {
            // single note in beat
            beat.notes.forEach((noteElement) => {
              totalBars = [
                ...totalBars,
                {
                  barNumber: key,
                  fret: noteElement.note.fret,
                  string: noteElement.note.string,
                  bendStyle: noteElement.note.bendStyle,
                  bendType: noteElement.note.bendType,
                  hammerPullOrigin: noteElement.note.hammerPullOrigin,
                  harmonicType: noteElement.note.harmonicType,
                  harmonicValue: noteElement.note.harmonicValue,
                  isDead: noteElement.note.isDead,
                  isPalmMute: noteElement.note.isPalmMute,
                  isStaccato: noteElement.note.isStaccato,
                  slideOrigin: noteElement.note.slideOrigin,
                  slideTarget: noteElement.note.slideTarget,
                  isGhost: noteElement.note.isGhost,
                  tap: noteElement.beatBounds.beat.tap,
                  slap: noteElement.beatBounds.beat.slap,
                  hasRasgueado: noteElement.beatBounds.beat.hasRasgueado,
                  hasWhammyBar: noteElement.beatBounds.beat.hasWhammyBar,
                  hasVibrato: noteElement.beatBounds.beat.vibrato > 0,
                  isChord: '0',
                  beat: beatNumber,
                  x: noteElement.noteHeadBounds.x,
                  y: noteElement.noteHeadBounds.y,
                  w: noteElement.noteHeadBounds.w,
                  h: noteElement.noteHeadBounds.h,
                },
              ];
            });
          } else {
            // multiples notes in beat - harmony/chord
            beat.notes.forEach((noteElement) => {
              totalBars = [
                ...totalBars,
                {
                  barNumber: key,
                  fret: noteElement.note.fret,
                  string: noteElement.note.string,
                  bendStyle: noteElement.note.bendStyle,
                  bendType: noteElement.note.bendType,
                  hammerPullOrigin: noteElement.note.hammerPullOrigin,
                  harmonicType: noteElement.note.harmonicType,
                  harmonicValue: noteElement.note.harmonicValue,
                  isDead: noteElement.note.isDead,
                  isPalmMute: noteElement.note.isPalmMute,
                  isStaccato: noteElement.note.isStaccato,
                  slideOrigin: noteElement.note.slideOrigin,
                  slideTarget: noteElement.note.slideTarget,
                  isGhost: noteElement.note.isGhost,
                  tap: noteElement.beatBounds.beat.tap,
                  slap: noteElement.beatBounds.beat.slap,
                  hasRasgueado: noteElement.beatBounds.beat.hasRasgueado,
                  hasWhammyBar: noteElement.beatBounds.beat.hasWhammyBar,
                  hasVibrato: noteElement.beatBounds.beat.vibrato > 0,
                  isChord: '1',
                  beat: beatNumber,
                  x: noteElement.noteHeadBounds.x,
                  y: noteElement.noteHeadBounds.y,
                  w: noteElement.noteHeadBounds.w,
                  h: noteElement.noteHeadBounds.h,
                },
              ];
            });
          }
        });
      });
    }

    const groups = [];
    for (const obj of totalBars) {
      const barNum = obj.barNumber;
      if (!groups[barNum]) {
        groups[barNum] = [];
      }
      groups[barNum].push({
        barNumber: obj.barNumber,
        fret: obj.fret,
        string: obj.string,
        bendStyle: obj.bendStyle,
        bendType: obj.bendType,
        hammerPullOrigin: obj.hammerPullOrigin,
        harmonicType: obj.harmonicType,
        harmonicValue: obj.harmonicValue,
        isDead: obj.isDead,
        isPalmMute: obj.isPalmMute,
        isStaccato: obj.isStaccato,
        slideOrigin: obj.slideOrigin,
        slideTarget: obj.slideTarget,
        isGhost: obj.isGhost,
        isChord: obj.isChord,
        tap: obj.tap,
        slap: obj.slap,
        hasRasgueado: obj.hasRasgueado,
        hasWhammyBar: obj.hasWhammyBar,
        hasVibrato: obj.vibrato,
        beat: obj.beat,
        x: obj.x,
        y: obj.y,
        w: obj.w,
        h: obj.h,
      });
    }
    return groups;
  };

  const handleZoom = (operation) => {
    if (operation === '+') {
      zoom = zoom + zoomScale;
    }
    if (operation === '-') {
      zoom = zoom - zoomScale;
    }
    apis.forEach((element, i) => {
      let api = element.content;
      api.settings.display.scale = zoom / 100;
      api.updateSettings();
      api.render();
      waitForSvg(svg, main).then((svg) => {
        const bars = api.tracks[0].staves[0].bars;
        if (colorsForZoom.length != 0) {
          if (bars.length > 400) {
            setTimeout(() => {
              colorizeBars(api, svg, element.id, colorsForZoom[i]);
            }, 500);
          } else {
            colorizeBars(api, svg, element.id, colorsForZoom[i]);
          }
        }
      });
    });

    if ($selectedCriteria === '1 on 1 comparison') {
      setTimeout(() => {
        colorizeNotesforBarUpdate();
      }, 1000);
    }
  };

  const colorizeNotesforBarUpdate = () => {
    let notesForOne = [];
    apis.forEach((api) => {
      const notes = getNotes(
        api.content.renderer.boundsLookup._masterBarLookup
      );
      notesForOne.push(notes);
    });
    let markedNotes = oneOnOneComparison(notesForOne);
    Promise.all(
      apis.map((element, i) => {
        let size = $originalTabSizes.find((size) => size.id === element.id);
        let api = element.content;
        api.render();
        return waitForSvg(svg, main).then((svg) => {
          let colorScale = [];
          if (i !== 0) {
            let colorsForMarks = markedNotes[i - 1];
            colorScale = getColorsForComparison(colorsForMarks, size.size);
            setTimeout(() => {
              colorizeNotes(api, colorsForMarks, element.id);
            }, 500);
          } else {
            for (let iterator = 0; iterator < size.size; iterator++) {
              const innerArray = ['white'];
              colorScale.push(innerArray);
            }
          }
          return {
            id: i,
            y: api.renderer.boundsLookup._masterBarLookup.entries().next()
              .value[1].lineAlignedBounds.y,
            height: api.canvasElement.element.clientHeight,
            width: api.canvasElement.element.clientWidth,
            numberOfBars: api.renderer.boundsLookup._masterBarLookup.size,
            colors: colorScale,
          };
        });
      })
    )
      .then((info) => {
        // Order information of overview for better display according to the tab
        const tempInfo = info.sort((a, b) => {
          let indexA = $tabOrder.indexOf(a.id);
          let indexB = $tabOrder.indexOf(b.id);
          return indexA - indexB;
        });
        const filteredInfo = tempInfo.filter((item) =>
          $tabOrder.includes(item.id)
        );
        $overviewInfo = filteredInfo;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Works with alphaTab version 1.3.0-alpha.677
  const adjustBarWidth = () => {
    apis.map((element, i) => {
      let api = element.content;
      const bars = api.tracks[0].staves[0].bars;
      bars.forEach((bar) => {
        bar.displayWidth = defaultBarWidth;
      });
      api.render();
    });
  };

  // Works with alphaTab version 1.3.0-alpha.677
  const handleBarWidth = async (operation) => {
    if (operation === '+') {
      barWidth = barWidth + barWidthScale;
    }
    if (operation === '-') {
      barWidth = barWidth - barWidthScale;
    }
    apis.map((element, i) => {
      let api = element.content;
      const bars = api.tracks[0].staves[0].bars;
      bars.forEach((bar) => {
        bar.displayWidth = barWidth;
      });
      api.render();
      waitForSvg(svg, main).then((svg) => {
        if (colorsForZoom.length != 0) {
          if (bars.length > 400) {
            setTimeout(() => {
              colorizeBars(api, svg, element.id, colorsForZoom[i]);
            }, 500);
          } else {
            colorizeBars(api, svg, element.id, colorsForZoom[i]);
          }
        }
      });
    });
    if ($selectedCriteria === '1 on 1 comparison') {
      setTimeout(() => {
        colorizeNotesforBarUpdate();
      }, 1000);
    }
  };

  /**
   * Write the maximum number of bars for all versions to the store
   */
  const storeMaxNumberOfBars = () => {
    if ($alignmentActivated) {
      $maxNumberOfBars = d3.max($apiAlignments, (d) => d.alignment.length);
    } else {
      $maxNumberOfBars = d3.max(noteCollections, (d) => d.length);
    }
  };

  const renderTabs = async (routes) => {
    routes.forEach((route, i) => {
      const apiSettings = {
        ...settings, // copy the settings object
        // file: route, // set the file property to the current route
      };
      api = new alphaTab.AlphaTabApi(main, apiSettings);
      api.load(route.buffer);
      $selectedTracks.forEach((element) => {
        if (i === element.api) {
          api.renderTracks([
            api.score.tracks.find((e) => e.name === element.name),
          ]);
        }
      });
      // push the new api to the apis array
      apis.push({
        id: route.id,
        content: api,
      });
    });
    // Create an array to hold all the promises returned by the forEach loop
    const promises = apis.map((element, i) => {
      let api = element.content;
      return new Promise((resolve) => {
        api.renderFinished.on(() => {
          waitForSvg(svg, main).then((svg) => {
            // Get the notes and store them in the notesArray array
            const notes = getNotes(api.renderer.boundsLookup._masterBarLookup);
            $dataModel = [...$dataModel, api.tracks[0].staves[0].bars];
            // Resolve the promise with the note collection
            resolve(notes);
            $originalTabSizes = [
              ...$originalTabSizes,
              {
                id: element.id,
                size: api.tracks[0].staves[0].bars.length,
              },
            ];
          });
        });
      });
    });

    // Wait for all the promises to resolve
    noteCollections = await Promise.all(promises);
    const matrix = getDistanceMatrix(noteCollections);
    let colors = getColorsViaMDSFromDistances(matrix);
    $apiAlignments = getAlignmentNotes(noteCollections, colors);
    $alphaApis = apis;
    if ($alignmentActivated) {
      testAddBar();
    }
    adjustBarWidth();
    handleTabColoring();
    storeMaxNumberOfBars();
  };

  const clearTabs = () => {
    apis.forEach((api) => {
      api.content.destroy();
    });
    apis = [];
  };

  const defineFirstTabOrder = (tabs) => {
    tabs.forEach((route, i) => {
      $tabOrder = [...$tabOrder, i];
    });
  };

  let timer = null;
  /**
   * Update the bars currently visible in the tab view, so the overview can draw the indicator
   */
  const updateVisibleBarsinStore = () => {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      const coloredBars = d3.selectAll(`.coloredMeasure`).nodes();
      if (coloredBars.length <= 0) {
        return;
      }
      const visibleBars = coloredBars.filter((element) => {
        const rect = element.getBoundingClientRect();
        return (
          rect.left <= window.innerWidth && // Check if it's within the horizontal viewport
          rect.right >= 0 && // Check if it's within the horizontal viewport
          rect.top <= window.innerHeight && // Check if it's within the vertical viewport
          rect.bottom >= 0 // Check if it's within the vertical viewport
        );
      });
      const barIndices = visibleBars.map((d) => {
        const measureClass = [...d.classList].filter((c) =>
          c.startsWith('measure')
        )[0];
        return +measureClass.substring(7);
      });
      $visibleBarIndices = d3.extent(barIndices);
    }, 500);
  };

  onMount(async () => {
    renderTabs($tabRoutes);
    defineFirstTabOrder($tabRoutes);
    alignmentActivated.subscribe(() => {
      clearTabs();
      renderTabs($tabRoutes);
    });
    // Method to get the bar store variable and know where to navigate
    selectedBar.subscribe((bar) => {
      const el = document.querySelector(`.measure${bar}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  afterUpdate(async () => {
    if (
      $tabRoutes !== previousRoutes ||
      $selectedTracks !== previousSelectedTracks
    ) {
      colors = [];
      colorsForZoom = [];
      zoom = defaultZoom;
      barWidth = defaultBarWidth;
      previousRoutes = $tabRoutes;
      previousSelectedTracks = $selectedTracks;
      $selectedCriteria = 'similarity';
      $previousCriteria = '';
      $overviewInfo = [];
      $tabOrder = [];
      $apiAlignments = [];
      clearTabs();
      renderTabs($tabRoutes);
      defineFirstTabOrder($tabRoutes);
      adjustBarWidth();
    }
  });

  /**
   * Add bars for alignment
   */
  const testAddBar = () => {
    apis.map((api) => {
      let sequence = $apiAlignments.find((element) => element.id === api.id);
      let referenceBar = api.content.tracks[0].staves[0].bars[1];
      let totalBars = api.content.tracks[0].staves[0].bars;
      let reversedBars = totalBars.reverse();
      let referenceScore = referenceBar.staff.track.score;
      referenceScore.masterBars = [];
      let referenceStaff = referenceBar.staff;
      referenceStaff.bars = [];
      for (let i = 0; i < sequence.alignment.length; i++) {
        if (sequence.alignment[i] === '-') {
          let temporalScore = referenceScore;
          let temporalStaff = referenceStaff;
          let newBar = new alphaTab.model.Bar();
          newBar.clef = referenceBar.clef;
          newBar.clefOttava = referenceBar.clefOttava;
          newBar.simileMark = referenceBar.simileMark;
          let amountOfVoices = referenceBar.voices.length;
          referenceScore = addMasterBar(
            new alphaTab.model.MasterBar(),
            temporalScore,
            i
          );
          // Insert same amount of voices from past bar
          for (let j = 0; j < amountOfVoices; j++) {
            newBar.addVoice(new alphaTab.model.Voice());
            newBar.voices[j].addBeat(new alphaTab.model.Beat());
          }
          referenceStaff.bars = addBar(newBar, temporalStaff, i);
        } else {
          let temporalScore = referenceScore;
          let temporalStaff = referenceStaff;
          let newBar = reversedBars.pop();
          referenceScore = addMasterBar(
            new alphaTab.model.MasterBar(),
            temporalScore,
            i
          );
          referenceStaff.bars = addBar(newBar, temporalStaff, i);
        }
      }
      api.content.score = referenceScore;
      api.content.tracks[0].staves[0].bars = referenceStaff.bars;
      api.content.render();
    });
  };

  // TODO: FH: re-introduce this feature
  const testDownload = () => {
    const exporter = new alphaTab.exporter.Gp7Exporter();
    const data = exporter.export(customApi.score, customApi.settings);
    const a = document.createElement('a');
    a.download = `${customApi?.score?.title || 'File'}.gp`;
    a.href = URL.createObjectURL(new Blob([data]));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /**
   * Turn scrolling into horizontal scrolling
   * @param evt
   */
  const handleMouseWheel = (evt) => {
    evt.preventDefault();
    wrapper.scrollLeft += 2 * evt.deltaY;
  };
</script>

<div class="main-container">
  <div class="customize-container">
    <div class="bar-size-container">
      bar width
      <button
        on:click="{() => {
          handleBarWidth('-');
        }}"
        disabled="{barWidth === 100}"
      >
        -
      </button>
      <button
        on:click="{() => {
          handleBarWidth('+');
        }}"
      >
        +
      </button>
    </div>
    <div class="zoom-container">
      zoom
      <button
        on:click="{() => {
          handleZoom('-');
        }}"
      >
        -
      </button>
      <button
        on:click="{() => {
          handleZoom('+');
        }}"
      >
        +
      </button>
    </div>
  </div>
  <div>
    {#if $selectedCriteria === '1 on 1 comparison'}
      <div class="one-on-one-legend">
        <div>
          <OneOnOneLegend />
        </div>
        <div>
          <BeatNoteSelector on:selectedOptions="{handleBeatNoteSelection}" />
        </div>
      </div>
    {/if}
  </div>
  <!-- <div>
    <button on:click={() => {
      testDownload()
    }}>test</button>
  </div> -->
  <div class="content-container">
    <div
      class="tab-container"
      bind:this="{wrapper}"
      on:scroll="{updateVisibleBarsinStore}"
      on:mousewheel="{handleMouseWheel}"
    >
      <div bind:this="{main}"></div>
      <!-- <div data-tex="true" bind:this='{customMain}'>1.3</div> -->
    </div>
  </div>
</div>

<style>
  .content-container {
    display: flex;
    column-gap: 5px;
  }

  .tab-container {
    width: 100%;
    overflow-y: auto;
    overflow-x: scroll;
  }
  .customize-container {
    display: flex;
    align-items: center;
    margin: 10px 10px 0 10px;
  }
  .customize-container button {
    padding: 0 8px 2px 8px;
  }
  .zoom-container {
    display: flex;
    flex: 1;
    justify-content: flex-end;
  }

  .one-on-one-legend {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
