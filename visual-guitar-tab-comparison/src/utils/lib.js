import { StringBased, Utils } from 'musicvis-lib'
import { fretMeasurements } from './variables'
import * as druid from '@saehrimnir/druidjs'
import * as d3 from 'd3'
import { NWaligner } from 'seqalign'
// import _ from 'lodash'

export function getDistanceMatrix (noteCollection) {
  let finalCollection = []
  noteCollection.forEach((collectionTrack) => {
    let tempCollection = []
    collectionTrack.forEach((bar) => {
      let barCollection = []
      bar.map((notes) => {
        barCollection.push(`${notes.string} ${notes.fret}`)
      })
      tempCollection.push(barCollection)
    })
    finalCollection.push(tempCollection)
  })
  //**************************** */
  const flattenedArr = finalCollection.flat()
  const distanceMatrix = Array(flattenedArr.length).fill().map(() => Array(flattenedArr.length).fill(0))
  for (let i = 0; i < flattenedArr.length; i++) {
    for (let j = i; j < flattenedArr.length; j++) {
      const distance = StringBased.Levenshtein.levenshtein(flattenedArr[i], flattenedArr[j])
      distanceMatrix[i][j] = distance
      distanceMatrix[j][i] = distance
    }
  }
  return Utils.normalizeNdArrayNegative(distanceMatrix)
}

/**
 * Uses dimensionality reduction (MDS) to map distances to colors
 * @param {*} distMatrix
 * @returns {string[]} colors
 */
export function getColorsViaMDSFromDistances (distMatrix) {
  if (distMatrix.length === 0) { return [] }
  // DR
  const DR = new druid.MDS(distMatrix)
    .parameter("d", 1)
    .parameter("metric", "precomputed")
    .transform()
  const points = DR.map((d) => d[0])
  const scaleColor = d3.scaleLinear().domain(d3.extent(points)).range([0, 1])
  return points.map((d) => d3.interpolateWarm(scaleColor(d)))
}

export function getDensityVector (noteCollection) {
  let finalCollection = []
  noteCollection.forEach((collectionTrack) => {
    collectionTrack.forEach((bar) => {
      finalCollection.push(bar.length)
    })
  })
  return finalCollection
}

export function getFretSpans (collection) {
  let finalCollection = []

  collection.forEach(collectionTrack => {
    collectionTrack.forEach(bar => {
      let filteredData = bar.filter(d => typeof d.fret === 'number' && d.fret !== 0)
      let min = d3.min(filteredData, d => +d.fret)
      let max = d3.max(filteredData, d => +d.fret)
      let fretSpan
      fretSpan = max - min
      if (!fretSpan) {
        fretSpan = 0
      }
      finalCollection.push(fretSpan)
    })
  })

  return finalCollection
}

export function getStringSwap (collection) {
  let finalCollection = []

  collection.forEach(collectionTrack => {
    collectionTrack.forEach(bar => {
      let filteredData = bar.filter(d => typeof d.string === 'number')
      let swapping = 0
      let previousString = ''
      filteredData.forEach((note, i) => {
        if (note.isChord === '0' && note.string !== previousString && i > 0) {
          let stringDistanceDiff = Math.abs(note.string - previousString)
          swapping = swapping + stringDistanceDiff
          // swapping++
        }
        previousString = note.string
      })
      finalCollection.push(swapping)
    })
  })

  return finalCollection
}

export function getFretSpansInCm (collection) {
  let finalCollection = []

  collection.forEach(collectionTrack => {
    collectionTrack.forEach(bar => {
      let filteredData = bar.filter(d => typeof d.fret === 'number' && d.fret !== 0)
      let min = d3.min(filteredData, d => +d.fret)
      let max = d3.max(filteredData, d => +d.fret)
      let fretSpan = 0
      fretMeasurements.map((element) => {
        if (element.fret >= min && element.fret <= max) {
          fretSpan = fretSpan + element.measure
        }
      })
      if (!fretSpan) {
        fretSpan = 0
      }
      finalCollection.push(fretSpan)
    })
  })

  return finalCollection

}

