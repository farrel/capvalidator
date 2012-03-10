var fromProjection = new OpenLayers.Projection("EPSG:4326"); // transform from WGS 1984
var toProjection = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
var map, selectControl, selectedFeature;

function onPopupClose(evt) {
  selectControl.unselect(selectedFeature);
} 

function onFeatureSelect(feature) {
  selectedFeature = feature;
  popup = new OpenLayers.Popup.FramedCloud("cap_frame",
      feature.geometry.getBounds().getCenterLonLat(),
      null,
      selectedFeature.attributes.popupContent,
      null, true, onPopupClose);
  feature.popup = popup;
  map.addPopup(popup);
}

function onFeatureUnselect(feature) {
  map.removePopup(feature.popup);
  feature.popup.destroy();
  feature.popup = null;
} 

function createPolygonFeature( polygonPopupContent, polygonCoords ) {
  var points = $.map( polygonCoords, function( pointCoord, i ) {
    return new OpenLayers.Geometry.Point( pointCoord[ 0 ], pointCoord[ 1 ]);
  });

  var polygon = new OpenLayers.Geometry.Polygon( new OpenLayers.Geometry.LinearRing( points ));
  polygon.calculateBounds();

  var attributes = {
    popupContent: polygonPopupContent
  };
  
  return new OpenLayers.Feature.Vector( polygon.transform( fromProjection, toProjection ), attributes ); 
}

function addPolygonsToMap( polygonsData ) {
  var polygons = new OpenLayers.Layer.Vector( "Polygons" );
  map.addLayer( polygons );

  $.each( polygonsData, function( i, polygonData ){
    polygons.addFeatures( $.map( polygonData[ "polygons" ], function( polygonCoords, j ){
      return createPolygonFeature( polygonData[ "description" ], polygonCoords );
    }));
  });

  return polygons;
}

function createCircleFeature( circlePopupContent, circleCoords ) {
  var origin = new OpenLayers.Geometry.Point( circleCoords[ 0 ], circleCoords[ 1 ]);

  var circle = new OpenLayers.Geometry.Polygon.createRegularPolygon( origin, circleCoords[ 2 ] * 0.009, 25 );
  circle.calculateBounds();

  var attributes = {
    popupContent: circlePopupContent
  };
  
  return new OpenLayers.Feature.Vector( circle.transform( fromProjection, toProjection ), attributes ); 
}

function addCirclesToMap( circlesData ){
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
  map = new OpenLayers.Map('map',{
    units: 'm',
    projection: fromProjection,
    displayProjection: toProjection });
  var osm = new OpenLayers.Layer.OSM();
  map.addLayer( osm );

  return map;
}

function build_map(){
  init_map();
  var polygons = addPolygonsToMap( polygonsData );
  var circles = addCirclesToMap( circlesData );

  selectControl = new OpenLayers.Control.SelectFeature( [ polygons, circles ], { onSelect: onFeatureSelect , onUnselect: onFeatureUnselect }); 
  map.addControl( selectControl );

  selectControl.activate();

  var bounds = new OpenLayers.Bounds();
  $.each( map.layers, function(i, layer ){
    bounds.extend( layer.getDataExtent());
  });
  map.zoomToExtent( bounds );
  return map;
}
