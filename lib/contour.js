/* jshint esversion: 9 */
import { tin } from "@turf/tin";

/**
 * TODO:
 * - check geometry type and go for centroid
 * 
 */
const contour = async message => { 
    const 
        features = message.data.features,
        measure = message.data.measure,
        breaks = message.data.breaks,
        grid = tin(features, measure);

        let cells = tin.features
        .map(f => {
            f.geometry.coordinates[0][0].push(f.properties.a);
            f.geometry.coordinates[0][1].push(f.properties.b);
            f.geometry.coordinates[0][2].push(f.properties.c);
            return f.geometry.coordinates[0];
        })
        .map(k => {
            k = k.map(p => {
                const bucket = breaks.reduce((acc, v, i) => (p[2] >= v) ?  i + 1 : acc, 0);
                p.push(bucket);
                return p;
            });
            return k;
        });


    let contourmap;
    return contourmap;
};

/**
 * 
 * Memoizing technique by 
 * https://soshace.com/2023/05/07/mastering-javascript-proxies-practical-use-cases-and-real-world-applications/
 * 
 */

function createMemoizationProxy(fetchFn, ttl) {
    const cache = new Map();
    return new Proxy(fetchFn, {
        async apply(target, thisArg, args) {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                const cachedData = cache.get(key);
                if (Date.now() - cachedData.timestamp < ttl) {
                    return cachedData.data;
                } else {
                    cache.delete(key);
                }
            }
            const data = await Reflect.apply(target, thisArg, args);
            cache.set(key, { data, timestamp: Date.now() });
            return data;
        }
    });
}

const per_triangle_memoized = createMemoizationProxy(per_triangle, 60000);

export { contour };