export function oneOnOneComparison (collection) {
  let finalCollection = []
  // console.log(collection, 'initial collection')

  //https://stackoverflow.com/questions/4587061/how-to-determine-if-object-is-in-array
  //https://lodash.com/docs#isEqual
  //https://stackoverflow.com/questions/17053043/create-a-svg-rectangle-filled-with-different-background-color-by-percentage-or-p
  //https://stackoverflow.com/questions/39023154/how-to-make-a-color-gradient-bar-using-d3js

  const firstCollection = collection[0]
  const rest = collection.slice(1)

  for (let i = 0; i < rest.length; i++) {
    let extraNotes = []
    if (firstCollection.length <= rest[i].length) {
      for (let j = 0; j < firstCollection.length; j++) {
        let barElement = rest[i][j]
        barElement.map((element) => {
          if (typeof element.fret === 'number') {
            let color = getOneOnOneColor(element, firstCollection[j])
            if (color !== '') {
              element['color'] = color
              extraNotes.push(element)
            }
          }
        })
        // firstCollection[j].map((element) => {
        //   let isEqual = containsObject(element, barElement);
        //   if(isEqual) {
        //     element['color'] = 'red'
        //     extraNotes.push(element)
        //   }
        // })
      }
    } else {
      for (let j = 0; j < rest[i].length; j++) {
        let barElement = rest[i][j]
        barElement.map((element) => {
          if (typeof element.fret === 'number') {
            let color = getOneOnOneColor(element, firstCollection[j])
            if (color !== '') {
              element['color'] = color
              extraNotes.push(element)
            }
          }
        })
        // firstCollection[j].map((element) => {
        //   let isEqual = containsObject(element, barElement);
        //   if(isEqual) {
        //     element['color'] = 'red'
        //     extraNotes.push(element)
        //   }
        // })
      }
    }
    finalCollection.push(extraNotes)
  }

  // console.log(finalCollection, 'la final!!!')
  return finalCollection
}

export function getTechniquesColors (noteCollection) {
  let finalCollection = []

  noteCollection.forEach((collectionTrack) => {
    let tempCollection = []
    collectionTrack.forEach((bar) => {
      let barCollection = []

      bar.map((notes) => {
        if (notes.bendStyle > 0 || notes.bendType > 0) {
          barCollection.push('#e41a1c')
        }
        if (notes.hammerPullOrigin != null) {
          barCollection.push('#377eb8')
        }
        if (notes.harmonicType > 0 || notes.harmonicValue > 0) {
          barCollection.push('#4daf4a')
        }
        if (notes.isDead) {
          barCollection.push('#984ea3')
        }
        if (notes.isPalmMute) {
          barCollection.push('#ff7f00')
        }
        if (notes.isStaccato) {
          barCollection.push('#ffff33')
        }
        if (notes.slideOrigin != null || notes.slideTarget != null) {
          barCollection.push('lightblue')
        }
        if (notes.isGhost) {
          barCollection.push('lime')
        }
        if (notes.tap) {
          barCollection.push('pink')
        }
        if (notes.slap) {
          barCollection.push('gray')
        }
        if (notes.hasRasgueado) {
          barCollection.push('black')
        }
        if (notes.hasWhammyBar) {
          barCollection.push('#ccc')
        }
        if (notes.hasVibrato) {
          barCollection.push('#333')
        }
      })
      if (barCollection.length == 0) {
        // does not contain techniques
        tempCollection.push(['white'])
      } else {
        // keep colors unique and sorted
        let uniqueColors = [...new Set(barCollection)]
        tempCollection.push(uniqueColors.sort())
      }
    })
    finalCollection.push(tempCollection)
  })
  // console.log(finalCollection, 'finaaaaal')
  return finalCollection

}

function containsObject (obj, list) {
  var i
  for (i = 0; i < list.length; i++) {
    if (list[i].string !== obj.string && list[i].fret !== obj.fret && list[i].beat !== obj.beat) {
      return true
    }
  }
  return false
}

