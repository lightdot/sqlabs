# -*- coding: utf-8 -*-
# This plugins is licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
# Authors: Yusuke Kishita <yuusuuke.kishiita@gmail.com>, Kenji Hosoda <hosoda@s-cubism.jp>
from gluon import *

# For referencing static and views from other application
import os
APP = os.path.basename(os.path.dirname(os.path.dirname(__file__)))

def setup(managed_html):
    managed_html.settings.smarteditor_plugins.append(URL(APP, 'static', 'plugin_managed_google_map/smarteditor_plugin.coffee'))
    managed_html.settings.content_types['google_map'] = content_block

def content_block(managed_html, kwdargs):
    name = kwdargs.get('name')
    content_type = kwdargs.get('type')
    @managed_html.content_block(name, 
                        Field('title', label='タイトル', default='芝公園'),
                        Field('lat', label='緯度', default='35.654071'), 
                        Field('long', label='経度', default='139.749838'),
                        Field('marker_lat', label='マーカー緯度', default='35.654071'),
                        Field('marker_long', label='マーカー経度', default='139.749838'),
                        Field('marker_image', label='マーカー画像'),
                        Field('template', 'text', label="テンプレート", default='<div id="map1" class="map" style="height:200px"></div>', widget=SQLFORM.widgets.text.widget), parent=kwdargs.get('parent'), content_type=content_type)
    def _(content):
        if not content:
            current.response.write(XML('GoogleMap'), escape=False)
        current.response.write(XML("""
<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script>
<script type="text/javascript">
jQuery(function($) {

var source   = $("#template_%s").html();
var template = Handlebars.compile(source);
var context  = {title: "%s"}
$('#content_%s').html(template(context));
"""%(name, content.title, name)))
        if content.template:
            current.response.write(XML("""
var latlng = new google.maps.LatLng(%s,%s);
var opts = {
zoom: 15,
center: latlng,
mapTypeId: google.maps.MapTypeId.ROADMAP
};

var map = new google.maps.Map($("#content_%s .map")[0], opts);
var marker = new google.maps.Marker({
position: new google.maps.LatLng(%s,%s),
map: map,
title: '%s'
});

var content = '<img src="%s" alt="%s"><br/>%s';
var infowindow = new google.maps.InfoWindow({
content: content ,
size: new google.maps.Size(50, 50)
});

google.maps.event.addListener(marker, 'click', function() {
infowindow.open(map, marker);
});              
"""%(content.lat, content.long, name, content.marker_lat, content.marker_long, content.title, content.marker_image, content.title, content.title)))
        current.response.write(XML("""
});
</script>
<script id="template_%s" type="text/x-handlebars-template">
%s
</script>
<div id="content_%s"></div>
"""%(name, content.template or '<table width="400px"></table>', name)))              
    return _
