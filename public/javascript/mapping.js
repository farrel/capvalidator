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

function createCircleFeature( polygonName, circleCoords ) {
  var origin = new OpenLayers.Geometry.Point( circleCoords[ 0 ], circleCoords[ 1 ]);

  var circle = new OpenLayers.Geometry.Polygon.createRegularPolygon( origin, circleCoords[ 2 ] * 0.009, 25 );
  circle.calculateBounds();
  
  return new OpenLayers.Feature.Vector( circle.transform( fromProjection, toProjection )); 
}
