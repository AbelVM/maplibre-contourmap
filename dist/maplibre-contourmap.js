const T = (a, v, C, y) => {
  const M = C.reduce((m, g) => `importScripts('${g}');
        `, ""), f = `
            ${M}
            onmessage = async o => {
                let _func = ${a.toString()};
                postMessage(await _func.apply(null,[o]));
                ${!y}? 'self.close();}':'}'
            }`, d = URL.createObjectURL(new Blob([f], { type: "text/javascript" })), P = new Worker(d);
  return P.onmessage = v, P;
}, G = async (a) => {
  let v;
  function C(e, t, r = {}) {
    const o = { type: "Feature" };
    return (r.id === 0 || r.id) && (o.id = r.id), r.bbox && (o.bbox = r.bbox), o.properties = t || {}, o.geometry = e, o;
  }
  function y(e, t, r = {}) {
    for (const o of e) {
      if (o.length < 4)
        throw new Error(
          "Each LinearRing of a Polygon must have 4 or more Positions."
        );
      if (o[o.length - 1].length !== o[0].length)
        throw new Error("First and last Position are not equivalent.");
      for (let s = 0; s < o[o.length - 1].length; s++)
        if (o[o.length - 1][s] !== o[0][s])
          throw new Error("First and last Position are not equivalent.");
    }
    return C({
      type: "Polygon",
      coordinates: e
    }, t, r);
  }
  function M(e, t = {}) {
    const r = { type: "FeatureCollection" };
    return t.id && (r.id = t.id), t.bbox && (r.bbox = t.bbox), r.features = e, r;
  }
  function f(e, t) {
    let r = !1;
    return M(
      g(
        e.features.map((o) => {
          const s = {
            x: o.geometry.coordinates[0],
            y: o.geometry.coordinates[1]
          };
          return t ? s.z = o.properties[t] : o.geometry.coordinates.length === 3 && (r = !0, s.z = o.geometry.coordinates[2]), s;
        })
      ).map((o) => {
        const s = [o.a.x, o.a.y], i = [o.b.x, o.b.y], n = [o.c.x, o.c.y];
        let c = {};
        return r ? (s.push(o.a.z), i.push(o.b.z), n.push(o.c.z)) : c = {
          a: o.a.z,
          b: o.b.z,
          c: o.c.z
        }, y([[s, i, n, s]], c);
      })
    );
  }
  var d = class {
    constructor(e, t, r) {
      this.a = e, this.b = t, this.c = r;
      const o = t.x - e.x, s = t.y - e.y, i = r.x - e.x, n = r.y - e.y, c = o * (e.x + t.x) + s * (e.y + t.y), l = i * (e.x + r.x) + n * (e.y + r.y), h = 2 * (o * (r.y - t.y) - s * (r.x - t.x));
      let z, F;
      this.x = (n * c - s * l) / h, this.y = (o * l - i * c) / h, z = this.x - e.x, F = this.y - e.y, this.r = z * z + F * F;
    }
  };
  function P(e, t) {
    return t.x - e.x;
  }
  function m(e) {
    let t = e.length, r, o, s, i, n;
    e:
      for (; t; )
        for (o = e[--t], r = e[--t], s = t; s; )
          if (n = e[--s], i = e[--s], r === i && o === n || r === n && o === i) {
            e.splice(t, 2), e.splice(s, 2), t -= 2;
            continue e;
          }
  }
  function g(e) {
    if (e.length < 3)
      return [];
    e.sort(P);
    let t = e.length - 1;
    const r = e[t].x, o = e[0].x;
    let s = e[t].y, i = s;
    const n = 1e-12;
    let c, l, h, z, F, B;
    for (; t--; )
      e[t].y < s && (s = e[t].y), e[t].y > i && (i = e[t].y);
    let b = o - r, D = i - s;
    const O = b > D ? b : D, I = (o + r) * 0.5, U = (i + s) * 0.5, p = [
      new d(
        {
          __sentinel: !0,
          x: I - 20 * O,
          y: U - O
        },
        {
          __sentinel: !0,
          x: I,
          y: U + 20 * O
        },
        {
          __sentinel: !0,
          x: I + 20 * O,
          y: U - O
        }
      )
    ], w = [], L = [];
    let u;
    for (t = e.length; t--; ) {
      for (L.length = 0, u = p.length; u--; ) {
        if (b = e[t].x - p[u].x, b > 0 && b * b > p[u].r) {
          w.push(p[u]), p.splice(u, 1);
          continue;
        }
        D = e[t].y - p[u].y, !(b * b + D * D > p[u].r) && (L.push(
          p[u].a,
          p[u].b,
          p[u].b,
          p[u].c,
          p[u].c,
          p[u].a
        ), p.splice(u, 1));
      }
      for (m(L), u = L.length; u; )
        l = L[--u], c = L[--u], h = e[t], z = l.x - c.x, F = l.y - c.y, B = 2 * (z * (h.y - l.y) - F * (h.x - l.x)), Math.abs(B) > n && p.push(new d(c, l, h));
    }
    for (Array.prototype.push.apply(w, p), t = w.length; t--; )
      (w[t].a.__sentinel || w[t].b.__sentinel || w[t].c.__sentinel) && w.splice(t, 1);
    return w;
  }
  v = f;
  const S = (e, t) => {
    const r = /* @__PURE__ */ new Map();
    return new Proxy(e, {
      async apply(o, s, i) {
        const n = JSON.stringify(i);
        if (r.has(n)) {
          const l = r.get(n);
          if (Date.now() - l.timestamp < t) {
            const h = l.data;
            return r.set(n, { cd: h, timestamp: Date.now() }), h;
          } else
            r.delete(n);
        }
        const c = await Reflect.apply(o, s, i);
        return r.set(n, { data: c, timestamp: Date.now() }), c;
      }
    });
  };
  function $(e, t, r) {
    return e[3] === t[3] ? [] : r.map((s) => ({
      break: s,
      p: (s - e[2]) / (t[2] - e[2])
    })).filter((s) => s.p >= 0 && s.p <= 1).map((s) => (s.point = [
      e[0] + s.p * (t[0] - e[0]),
      e[1] + s.p * (t[1] - e[1])
    ], s));
  }
  async function R(e, t) {
    let r = await A(e[0], e[1], t), o = await A(e[1], e[2], t), s = await A(e[2], e[0], t);
    r = r || [], o = o || [], s = s || [];
    const i = [...r, ...o, ...s], n = {};
    return i.forEach((c) => {
      n.hasOwnProperty(c.break) ? n[c.break].push(c.point) : n[c.break] = [c.point];
    }), n;
  }
  const j = a.data, x = {
    type: "FeatureCollection",
    features: j.features
  }, E = j.measure, _ = j.breaks, q = v(x, E), A = S($, 6e4), J = S(R, 6e4), N = q.features.map((e) => (k = e.geometry.coordinates[0], k[0].push(e.properties.a), k[1].push(e.properties.b), k[2].push(e.properties.c), k = k.map((t, r) => {
    if (r > 2) return t;
    const o = _.reduce((s, i, n) => t[2] >= i ? n + 1 : s, 0);
    return t.push(o), t;
  }), k)).filter((e) => !(e[0][3] === e[1][3] && e[0][3] === e[2][3])), W = [];
  return await Promise.all(N.map(async (e) => W.push(await J(e, _)))), _.map((e) => {
    const t = W.filter((r) => r.hasOwnProperty(e)).map((r) => r[e]).reduce((r, o, s) => [...r, o], []);
    return {
      break: e,
      coordinates: t
    };
  });
};
async function H(a, v) {
  const C = {
    type: "MultiLineString",
    debug: !1,
    max_workers: (navigator.hardwareConcurrency ? navigator.hardwareConcurrency - 1 : 3) - this._lib.getWorkerCount()
  }, y = Object.assign({}, C, v), M = (m) => {
    const g = {
      type: "FeatureCollection",
      features: m.data.map((S, $) => ({
        type: "Feature",
        id: $,
        properties: { break: S.break },
        geometry: {
          type: y.type,
          coordinates: S.coordinates
        }
      }))
    };
    this.getSource(`contour-source-${a}`).setData(g);
  };
  this._minion = T(
    G,
    M,
    [],
    !0
  );
  const f = this.getLayer(a), d = f.source, P = (m) => {
    if (m.sourceId === d && m.isSourceLoaded) {
      const g = { sourceLayer: f.sourceLayer };
      f.getLayoutProperty("visibility") === "none" && (y.debug && console.warning(`The layer ${a} must be layout:visible in order to be possible to build the contour. Let's change it to paint:opacity = 0`), this.setPaintProperty(a, `${f.type}-opacity`, 0), this.setLayoutProperty(a, "visibility", "visible")), y.filter && (g.filter = y.filter, g.validate = y.debug);
      const $ = m.target.querySourceFeatures(d, g), R = $.filter(
        (x, E, _) => E === _.findIndex((q) => q.properties[y.measure] === x.properties[y.measure] && q.geometry.coordinates[0] === x.geometry.coordinates[0] && q.geometry.coordinates[1] === x.geometry.coordinates[1])
      ), j = R.map((x, E) => {
        const _ = x.geometry;
        return {
          type: "Feature",
          id: E,
          properties: x.properties,
          geometry: _
        };
      });
      this._minion.postMessage({
        features: j,
        measure: y.measure,
        breaks: y.breaks
      });
    }
  };
  this.addSource(`contour-source-${a}`, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  }), this.on("sourcedata", a, P), this.getSource(d).loaded() && this.getSource(d).fire("sourcedata");
}
async function K(a) {
  this.off("sourcedata", a, shoot), this._minion && this._minion.terminate(), this.removeSource(`contour-source-${a}`);
}
async function V(a) {
  a.Map.prototype._lib = a, a.Map.prototype.addContourSource = H, a.Map.prototype.removeContourSource = K;
}
export {
  V as default
};
