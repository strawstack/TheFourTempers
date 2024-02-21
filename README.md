# TheFourTempers

# Todo

- [ ] Implement digit selection
- [ ] Selected characters animate to roughly bin location on bin command
- [ ] Numbers animate and move

- [x] Make characters near cursor become larger
- [x] Create state in js and have render syncs the DOM
    - Ex: create `baseFont` variable in js and, inside render, update the CSS variable 
- [x] Implement min/max number of col/row as seen in the show
- [x] Get document animated scrolling working with wasd 

# Bugs

- [x] When mouse is static over numbers and digitContainer scrolls, mouse position does not update.
    - Mouse should technically be considered as moving while digits scroll past it.
- [x] On low zooms, the magnified characters overlap 