
# TODO

## Plumbing

- [x] Set up basic Tauri app and get it to render a simple HTML page
- [ ] Use the HTML page to figure out what the story is in terms of import and all that crap
- [ ] Wire reloading shortcut
- [ ] Expose a simple Rust function to the front end
- [ ] Set up the VS Code debug stuff as per Tauri docs

## Contexts

- [ ] Persistent store so that the context list is persistent
- [ ] Shoelace and lit system set up
- [ ] Background
- [ ] Sidebar, semitranslucent, list of contexts
- [ ] Close/delete context
- [ ] Rename context

## Tiles

- [ ] Define the tile format by trying to create the right kind of content and pushing/retrieving it over Web3.Storage
  - [ ] Make that a simple lib that we can test directly easily
  - [ ] Use Iroh to retrieve and path into a tile, to check that it really works
- [ ] Add Iroh
- [ ] Loading Iroh into the app, without running a node
- [ ] Implement protocol handler for tile:
  - [ ] just map the getting with pathing all that
  - [ ] also have a way of retrieving the metadata
- [ ] Build the ua-tile component that render and test it
  - [ ] Render just the metadata
  - [ ] Render the content, with various chrome options

## Columns

- [ ] Create component for columns
- [ ] Add columns: context background when empty or floating to the right
- [ ] Autoresize to content

## ActivityPub

- [ ] Map out the basic operations that we want to support, notably having a list of feeds
- [ ] Map that model to what we do with Web3.Storage and implement that as a simple library that can stand on its own (all JS)
- [ ] Components that can automatically implement rendering for that model
- [ ] Use w3name service for mutability


## Contexts, Refined

- [ ] Archiving contexts
- [ ] Listing archived contexts
- [ ] Context filter at top of list, with keyboard shortcut
- [ ] Keyboard shortcut to show context list, cycle between contexts
- [ ] Animation (smooth transition) when a context is added, removed, jumped to

## Columns, Refined

- [ ] Sorting and filtering
