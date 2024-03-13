# TheFourTempers

# Todo

- [ ] Add lumon logo top right of tempers app
- [ ] Have numbers flash (any flourecent color) if they are special, are about to move, and above a certian size.
    - This will increase the value of making numbers large when they are suspicious
- [ ] Toggle number coloring with key command
- [ ] Make zoom animated and follow mouse cursor
- [ ] 100% Completion congragulations screen

- [x] Rollodex insert custom filename
    - [x] Pause rollodex animation on target file and offer click
- [x] Fix hang bug due to many render functions
- [x] Create boot animation
    - Lines of text animate on screen
    - Logo is shown
- [x] Show "macrodata" command directly after boot animation
- [x] Show rollodex animation after filename is entered
    - Allow click on rollodex
- [x] Launch TheFourTempers app from rollodex
    - Top and bottom bars fade in 0.2s
    - Then digits animate in with opacity
- [x] On initial launch, hold off on drawing anything until font is ready. Fade in all UI quickly, then fade in digits.
    - Consider freazing inputs until app is ready
- [x] File location in bottom bar
- [x] UI in top bar
    - [x] Track global progress in top bar
- [x] On start, numbers animate onto the screen randomly (opacity from 0 to 1)
    - Not implemented: View is frozen until all numbers are showing 
- [x] Correct action should occur when numbers are sent to a bin.
    - If correct, total the new file state.
    - UI should reflect new file state.
- [x] Some numbers have behaviours (see below for details)
    - All digits have a base animation that is used to set their offset based on their current size (and cellsize).
    - These animations set a value in `state.digitOffset` which is used by render to adjust the position of numbers.
    - Special numbers have slightly different animations.
    - Selected numbers rely on their former position being saved to `state.digitOffset`.
    - When selected, aniamton is canceled, posiiton is saved, animation resumes when selection ends.
    - If numbers are sent to a bin, their position is reset when they re-appear.
- [x] When numbers animate, have them quickly move across the x-axis, and move at a constant rate in the y direction.
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

- [ ] Digits remain "excited" after correct submission.

- [x] Font loading event not called in Chrome causes blank screen on load. 
    - See: https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/loading_event 
- [Fixed I think] App hangs after some time on tempers screen because render functions are never cancelled after being invoked
- [x] Number could animate visually into the box if they were children of `screen` instead of `digitContainer`
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

# Terminal

As seen, one must enter a file name for the file they are "working on". Hash file name and procedurally generate the file.
Save file progress into local storage, and save previous file names for access by pressing up in the terminal.
Consider using an actual terminal, so player could “hack” into lumon by inspecting other files in the drive. 
For example, cell c could exit the macrodatarefinement app and enter a plain file system  

# Rolodex

Fake files with names A to Z. Scroll by in the Rolodex to fake find the one you entered.

# Generating Numbers with Behaviours

There are six numbers to find they drift to the sides periodically and wiggle. Some drift but don’t wiggle; they are false flags. Find them and group them with the ones that are moving near them. 
Value of the most common number frequency in the group indicates the bin number. There are two sets for each bin in each file. If most common number ties then pick lower numbered bin.

# How to Bin

- Hold number key to open bin, bins close automatically if number is not held.
- Press "b" to send numbers to bin.
- Numbers will fail to send (not animate) if bin is not open when "b" is pressed.
- Bin will stay open for duration of binning and only close after numbers enter or number key is released.
