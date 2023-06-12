
# Implementation Notes

- Expose *all* platform services via window.cosmopolis + some context-management actions (for wishes) + windowing.
  Porting to Capyloon should be made easy.
- Try to use BrowserContext by making tiles *only* render at known positions inside windows.
- Try to make all communication work via centrally-managed MessagePorts and having *everything* coordinated via
  the root window. Otherwise we get some unpleasant nesting that has to talk via multiple levels and it gets
  increasingly obscure which boundaries are being crossed.

## TODO

- [ ] new index to replace lab
  - [ ] add a custom title bar
- [ ] start exposing nanostores
  - [ ] set up routing
  - [ ] set up every store listed in data
- [ ] new side bar
  - [ ] button to open
  - [ ] add each section
  - [ ] load data for each section
  - [ ] action wiring for each section
