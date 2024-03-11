# Lumonal

A terminal that acts as an outer shell for TheFourTempers app.

# Todo

- [ ] Add a `macrodata` command to bash.
    - Command fails unless one is in the correct directory.
    - Command "takes over the shell" and prompts one to enter a file name.
    - This command is run as default on launch of the app.
- [ ] Allow `macrodata` command to be cancelled by ctrl-c
- [ ] Place "hidden files"
- [ ] Calculate best character width given "devicetopixelratio"
      - non high def screens may end up getting some characters cut off
      - Example: set the ratio to 1 and observe

# Bugs

- [ ] 
- [ ] Last command inserts blank commands the more commands that are entered
- [x] `clear` command enlarges font when canvas is drawn back to view.
    - I could swap out this system of scrolling for simply retyping characters.
    - Alternatively, do some investigation to determine what coord systems are used by ctx.drawImage()
