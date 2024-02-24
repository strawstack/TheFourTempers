# TheFourTempers

# Todo

- [ ] Some numbers have behaviours

- [x] Implement precise animations
    - Numbers get sent to bin
    - Four tempers pop up 0.2s
    - Numbers begin to fade back in (1s)
    - Four tempers pop down 0.2s
    - Bin closes (unless key is held)
- [x] Implement bins visually
- [x] Implement bin open and close on number press
- [x] Implement: digits do not animate unless bin is open
- [x] Implement: bin stays open until numbers finish animating
- [x] Implement digit selection
- [x] Selected characters animate to roughly bin location on bin command
- [x] Make characters near cursor become larger
- [x] Create state in js and have render syncs the DOM
    - Ex: create `baseFont` variable in js and, inside render, update the CSS variable
- [x] Implement min/max number of col/row as seen in the show
- [x] Get document animated scrolling working with wasd

# Bugs

- [ ] Number could animate visually into the box if they were children of `screen` instead of `digitContainer`
    - But the math for their position will have to be reworked for this to happen.
    - Fix: The height of the top_bot_section needs to be subtracted from the digitContainer top offset .
- [ ] Bin sometimes closes after number fade-in even if bin open key is still held.
- [x] When view is scrolled down, numbers don't animate to correct bin location.
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
