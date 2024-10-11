ogr2ogr -f MVT ./tiles ./cotas.gpkg -dsco MINZOOM=0 -dsco MAXZOOM=15 -dsco COMPRESS=NO -dsco NAME=cotas -dsco TYPE=overlay

