
# Data & Stores

This needs to be heavily store-driven, otherwise it can only be spaghetti.

The sidebar will show:

- Search
  - Saved searches, if any
- Social
  - Accounts
    - Lists
- Library
  - A tree
- Apps

The route needs to reflect:

- Which of those spaces we're in.
- Inside them, which feed is being displayed
- If a feed is being displayed, which tile if any is being shown

If a tile is shown, wishes may be active but since they rely on data that cannot readily be persisted in a route
wishes are not reflected in the route.

## Search

- loadSavedSearches()
- saveSearch(details)
- deleteSavedSearch(id)
- showNewSearch()
- doSearch(details) (also used to show a saved search)
- showSearchResult(url)

## Social

- loadSocialAccounts()
- addSocialAccount()
- saveSocialAccount(details)
- deleteSocialAccount(id)
- showSocialAccountFeed(id)
- listSocialAccountLists(id)
- showSocialAccountListFeed(id, id)
- showSocialPost(url)
- NOTE: faving something posts that fave to social

## Library

- loadLibraryTree()
- saveLibraryTree(tree) (this is big and dumb but it'll do for now)
- showLibraryFeed(id) (the leaves are feeds, you just see folders)
- NOTE:
  - bookmarked items go to the library's Inbox — until they're moved
  - bookmarked items that expose a wish go into apps (the icon should be different)

## Apps

- loadInstalledApps()
- saveLibraryTree(tree) (this is big and dumb but it'll do for now)
- showLibraryFeed(id) (the leaves are feeds, you just see folders)
- NOTE:
  - it should be possible to list wishes that can't be launched on their own
    separately from apps

## Tiles in general

- bookmarkTile(url)
- unbookmarkTile(url)
- faveTile(url, account)
- unfaveTile(url, account)
- postTile(url, account)
- showWishSelector(params)
- cancelWishSelector()
- selectWish(wish, params)
- cancelWish(wish)
- grantWish(wish, params)

## UI State in general

We maintain state for the titlebar, sidebar, and layout positions.

- showSideBar()
- hideSideBar()
- showFeed(type, source) — the type decides the rendering (and therefore width), it gets painted at 0,0
- showTile(url) — we need to manage offset
- unsure how to manage selectors and wishes
