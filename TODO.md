# TODO

- fix direct comparison
  - quick fix: just compare bar, if not the same mark blue
  - if number of beats changed, just color the whole bar blue
  - compare all beats, if v2 has more beats than v1 just say "something has been added"
- store the max umber of bars for all versions in store.js

- in overview, show currently visible bars in tab view, not only the first
- make overview responsive to height change
  - keep in mind legends have different height (hardcode their heights?)
- make overview scale more controlled, eg do not scale font size
  - scale to max number of bars, currently not correct
- add section labels
- add contributing.md
- add semi-transparent rects to bars that have been added for alignment, to make them less salient
  - does currently not work
- make legend more compact by putting label next to color gradient

- fix gray bars at the end when alignment is off

## Future

- audio playback
- multi-sequence alignment
- re-implement combining tabs and exporting
