# TODO

- fix vite build not working due to alphatab's worker

- direct comparison
  - different colors for "number of beats changed" and "something within a beat changed"
  - or color-code the levenshtein distance between old and new

- overview
  - scale to max number of bars, currently not correct
  - show all currently visible bars in tab view, not only the first
  - make overview responsive to height change
    - keep in mind legends have different height (hardcode their heights?)
  - add section labels
  - fix gray bars at the end when alignment is turned off

- tab
  - add semi-transparent rects to bars that have been added for alignment, to make them less salient

- make legend more compact by putting label next to color gradient

- add contributing.md

## Future

- audio playback
- multi-sequence alignment
- re-implement combining tabs and exporting
