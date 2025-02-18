/* jshint esversion: 9 */

const contour = async message => {

    /* START externals block */
    let tinify;

    //placeholder

    /* END externals block */


    /**
     * 
     *      Memoizing technique by 
     *      https://soshace.com/2023/05/07/mastering-javascript-proxies-practical-use-cases-and-real-world-applications/
     * 
     */
    const createMemoizationProxy = (fetchFn, ttl) => {
        const cache = new Map();
        return new Proxy(fetchFn, {
            async apply(target, thisArg, args) {
                const key = JSON.stringify(args);
                if (cache.has(key)) {
                    const cachedData = cache.get(key);
                    if (Date.now() - cachedData.timestamp < ttl) {
                        const cd = cachedData.data;
                        cache.set(key, { cd , timestamp: Date.now() }); // restart ttl if cache is hit
                        return cd;
                    } else {
                        cache.delete(key);
                    }
                }
                const data = await Reflect.apply(target, thisArg, args);
                cache.set(key, { data, timestamp: Date.now() });
                return data;
            }
        });
    };

    // find intersections of cell side with breaks 
    function intersect(from, to, breaks) {
        if (from[3] === to[3]) return [];
        const points = breaks
            .map(b => { return {
                "break": b,
                "p": (b - from[2])/(to[2] - from[2])
            }})
            .filter(b => b.p >= 0 && b.p <= 1)
            .map(b => {
                b.point = [
                    from[0] + b.p * (to[0] - from[0]),
                    from[1] + b.p * (to[1] - from[1])
                ]
                return b;
            });
        return points;
    };
    
    // find intersections of every cell sides with breaks 
    async function cell_segments(cell, breaks) {
        let
            p12 = await intersect_memoized(cell[0], cell[1], breaks),
            p23 = await intersect_memoized(cell[1], cell[2], breaks),
            p31 = await intersect_memoized(cell[2], cell[0], breaks);
        p12 = (!!p12) ? p12 : [];
        p23 = (!!p23) ? p23 : [];
        p31 = (!!p31) ? p31 : [];
        const
            points = [...p12, ...p23, ...p31],
            s = {};
        points.forEach(p => {
            if(s.hasOwnProperty(p.break)){
                s[p.break].push(p.point);
            }else{
                s[p.break] = [p.point];
            }
        });
        return s;
    }

    const
        data = message.data,
        features = {
            "type": "FeatureCollection",
            "features": data.features
          },
        measure = data.measure,
        breaks = data.breaks,
        grid = tinify(features, measure),
        intersect_memoized = createMemoizationProxy(intersect, 60000),
        cell_segments_memoized = createMemoizationProxy(cell_segments, 60000);

    const cells = grid.features
        .map(f => {
            k = f.geometry.coordinates[0];
            k[0].push(f.properties.a);
            k[1].push(f.properties.b);
            k[2].push(f.properties.c);
            k = k.map((p,i) => {
                if (i > 2) return p;
                const bucket = breaks.reduce((acc, v, i) => (p[2] >= v) ?  i + 1 : acc, 0);
                p.push(bucket);
                return p;
            });
            return k;
        }).filter(f => {
            // Only return cells intercepted by isoline
            return !(f[0][3] === f[1][3] && f[0][3] === f[2][3]);
        });

        const segments_raw = [];
        await Promise.all(cells.map(async c => segments_raw.push(await cell_segments_memoized(c, breaks))));

        const segments = breaks.map(b => {
            const coordinates = segments_raw.filter(s => s.hasOwnProperty(b)).map(s => s[b]).reduce((acc, v, i) => [...acc, v], []);
            return {
                "break": b,
                "coordinates": coordinates
            };
        });

        return segments;


};

export { contour };