# TheFourTempers

"I have identified 4 components, which I call 'tempers' from which are derived every human soul: Woe, Frolic, Dread Malice. Each man's character is defined by the precise ratio that resides in him. I walked into the cave of my own mind and there I tamed them. Should you tame the tempers, as I did mine, then the world shall become but your appendage. It is this great and consecrated power that I hope to pass on to all of you - my children." - Keir Eagan

[Live Demo](https://strawstack.github.io/TheFourTempers/)

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
