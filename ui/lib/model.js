
const registry = {};
const subscriberQueue = [];

// This is a global registry of all the stores. The idea is to manage stores in the same
// way that custom elements are managed. Throws if the store is already registered.
export function registerStore (name, store) {
  if (registry[name]) throw new Error(`Store "${name}" already registered.`);
  registry[name] = store;
}

// Returns a store given the name, to be used anywhere.
export function getStore (name) {
  if (!registry[name]) throw new Error(`Store "${name}" not found.`);
  return registry[name];
}

// Get a store's name.
export function getStoreName (store) {
  return Object.keys(registry).find(n => registry[n] === store);
}

// --- What follows is largely taken from Svelte (https://svelte.dev/docs#readable). Thanks Rich!

// Creates a read-only store.
//  - `value` is the initial value, which may be null/undefined.
//  - `start` is a function that gets called when the first subscriber subscribes. It is called with a
//    `set` function which can then be called with the new value whenever it is updated. This means that
//    start can set up monitoring of some other state and call `set` whenever there is change. It must also
//    return a `stop` function that will get called when the last subscriber unsubscribes.
// Returns an object with .subscribe(cb) exposed as an API, where `cb` will received the value when
// it changes. This method returns a function to call to unsubscribe.
// Example:
//        const time = readable(null, set => {
//        	set(new Date());
//        	const interval = setInterval(() => {
//        		set(new Date());
//        	}, 1000);
//        	return () => clearInterval(interval);
//        });
export function readable (value, start) {
  return { subscribe: writable(value, start).subscribe };
}

// Creates a regular read/write store.
// The parameters are the same as for `readable`.
// It returns an object with:
//  - .subscribe(cb), which is the same as for readable()
//  - .set(val) which sets the store's value directly
//  - .update(updater) which gets a function that receives the value and returns it updated
// Example:
//      const count = writable(0, () => {
//      	console.log('got a subscriber');
//      	return () => console.log('no more subscribers');
//      });
//      count.set(1); // does nothing
//      const unsubscribe = count.subscribe(value => {
//      	console.log(value);
//      }); // logs 'got a subscriber', then '1'
//      count.update(n => n + 1); // logs '2'
//      unsubscribe(); // logs 'no more subscribers'
export function writable (value, start = () => {}) {
  let stop
    , subs = []
    , set = (newValue) => {
        if (safeNotEqual(value, newValue)) {
          value = newValue;
          if (stop) { // store is ready
            let runQueue = !subscriberQueue.length;
            subs.forEach(s => {
              s[1]();
              subscriberQueue.push(s, value);
            });
            if (runQueue) {
              for (let i = 0; i < subscriberQueue.length; i += 2) {
                subscriberQueue[i][0](subscriberQueue[i + 1]);
              }
              subscriberQueue.length = 0;
            }
          }
        }
      }
    , update = (fn) => set(fn(value))
    , subscribe = (run, invalidate = () => {}) => {
        let subscriber = [run, invalidate];
        subs.push(subscriber);
        if (subs.length === 1) stop = start(set) || (() => {});
        run(value);
        return () => {
          let index = subs.indexOf(subscriber);
          if (index !== -1) subs.splice(index, 1);
          if (subs.length === 0) {
            stop();
            stop = null;
          }
        };
      }
  ;
  return { set, update, subscribe };
}

// Reads a store once
export function get (store) {
  if (!store) return;
  let value;
  const unsub = store.subscribe(v => value = v)();
  unsub();
  return value;
}

export function derived (stores, fn, initialValue) {
  if (!Array.isArray(stores)) stores = [stores];
  let auto = fn.length < 2;

  return readable(initialValue, (set) => {
    let inited = false
      , values = []
      , pending = 0
      , noop = () => {}
      , cleanup = noop
      , sync = () => {
          if (pending) return;
          cleanup();
          let result = fn(values, set);
          if (auto) set(result);
          else cleanup = typeof result === 'function' ? result : noop;
        }
      , unsubscribers = stores.map((store, i) => store.subscribe(
          (value) => {
            values[i] = value;
            pending &= ~(1 << i);
            if (inited) sync();
          },
          () => pending |= (1 << i)
        ))
    ;

    inited = true;
    sync();

    return function stop () {
      unsubscribers.forEach(fun => fun());
      cleanup();
    };
  });
}

// Equality function stolen from Svelte
function safeNotEqual (a, b) {
  return a != a ? b == b : a !== b ||
    (
      (a && typeof a === 'object') ||
      typeof a === 'function'
    );
}

// --- end svelte-inspired section

// Creates a store that can fetch from HTTP.
// The value this store captures is from an HTTP result. It is structured thus:
//  - state:
//  - error: error message, if any
//  - errorCode: error code, if any
//  - value: the value returned
// This API expects the server to send back some JSON, with the following structure:
//  - ok: true | false
//  - error and errorCode: as above
//  - data: the value
// export function fetchable (url, value = {}) {
//   if (!value.state) value.state = 'unknown';
//   let load = (set) => {
//         let xhr = new XMLHttpRequest();
//         xhr.addEventListener('load', () => {
//           try {
//             let { ok, error, errorCode, data } = xhr.responseText
//               ? JSON.parse(xhr.responseText)
//               : {}
//             ;
//             if (xhr.status < 400) return set({ state: ok ? 'loaded' : 'error', error, errorCode, data });
//             return set({ state: 'error', error: error || xhr.statusText, errorCode: errorCode || xhr.status });
//           }
//           catch (err) {
//             return set({ state: 'error', error: err.message || err.toString(), errorCode: 'exception' });
//           }
//         });
//         xhr.addEventListener('error', () => {
//           set({ state: 'error', error: 'Network-level error', errorCode: 'network' });
//         });
//         xhr.addEventListener('progress', (evt) => {
//           let { lengthComputable, loaded, total } = evt;
//           set({ state: 'loading', lengthComputable, loaded, total });
//         });
//         xhr.open('GET', url);
//         set({ state: 'loading', lengthComputable: false, loaded: 0, total: 0 });
//         xhr.send();
//         // this will only actually stop anyting if it's really long
//         return () => xhr.abort();
//       }
//     , { subscribe, set } = writable(value, load)
//     , reload = () => {
//         set({ state: 'unknown' });
//         return load(set);
//       }
//   ;
//   return { subscribe, reload };
// }
