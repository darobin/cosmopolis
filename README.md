# cosmopolis

you'd forgotten why you loved the web

## Setup

This is all kinds of very early. It will almost certainly break and fail you.

- Run the usual `npm install`
- The best way to run this is then probably `npm run watch`. Note that because ESM and because we can't
  have nice things, autoreload of the frontend works but not the backend. I might fix that later because
  it's annoying.

Once it's running, you need to load a dev tile. There's one under `demos/basic`. Just click the button and
pick the directory.

You can make your own dev tile. They have to have a `manifest.json`, preferably with `name` and `icons`.
And they have to have an `index.html`.

*That's it!*

## Development

The first time you run this, you need to run `npm run build-assets` so that you have the assets you need
to run this.
