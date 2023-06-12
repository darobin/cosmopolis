
# Implementation Notes

- Expose *all* platform services via window.cosmopolis + some context-management actions (for wishes) + windowing.
  Porting to Capyloon should be made easy.
- Try to use BrowserContext by making tiles *only* render at known positions inside windows.
- Try to make all communication work via centrally-managed MessagePorts and having *everything* coordinated via
  the root window. Otherwise we get some unpleasant nesting that has to talk via multiple levels and it gets
  increasingly obscure which boundaries are being crossed.
