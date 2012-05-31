# -*- coding: utf-8 -*-
# This plugins is licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
# Authors: Yusuke Kishita <yuusuuke.kishiita@gmail.com>, Kenji Hosoda <hosoda@s-cubism.jp>
from gluon import *

# For referencing static and views from other application
import os
APP = os.path.basename(os.path.dirname(os.path.dirname(__file__)))

def content_block(managed_html, kwdargs):
    name = kwdargs.get('name')
    content_type = kwdargs.get('type')
    @managed_html.content_block(name, 
                        Field('script', 'text', label='script', default='', widget=SQLFORM.widgets.text.widget),
                        parent=None, content_type=content_type)
    def _(content):
        from plugin_managed_html import EDIT_MODE
        if EDIT_MODE in managed_html.view_mode:
            current.response.write(XML('<div style="position:absolute;"><b>script</b></div>'))
        current.response.write(XML(content.script), escape=False)
    return _
