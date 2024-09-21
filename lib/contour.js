/* jshint esversion: 9 */
import { tin } from "@turf/tin";
import createMemoizationProxy from "./utils";

/**
 * TODO:
 * - check geometry type and go for centroid
 * - inline imports, its a worker I need it inlined
 * - memoizing cells processing too
 */
const contour = async message => { 
    const 
        features = message.data.features,
        measure = message.data.measure,
        breaks = message.data.breaks,
        grid = tin(features, measure),
        intersect_memoized = createMemoizationProxy(intersect, 60000);

        let cells = grid.features
        .map(f => {
            k = f.geometry.coordinates[0];
            k[0].push(f.properties.a);
            k[1].push(f.properties.b);
            k[2].push(f.properties.c);
            k = k.map(p => {
                const bucket = breaks.reduce((acc, v, i) => (p[2] >= v) ?  i + 1 : acc, 0);
                p.push(bucket);
                return p;
            });
            return k;
        })
        .filter(f => {
            // The cell is not intercepted by isoline
            if (f[0][3] === f[1][3] && f[0][3] === f[2][3]) return false;
        });

        let segments = cells.map(c => {
            const
                p12 = intersect_memoized(c[0],c[1]),
                p23 = intersect_memoized(c[1],c[2]),
                p31 = intersect_memoized(c[2],c[0]);

        });




    let contourmap;
    return contourmap;
};

const segments = async (from, to) =>{
    if (from[3] === to[3]) return -1;
    const points = breaks
    .map(b => { return {
        "break": b,
        "p": (b - from[2])/(to[2] - from[2])
    }})
    .filter(b => b.p >= 0 && b.p <= 1)
    .map(b => {
        b.point = [
            from [0] + b.p * (to[0] - from[0]),
            from [1] + b.p * (to[1] - from[1])
        ]
        return b;
    });
    return points;
};



export { contour };