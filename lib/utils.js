/* jshint esversion: 9 */

/*
    This function builds a worker without a physical JS file
    Parameters:
        * f: the function to react to the input messages
        * onmessage: callback function to react to the worker output
        * imports: array of JS files paths to be imported within the worker (use with caution)
        * persist: boolean to tell the worker to persist or suicide once performed the task
*/
minion = function (f, onmessage, imports, persist) {
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

export { minion };