function getOneOnOneColor (obj, list) {
  var i

  // console.log(obj, 'this is the object')
  // console.log(list, 'this is the list')
  for (i = 0; i < list.length; i++) {
    // if (list[i].string === obj.string && list[i].fret !== obj.fret && list[i].beat === obj.beat && list[i].isChord === obj.isChord) {
    //   return 'orange'
    // }
    if (list[i].isChord === '1' && obj.isChord === '1') {
      if (list[i].string === obj.string && list[i].fret !== obj.fret && list[i].beat === obj.beat) {
        return 'blue'
      }
    } else {
      if (list[i].string !== obj.string && list[i].fret !== obj.fret && list[i].beat === obj.beat) {
        return 'blue'
      }
    }
    // if (list[i].string === obj.string && list[i].fret === obj.fret && list[i].beat === obj.beat && list[i].isChord === obj.isChord) {
    //   return ''
    // }
    // if (_.isEqual(list[i], obj)) {
    //   return 'blue'
    // }
  }
  return ''
  // if (!list.includes(obj)) {
  //   return 'blue';
  // } else {
  //   return '';
  // }
}

export function getColorsForComparison (collection, length) {
  // console.log(collection, 'coleciooon')
  // console.log(length, 'lengthhhhh')

  const result = []
  let resultSorted = []

  for (let i = 0; i < length; i++) {
    const colors = []

    collection.forEach(item => {
      if (item.barNumber === i) {
        colors.push(item.color)
      }
    })

    if (colors.length === 0) {
      colors.push('white')
    }

    result.push(colors)
  }

  result.map((element) => {
    resultSorted.push(element.sort())
  })

  // console.log((resultSorted))
  return resultSorted
}

export function getColorsFromCriteria (array, criteria) {
  // const colorRange = ["#b3f4ff", "#0e00cc"];
  // const colorScale = d3.scaleLinear().domain(d3.extent(vector)).range(colorRange);
  const vector = Utils.normalizeNdArrayNegative(array)
  const scaleColor = d3.scaleLinear().domain(d3.extent(vector)).range([0, 1])
  // return vector.map((d) => d3.interpolateWarm(scaleColor(d)))
  if (criteria === 'density') {
    return vector.map((d => d3.interpolateBlues(scaleColor(d))))
  } else if (criteria === 'fret span') {
    return vector.map((d => d3.interpolateYlOrRd(scaleColor(d))))
  } else if (criteria === 'string change') {
    return vector.map((d => d3.interpolateReds(scaleColor(d))))
  } else if (criteria === 'fret span in mm') {
    return vector.map((d => d3.interpolateYlOrRd(scaleColor(d))))
  }
}

export function getAlignmentNotes (collection, colors) {
  let finalCollection = []
  let finalColors = []

  collection.forEach((collectionTrack) => {
    let tempCollection = []
    collectionTrack.forEach((bar) => {
      let barCollection = []
      bar.map((notes) => {
        barCollection.push(`${notes.string} ${notes.fret}`)
      })
      tempCollection.push(barCollection.join(' '))
    })
    finalCollection.push(tempCollection)
  })

  finalCollection.forEach((collection, i) => {
    let colorScale = colors.splice(0, collection.length)
    finalColors.push(colorScale)
  })
  const largestArray = finalColors.reduce((prev, current) => {
    if (current.length > prev.length) {
      return current
    } else {
      return prev
    }
  })

  let tempAlignments = []
  const customAligner = NWaligner({ inDelScore: -3, gapSymbol: '-', })

  finalColors.forEach((element, i) => {
    const customResult = customAligner.align(largestArray, element)
    tempAlignments.push({
      id: i,
      alignment: extractColorsAndDashes(customResult.alignedSequences[1])
    })
  })

  return tempAlignments

}

function extractColorsAndDashes (str) {
  const regex = /(rgb\(\d{1,3}, \d{1,3}, \d{1,3}\))|-/g
  return str.match(regex)
}

export function areArraysEqual (arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false
  }
  for (let i = 0; i < arr1.length; i++) {
    if (!deepEqual(arr1[i], arr2[i])) {
      return false
    }
  }
  return true
}

