# -*- coding: utf-8 -*-
# This plugins is licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
# Authors: Yusuke Kishita <yuusuuke.kishiita@gmail.com>, Kenji Hosoda <hosoda@s-cubism.jp>
from gluon import *

# For referencing static and views from other application
import os
APP = os.path.basename(os.path.dirname(os.path.dirname(__file__)))

def setup(managed_html):
    managed_html.settings.smarteditor_plugins.append(URL(APP, 'static', 'plugin_managed_gallery/smarteditor_plugin.coffee'))
    managed_html.settings.content_types['gallery'] = content_block

def content_block(managed_html, kwdargs):
    name = kwdargs.get('name')
    content_type = kwdargs.get('type')
    @managed_html.content_block(name, 
                       Field('gallery', label='gallery', default=''),
                       Field('width', label='width', default='500'),
                       Field('height', label='height', default='300'), 
                       Field('effect', label='effect', default='wave'), 
                       Field('delay', label='delay', default='5'), 
                       parent=None, content_type=content_type)
    def _(content):
        from gluon.utils import web2py_uuid
        uuid = web2py_uuid()
        if not content.gallery:
            current.response.write(XML('Gallery'), escape=False)
            return
        files = managed_html.db(managed_html.db.managed_html_file.id.belongs(content.gallery.split(','))).select()
        current.response.write(XML("""<div id='%s'>"""%uuid).xml(),escape=False)
        for file in files:
            current.response.write(XML("""<img file_id='%s' src='%s'/>"""%(file.id, URL('static', 'uploads/contents/%s'%file.name))).xml(),escape=False)
        current.response.write(XML("""
</div>
<script type="text/javascript" src="%s"></script>
<script type="text/javascript">
jQuery(function($) {
$('#%s').jqFancyTransitions({ width: %s, height: %s , effect: '%s', delay: %s});
});
</script>
"""%(URL(APP, 'static', 'plugin_managed_gallery/jqFancyTransitions.1.8.min.js'),
    uuid,
    content.width, 
    content.height, 
    content.effect,
    int(content.delay or 5) * 1000,
    )).xml(), 
    escape=False)
    return _
