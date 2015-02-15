// global vars
var 
  area = '118044',
  b = 'LC81180442014276LGN00',
  a = 'LC81180442015023LGN00',
  z = 10,
  c = [23.955259, 120.687062];

var mapa, mapb;

jQuery(document).ready(function($){

  /**
   * Setup and initialize map from hashtag or pass args
   */
  var mapSetup = function(args){
    if(args === 0){
      // reset map using hash
      hashResolv();
    }
    else{
      area = args[0];
      b = args[1];
      a = args[2]
      z = args[3];
      c = [args[4], args[5]];
    }

    // create base params
    var attribution = 'Data &copy; <a href="http://landsat.gsfc.nasa.gov/">USGS/NASA Landsat</a> in <a href="http://landsat.gsfc.nasa.gov/?page_id=2339">Public Domain</a>. Images <a href="http://twlandsat.jimmyhub.net">TWLandsat</a>';
    var maxZoom = 13;

    // before and after layer
    if(b){
      var before = L.tileLayer(
        'http://twlandsat.jimmyhub.net/processed/'+b+'/tiles/{z}/{x}/{y}.png',
        {
          tms: true,
          maxZoom: maxZoom,
        }
      );
      var osmb = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      });
      mapb = new L.map('before', {
        center: c,
        zoom: z,
        maxZoom: 13,
        layers: [osmb, before]
      });
    }
    if(a){
      var after = L.tileLayer(
        'http://twlandsat.jimmyhub.net/processed/'+a+'/tiles/{z}/{x}/{y}.png',
        {
          tms: true,
          attribution: attribution,
          maxZoom: maxZoom,
        }
      );
      var osma = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      });
      mapa = new L.map('after', {
        center: c,
        zoom: z,
        maxZoom: 13,
        layers: [osma, after]
      });
      var hash = [];
      mapa.on('zoomend', mapMove);
      mapa.on('dragend', mapMove);
    }
    if(a && b && mapa && mapb){
      jQuery('#map-diff').beforeAfter(mapb, mapa, {
        imagePath: './css/images/',
        animateIntro : true,
        introDelay : 1000,
        introDuration : 1000,
        introPosition : .5,
        showFullLinks : true,
        beforeLinkText: '顯示左側',
        afterLinkText: '顯示右側',
      });
    }
  }


  /**
   * Add navigation select box
   */
  var navSetup = function(){
    // form element
    var $area = $('<select id="select-area">');
    var $before = $('<select id="select-before">');
    var $after = $('<select id="select-after">');
    $("#nav")
      .append($area)
      .append('<span> &raquo; </span>')
      .append($before)
      .append('<span class="vs"> vs </span>')
      .append($after);

    // setup options
    $.each(nav, function( key, value ) {
      $area.append('<option value="'+key+'">'+value.name+'</option>');
    });

    // chanage action
    $($area).change(function(){
      $before.find('option[value!=0]').remove();
      $after.find('option[value!=0]').remove();
      if(nav[$(this).val()] !== 'undefined'){
        var maps = nav[$(this).val()];
        $.each(maps, function(key, value) {
          if(key !== 'name'){
            $before.append('<option value="'+key+'">'+value+'</option>');
            $after.append('<option value="'+key+'">'+value+'</option>');
          }
        });
      }
    });
    $("#select-before, #select-after").change(function(){
      var $other = $(this).attr("id") == 'select-before' ? $after : $before;
      var value = $(this).val();
      if($(this).val() != value){
        var latlng = mapa.getCenter()
        var hash = [
          $area.val(),
          $before.val(),
          $after.val(),
          mapa.getZoom(),
          latlng.lat,
          latlng.lng
        ];
        hashChange(hash);
        if($before.val() != '0' && $after.val() != '0'){
          mapReset();
        }
      }
    });
    $area.change(function(){
      var hash = [$area.val()];
      hashChange(hash);
    });
  }

  /**
   * Help function to reset map
   */
  var mapReset = function(){
    $('#map-diff').remove();
    $('<div id="map-diff"><div id="before" /><div id="after" /></div>').appendTo('main');
    $("#before, #after").addClass('map');
    mapSetup(0);
  }

  /**
   * Help function for leaflet drag event
   */
  var mapMove = function(){
    var latlng = mapa.getCenter()
    var hash = [];
    hash[3] = mapa.getZoom();
    hash[4] = latlng.lat;
    hash[5] = latlng.lng;
    hashChange(hash);
  }

  /**
   * Help function for update hashtag
   */
  var hashChange = function(hash){
    var h = window.location.hash.split(',');
    h[0] = h[0].replace('#','');
    $.each(hash, function(i, v){
      if(v){
        h[i] = v;
      }
    });
    window.location.hash = h.join(',');
    hashResolv(); 
  }

  /**
   * Help function for get hashtag value
   */
  var hashResolv = function(i){
    var h = window.location.hash.split(',');
    area = h[0].replace('#','');
    b = h[1];
    a = h[2];
    z = h[3]*1;
    c = [h[4]*1,h[5]*1];
    if(i){
      return h[i];
    }
  }

  // main
  if (window.location.hash){
    hashResolv(); 
  }

  $(window).resize(function(){
    mapReset();
  });

  var init = [area, b, a, z, c[0], c[1]];
  hashChange(init);
  mapSetup(0);
  navSetup();

  // setup option default
  $("#select-area").val(area).trigger('change');
  $("#select-before").val(b).trigger('change');
  $("#select-after").val(a).trigger('change');

});

