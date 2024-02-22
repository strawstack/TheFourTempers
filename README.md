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

# Gameplay

- Enter the name of a file
- Watch rolledex animation?
    - Unclear what this is for, maybe parts of a file?
    - I'll have to think of a use for this or skip it
- Search for numbers with a behaviour
- Select this number, and select all the others adjectent to it
- The most common number in the group indicates which bin to send the group too
    - If there is a tie for most commmon number, its the number that is not present that indicates the bin
- Send the numbers to the bin
- Numbers get replaced with "normal" numbers, or fail silently and re-show original numbers
- Find and bin all numbers with behaviours to complete the file

# How to Bin

- Hold number key to open bin, bins close automatically if number is not held.
- Press "b" to send numbers to bin.
- Numbers will fail to send if bin is not open when "b" is pressed.
- Bin will stay open for duration of binning and only close after numbers enter or number key is released.