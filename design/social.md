
# Social Implementation

One way to approach this would be to have the server proxy XRPC routes to the Bluesky
server, to use app logins, and to just intercept some routes for the kind of content
that we understand.

From earlier notes:
    The idea is simple: piggyback on Bluesky with tiles.
    My hope is that we can just use the PDS with a different
    record type, but I'm not sure that it'll take it. Worth
    trying https://atproto.com/guides/applications#repo-crud
    await api.com.atproto.repo.createRecord({
      repo: 'alice.com',
      type: 'it.mycopunk.cerulean' // instead of 'app.bsky.post'
    }, {
      cid: 'some CID uploaded on W3.Storage or whatever',
      createdAt: (new Date()).toISOString()
    })
    - currently the bsky.app PDS rejects all unknown types
    - but it looks like people have been making their own
      PDSs
    - and people have been building their own clients, so…
    - it should be possible to put these two things together
      and to create a forked version that based on tiles
