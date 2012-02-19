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
