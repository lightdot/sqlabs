# -*- coding: utf-8 -*-
# This plugins is licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
# Authors: Yusuke Kishita <yuusuuke.kishiita@gmail.com>, Kenji Hosoda <hosoda@s-cubism.jp>
from gluon import *

# For referencing static and views from other application
import os
APP = os.path.basename(os.path.dirname(os.path.dirname(__file__)))

def setup(managed_html):
    managed_html.settings.smarteditor_plugins.append(URL(APP, 'static', 'plugin_managed_handlebars/handlebars-1.0.0.beta.6.js'))
    managed_html.settings.content_types['handlebars'] = content_block

def content_block(managed_html, kwdargs):
    name = kwdargs.get('name')
    content_type = kwdargs.get('type')
    @managed_html.content_block(kwdargs.get('name'), 
            Field(content_type, 'text', widget=SQLFORM.widgets.text.widget), 
            parent=None, content_type=content_type)
    def _(content):
        if name not in managed_html.settings._handlebars_stack:
            managed_html.settings._handlebars_stack.append(name)
            if content.handlebars:
                try:
                    tree = content.handlebars_tree
                    if tree:
                        from pprint import pprint
                        #pprint(tree)
                        code = managed_html.settings._handlebars_compiler._compiler(tree).apply('compile')[0]
                        code({}, helpers={'load': managed_html.load_handlebars, 'url':managed_html.url_helper})
                    else:
                        managed_html.settings._handlebars_compiler.compile(name, '', content.handlebars)({}, helpers={'load': managed_html.load_handlebars, 'url':managed_html.url_helper})
                except HTTP as e:
                    raise
                except Exception as e:
                    if current.request.is_managed_html_mode:
                        current.response.write(XML('<span style="color:red">handlebars error : %s</span>'%e.message).xml(), escape=False)
            else:
                current.response.write(XML('<div class="managed_html_empty_content">&nbsp;</div>').xml(), escape=False)
            managed_html.settings._handlebars_stack.remove(name)
        else:
            if current.request.is_managed_html_mode:
                current.response.write(XML('<span style="color:red">handlebars error : infinite loop "%s"</span>'%name).xml(), escape=False)
       
    return _

def managed_handlebars(managed_html):
    def MANAGED_HANDLEBARS(name, parent=None):
        managed_html.write_managed_html(name=name, parent=parent, type='handlebars')()
    return MANAGED_HANDLEBARS
