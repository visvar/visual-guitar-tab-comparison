import { writable } from "svelte/store"

export const tabRoutes = writable([])

// For navigation purposes on tabDisplay component
export const selectedBar = writable(1)

export const overviewInfo = writable([])

export const selectedCriteria = writable('similarity')

export const previousCriteria = writable('')

export const dataModel = writable([])

export const tabOrder = writable([])

export const alphaApis = writable([])

export const selectedTracks = writable([])

// For highlight the var in overview
export const currentBar = writable(0)

export const apiAlignments = writable([])

export const originalTabSizes = writable([])

export const legendInfo = writable({})

export const selectedTechniques = writable([])

export const selectedPanelLayout = writable('vertical')

export const alignmentActivated = writable(false)

export const maxNumberOfBars = writable(0)
