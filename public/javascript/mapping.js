var fromProjection = new OpenLayers.Projection("EPSG:4326"); // transform from WGS 1984
var toProjection = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection

function createPolygonFeature( polygonName, polygonCoords ) {
  var points = $.map( polygonCoords, function( pointCoord, i ) {
    return new OpenLayers.Geometry.Point( pointCoord[ 0 ], pointCoord[ 1 ]);
  });

  var polygon = new OpenLayers.Geometry.Polygon( new OpenLayers.Geometry.LinearRing( points ));
  polygon.calculateBounds();
  
  return new OpenLayers.Feature.Vector( polygon.transform( fromProjection, toProjection )); 
}

function addPolygonsToMap( map, polygonsData ) {
  var polygons = new OpenLayers.Layer.Vector( "Polygons" );
  map.addLayer( polygons );

  $.each( polygonsData, function( i, polygonData ){
    polygons.addFeatures( $.map( polygonData[ "polygons" ], function( polygonCoords, j ){
      return createPolygonFeature( polygonData[ "description" ], polygonCoords );
    }));
  });

  return polygons;
}

function createCircleFeature( polygonName, circleCoords ) {
  var origin = new OpenLayers.Geometry.Point( circleCoords[ 0 ], circleCoords[ 1 ]);

  var circle = new OpenLayers.Geometry.Polygon.createRegularPolygon( origin, circleCoords[ 2 ] * 0.009, 25 );
  circle.calculateBounds();
  
  return new OpenLayers.Feature.Vector( circle.transform( fromProjection, toProjection )); 
}

function addCirclesToMap( map, circlesData ){
  var circles = new OpenLayers.Layer.Vector( "Circles" );
  map.addLayer( circles );

  $.each( circlesData, function( i, circleData ){
    circles.addFeatures( $.map( circleData[ "circles" ], function( circleCoords, j ){
      return createCircleFeature( circleData[ "description" ], circleCoords );
    }));
  });

  return circles;
}

function init_map(){ 
  var map = new OpenLayers.Map('map',{
    units: 'm',
    projection: fromProjection,
    displayProjection: toProjection });
  var osm = new OpenLayers.Layer.OSM();
  map.addLayer( osm );

  return map;
}

function build_map(){
  var ol_map = init_map();
  addPolygonsToMap( ol_map, polygonsData );
  addCirclesToMap( ol_map, circlesData );

  var bounds = new OpenLayers.Bounds();
  $.each( ol_map.layers, function(i, layer ){
    bounds.extend( layer.getDataExtent());
  });
  ol_map.zoomToExtent( bounds );
  return ol_map;
}
