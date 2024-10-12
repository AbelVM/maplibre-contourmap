# folders tree
ogr2ogr -f MVT ./tiles ./cotas.gpkg -dsco MINZOOM=0 -dsco MAXZOOM=15 -dsco COMPRESS=NO -dsco NAME=cotas -dsco TYPE=overlay

# pmtiles ogr2ogr
ogr2ogr -dsco MINZOOM=5 -dsco MAXZOOM=15 -f "PMTiles" cotas.pmtiles cotas_cleaned.gpkg

# pmtiles tippecanoe, avg clustered at 10px radius
ogr2ogr -t_srs EPSG:4326 cotas.json cotas.gpkg
tippecanoe -zg --projection=EPSG:4326 -o cotas.pmtiles -r1 --cluster-distance=10 --accumulate-attribute=COTA:mean -l cotas cotas.json

