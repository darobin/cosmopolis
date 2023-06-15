
# Implementation Notes

OVERALL: This client needs to become the meeting point for all experimentation with a new web. We can use opportunities like Bluesky
to leapfrog: it's a client, and then more. *Write the strategy brief*.

- Expose *all* platform services via window.cosmopolis + some context-management actions (for wishes) + windowing.
  Porting to Capyloon should be made easy.
- Try to use BrowserContext by making tiles *only* render at known positions inside windows.
- Try to make all communication work via centrally-managed MessagePorts and having *everything* coordinated via
  the root window. Otherwise we get some unpleasant nesting that has to talk via multiple levels and it gets
  increasingly obscure which boundaries are being crossed.

## TODO

- [x] new index to replace lab
  - [x] add a custom title bar
- [x] start exposing nanostores
  - [ ] set up routing
  - [ ] set up every store listed in data
- [ ] Rename get/set pref to be about storing data, and document the schema
- [ ] new side bar
  - [ ] button to open
  - [ ] add each section
  - [ ] load data for each section
  - [ ] action wiring for each section
- [ ] The bookmark button should have an optional drop down to pick the location. Also maybe don't call it bookmark,
      more like save or file away.
- [ ] Define tile format based on content claims and implement that.

## Misc Futures

- UCAN Pay: UCAN+ILP
  UCAN Invocation (https://github.com/ucan-wg/invocation/blob/v0.2/README.md) might pair very well with ILP Paid HTTP
  APIs (https://github.com/interledger/rfcs/blob/master/0014-paid-http-apis/0014-paid-http-apis.md).
  UCAN Pay Efficiently with ILP — UCAN-PEI!
