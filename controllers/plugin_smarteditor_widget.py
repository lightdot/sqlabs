# -*- coding: utf-8 -*- 

# db = DAL('sqlite://test.sqlite')

response.title = 'plugin_SmartEditor'

response.menu = [
]

# ################### dummy table
# import db_base_tables

# # create
# db.define_table( 'text',
                 # Field('title', 'string'),
                 # Field('text', 'text'),
                 # db_base_tables.get_trail_base(db) )

# if False:
    # for table in db.tables:
        # db[table].truncate()
    # response.flash = 'データベースを削除しました'


###################
from plugin_smarteditor_widget import SmartEditorWidget

def index():
    #from plugin_solidform imoprt SOLIDFORM
    #form = SOLIDFORM( db.text )
    #if form.process().accepted:

    teststring = '''
menu

abasdf
asdf;alkjd
oesga;sd
<a href="test">sdoiguasd</a>
as;dlfkj;ad
asd;lkfj;
<br />
title

saad fkj;as lkdf j;al skdf
<div class="managed_html_content_block">MANAGED
asdfj asd;lfkjasd as;dlkfja;sd asd;lfkjas asdfkja;sd asdf;alkj 
HTML</div>

<div class="managed_html_content_block">MANAGED
<br />
asd;lfkj;lkjasd<br />
sadf;lkj; asdf<br />
asd;flk ;lsk dfasiup[<br />
asd;lfkj; poasdif pasd<br />
</div>
<img src='http://www.google.co.jp/images/nav_logo102.png' class='span4' alt='google logo'>
<br/>
asd;lfkjlk ;asd;lfkj;alskd fas;dfkj ;lkasdf; lkasd;flka s;df;asld kf;lsakdf;asdkf as;dlkf
<br />
jsad;lk fj;akf

<br />

test test test test test test test 
<br />

footer!
'''
    grid = SmartEditorWidget( XML(teststring), renderstyle=True )

    response.files.append(URL('static', 'js/test.coffee'))
    #from plugin_coffeescript import use_coffeescripts, append_coffeescript, compile
    #use_coffeescripts()

    #append_coffeescript(URL('static', 'js/common.coffee'), True)

    import plugin_coffeescript
    plugin_coffeescript.compile(False)

    return dict(grid=grid)


def test():

    urls = [ URL('static', 'plugin_bootstrap2/bootstrap.min.css'),
             URL('static', 'plugin_bootstrap2/bootstrap-responsive.min.css'),
             URL('static', 'plugin_bootstrap2/bootstrap.min.js'),
             #URL('static', 'plugin_smarteditor_widget/bootstrap-dropdown.js')
             ]
    urls += [URL('static', 'plugin_smarteditor_widget/underscore.js'),
             URL('static', 'plugin_smarteditor_widget/backbone.js'),
             URL('static', 'plugin_smarteditor_widget/backbone-forms.js'),
             URL('static', 'plugin_smarteditor_widget/backbone-forms.css'),
             URL('static', 'plugin_smarteditor_widget/smarteditor.bootstrap.js'),
             URL('static', 'plugin_smarteditor_widget/smarteditor.coffee'),
             URL('static', 'plugin_smarteditor_widget/smarteditor_widgets.coffee'),
             URL('static', 'plugin_smarteditor_widget/font_size.js'),
             URL('static', 'plugin_smarteditor_widget/nytpanel_models.editor.coffee'),
             ]

    urls += [ URL('static', 'plugin_smarteditor_widget/smarteditor_models.akamon.coffee') ]
    urls += [ URL('static', 'plugin_smarteditor_widget/smarteditor.css') ]

    for _url in urls:
        if _url not in response.files:
            response.files.append(_url)

    import plugin_coffeescript
    plugin_coffeescript.compile(True,False)

    return  dict(src='''
menu

<div contenteditable="true">
<img src='http://www.google.co.jp/images/nav_logo102.png' class='span4' alt='google logo'>
abasdf
asdf;alkjd
oesga;sd
<a href="test">sdoiguasd</a>
as;dlfkj;ad
asd;lkfj;
<br />
title
</div>

saad fkj;as lkdf j;al skdf
<div class="managed_html_content_block">MANAGED
asdfj asd;lfkjasd as;dlkfja;sd asd;lfkjas asdfkja;sd asdf;alkj 
HTML</div>

<div class="managed_html_content_block">MANAGED
<br />
asd;lfkj;lkjasd<br />
sadf;lkj; asdf<br />
asd;flk ;lsk dfasiup[<br />
asd;lfkj; poasdif pasd<br />
</div>
<br/>
asd;lfkjlk ;asd;lfkj;alskd fas;dfkj ;lkasdf; lkasd;flka s;df;asld kf;lsakdf;asdkf as;dlkf
<br />
jsad;lk fj;akf

<br />

test test test test test test test 
<br />

footer!
''')



#from plugin_responsivekit import *
#def screensize():
#    return set_screen_size()

