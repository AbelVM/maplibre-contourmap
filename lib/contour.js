/* jshint esversion: 9 */
import { tin } from "@turf/tin";
import createMemoizationProxy from "./utils";

/**
 * TODO:
 * - check geometry type and go for centroid
 * - inline imports, its a worker I need it inlined
 */
const contour = async message => { 
    const 
        features = message.data.features,
        measure = message.data.measure,
        breaks = message.data.breaks,
        grid = tin(features, measure),
        segments_memoized = createMemoizationProxy(segments, 60000);

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
            if (f[0][2] === f[1][2] && f[0][2] === f[2][2]) return false;
        });

        let segments = cells.map(c => {

        });




    let contourmap;
    return contourmap;
};





export { contour };