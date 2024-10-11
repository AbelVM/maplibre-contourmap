#!/bin/bash
cd lib/externals
npm install
npm run build
cd ..
rm -f contour2.js
sed '/\/\/placeholder/ { r externals/dist/externals.mjs
d }' contour.js > contour2.js