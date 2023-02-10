
export function makeKeyUpMatcher (sc, cb) {
  return makeKeyMatcher('keyUp', sc, cb);
}

export function makeKeyDownMatcher (sc, cb) {
  return makeKeyMatcher('keyDown', sc, cb);
}

export function makeKeyMatcher (type, sc, cb) {
  const parts = sc.split(/[+-]/);
  const key = parts.pop().toLowerCase();
  const modifiers = {
    shift: false,
    control: false,
    meta: false,
    alt: false,
  };
  parts.forEach(p => {
    p = p.toLowerCase();
    if (p === 'ctrl') p = 'control';
    if (p === 'cmd') p = 'meta';
    if (typeof modifiers[p] !== 'boolean') console.warn(`Unknown command modifier ${p}.`);
    modifiers[p] = true;
  });
  return (evt, input) => {
    if (type !== input.type) return;
    if (key !== input.key) return;
    let badMod = false;
    Object.keys(modifiers).forEach(mod => {
      if (input[mod] !== modifiers[mod]) badMod = true;
    });
    if (badMod) return;
    cb();
  };
}
