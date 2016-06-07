import {ingest, prev_init} from './Tuple';
import {isFunction} from './util/Objects';
import {functor} from './util/Functions';
import {array} from './util/Arrays';

export function isChangeSet(v) {
  return v && v.constructor === changeset;
}

export default function changeset() {
  var add = [],  // insert tuples
      rem = [],  // remove tuples
      mod = [],  // modify tuples
      remp = [], // remove by predicate
      modp = []; // modify by predicate

  return {
    constructor: changeset,
    insert: function(t) {
      add.push.apply(add, array(t));
      return this;
    },
    remove: function(t) {
      var a = isFunction(t) ? remp : rem;
      a.push.apply(a, array(t));
      return this;
    },
    modify: function(t, field, value) {
      var m = {field: field, value: functor(value)};
      if (isFunction(t)) m.filter = t, modp.push(m);
      else m.tuple = t, mod.push(m);
      return this;
    },
    pulse: function(pulse, tuples) {
      var out, i, n, m, f, t, id;

      // add
      for (i=0, n=add.length; i<n; ++i) {
        pulse.add.push(ingest(add[i]));
      }

      // remove
      for (out={}, i=0, n=rem.length; i<n; ++i) {
        t = rem[i];
        out[t._id] = t;
      }
      for (i=0, n=remp.length; i<n; ++i) {
        f = remp[i];
        tuples.forEach(function(t) {
          if (f(t)) out[t._id] = t;
        });
      }
      for (id in out) pulse.rem.push(out[id]);

      // modify
      function modify(t, f, v) {
        prev_init(t, pulse.stamp);
        t[f] = v(t);
        out[t._id] = t;
      }
      for (out={}, i=0, n=mod.length; i<n; ++i) {
        m = mod[i];
        modify(m.tuple, m.field, m.value);
        pulse.modifies(m.field);
      }
      for (i=0, n=modp.length; i<n; ++i) {
        m = modp[i];
        f = m.filter;
        tuples.forEach(function(t) {
          if (f(t)) modify(t, m.field, m.value);
        });
        pulse.modifies(m.field);
      }
      for (id in out) pulse.mod.push(out[id]);

      return pulse;
    }
  };
}