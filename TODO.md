# TODO

- overview
  - mark all bars currently visible in tab view, not only the first
  - make overview responsive to height change
    - keep in mind legends have different height (hardcode their heights?)
  - add section labels
  - fix gray bars at the end when alignment is turned off
  - add `<title>` with metric value so legend is not that necessary

- tab
  - add semi-transparent rects to bars that have been added for alignment, to make them less salient
    - for some reason this does currently not work

- direct comparison
  - color bars in tab view as well?
    - encode the levenshtein distance between old and new?
  - different colors for "number of beats changed" and "something within a beat changed"

- techniques
  - add vibrato and whammybar (hasWhammyBar), stored in alphaTab's model within each beat

- make legend more compact by putting label next to color gradient

- audio playback

- multi-sequence alignment

- re-implement combining tabs and exporting
