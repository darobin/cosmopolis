
export function makeKeyUpMatcher (sc, cb) {
  return makeKeyMatcher('keyup', sc, cb);
}

export function makeKeyDownMatcher (sc, cb) {
  return makeKeyMatcher('keydown', sc, cb);
}

export function makeKeyMatcher (type, sc, cb) {
  const parts = sc.split(/[+-]/);
  const key = parts.pop().toLowerCase();
  const modifiers = {
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
  };
  parts.forEach(p => {
    p = p.toLowerCase();
    if (p === 'cmd') p = 'meta';
    const mod = `${p}Key`;
    if (typeof modifiers[mod] !== 'boolean') console.warn(`Unknown command modifier ${p}.`);
    modifiers[mod] = true;
  });
  return (evt) => {
    if (type !== evt.type) return;
    if (key.toLowerCase() !== evt.key) return;
    let badMod = false;
    Object.keys(modifiers).forEach(mod => {
      if (evt[mod] !== modifiers[mod]) badMod = true;
    });
    if (badMod) return;
    cb();
  };
}