function deepEqual (obj1, obj2) {
  if (obj1 === obj2) {
    return true
  }
  if (typeof obj1 !== "object" || typeof obj2 !== "object" || obj1 === null || obj2 === null) {
    return false
  }
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  if (keys1.length !== keys2.length) {
    return false
  }
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false
    }
  }
  return true
}

// export function nwAlignment(colors1, colors2) {
//   const gapPenalty = -1; // Penalty for gaps
//   const mismatchPenalty = -1; // Penalty for color mismatches

//   const matrix = [];

//   // Initialize the matrix with zeros
//   for (let i = 0; i <= colors1.length; i++) {
//     matrix[i] = [];
//     for (let j = 0; j <= colors2.length; j++) {
//       matrix[i][j] = 0;
//     }
//   }

//   // Fill in the matrix
//   for (let i = 1; i <= colors1.length; i++) {
//     for (let j = 1; j <= colors2.length; j++) {
//       const match = colors1[i - 1] === colors2[j - 1] ? 1 : mismatchPenalty;
//       const diagonal = matrix[i - 1][j - 1] + match;
//       const top = matrix[i - 1][j] + gapPenalty;
//       const left = matrix[i][j - 1] + gapPenalty;

//       matrix[i][j] = Math.max(diagonal, top, left);
//     }
//   }

//   // Trace back the alignment
//   const alignment = [];
//   let i = colors1.length;
//   let j = colors2.length;

//   console.log(matrix)

//   while (i > 0 && j > 0) {
//     const current = matrix[i][j];
//     const diagonal = matrix[i - 1][j - 1];
//     const top = matrix[i - 1][j];
//     const left = matrix[i][j - 1];

//     if (current === diagonal + (colors1[i - 1] === colors2[j - 1] ? 1 : mismatchPenalty)) {
//       alignment.unshift([i - 1, j - 1]);
//       i--;
//       j--;
//     } else if (current === top + gapPenalty) {
//       alignment.unshift([i - 1, '-']);
//       i--;
//     } else if (current === left + gapPenalty) {
//       alignment.unshift(['-', j - 1]);
//       j--;
//     }
//   }


//   while (i > 0) {
//     alignment.unshift([i - 1, '-']);
//     i--;
//   }

//   while (j > 0) {
//     alignment.unshift(['-', j - 1]);
//     j--;
//   }

//   return alignment;
// }

/****************************************************************************************************************** */

export function nwAlignment (colors1, colors2) {
  const gapPenalty = -1 // Penalty for gaps
  const mismatchPenalty = -1 // Penalty for color mismatches
  const matrix = []
  // Initialize the matrix with zeros
  for (let i = 0; i <= colors1.length; i++) {
    matrix[i] = []
    for (let j = 0; j <= colors2.length; j++) {
      matrix[i][j] = 0
    }
  }
  // Fill in the matrix
  for (let i = 1; i <= colors1.length; i++) {
    for (let j = 1; j <= colors2.length; j++) {
      const match = colors1[i - 1] === colors2[j - 1] ? 1 : mismatchPenalty
      const diagonal = matrix[i - 1][j - 1] + match
      const top = matrix[i - 1][j] + gapPenalty
      const left = matrix[i][j - 1] + gapPenalty

      matrix[i][j] = Math.max(diagonal, top, left)
    }
  }
  // Trace back the alignment
  const alignment = []
  let i = 0
  let j = 0
  while (i < colors1.length && j < colors2.length) {
    const current = matrix[i + 1][j + 1]
    const diagonal = matrix[i][j]
    const top = matrix[i][j + 1]
    const left = matrix[i + 1][j]
    if (current === diagonal + (colors1[i] === colors2[j] ? 1 : mismatchPenalty)) {
      alignment.push([i, j])
      i++
      j++
    } else if (current === top + gapPenalty) {
      alignment.push([i, '-'])
      j++
    } else if (current === left + gapPenalty) {
      alignment.push(['-', j])
      i++
    }
  }
  while (i < colors1.length) {
    alignment.push([i, '-'])
    i++
  }
  while (j < colors2.length) {
    alignment.push(['-', j])
    j++
  }
  return alignment
}
