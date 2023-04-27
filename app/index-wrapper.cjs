
const { protocol, app } = require('electron');

// I don't fully understand why but the esm load wrapper, together with the delayed import (which we can't await)
// mean that whatever needs to be called before app init has to be called here.

// I am not clear at all as to what the privileges mean. They are listed at
// https://www.electronjs.org/docs/latest/api/structures/custom-scheme but that is harldy
// informative. https://www.electronjs.org/docs/latest/api/protocol#protocolregisterschemesasprivilegedcustomschemes
// is pretty clear that the behaviour we want requires at least `standard`.
// const privileges = {
//   standard: true,
//   secure: false,
//   bypassCSP: false,
//   allowServiceWorkers: false,
//   supportFetchAPI: true,
//   corsEnabled: false,
//   stream: true,
// };
// protocol.registerSchemesAsPrivileged([
//   { scheme: 'ipfs', privileges },
//   { scheme: 'ipns', privileges },
// ]);
// XXX RE-ENABLE THE ABOVE FOR SCHEMES
app.enableSandbox();


require = require('esm')(module);
module.exports = import("./index.js");
