/* jshint esversion: 9 */

/*
*    This function builds a worker without a physical JS file
*    Parameters:
*        * f: the function to react to the input messages
*        * onmessage: callback function to react to the worker output
*        * imports: array of JS files paths to be imported within the worker (use with caution)
*        * persist: boolean to tell the worker to persist or suicide once performed the task
*        
*    FIrst version: https://gitlab.com/AbelVM/madb/-/blob/master/public/assets/scripts/minions.js
*/
const minion = (f, onmessage, imports, persist) => {
    const
        imp = imports.reduce((acc,k)=>`importScripts('${k}');
        `,''),
        target = `
            ${imp}
            onmessage = o => {let _func = ${f.toString()};
            postMessage(_func.apply(null,o.data));
            ${(!!!persist)? 'self.close();}':'}'}`,
        mission = URL.createObjectURL(new Blob([target], {'type': 'text/javascript'})),
        minion = new Worker(mission);
        minion.onmessage = onmessage;
    return minion;
};

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

export { minion, createMemoizationProxy};