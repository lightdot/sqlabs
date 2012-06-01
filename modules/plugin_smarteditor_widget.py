from gluon.storage import Storage
from gluon import *
import datetime

###################
class SmartEditorWidget(DIV):

    _editor_class = ''
    _editbuttons_class = 'smartedit_buttons'

    def __init__(self,
                 child = current.T('empty'), # field & value???
                 id = 0,
                 renderstyle=False,   #with css
                 editbutton=True,
                 **attributes
                 ):
        DIV.__init__(self, **attributes)
        self.attributes['_class'] = self._editor_class + ' article'
        self.attributes['_data-button-class'] = 'all'

        urls = [ URL('static', 'plugin_smarteditor_widget/underscore.js'),
                 URL('static', 'plugin_smarteditor_widget/backbone.js'),
                 URL('static', 'plugin_smarteditor_widget/backbone-forms.css'),
                 URL('static', 'plugin_smarteditor_widget/backbone-forms.js'),
                 #URL('static', 'backbone-forms/src/jquery-ui-editors.js'),
                 ]

        urls += [ URL('static', 'plugin_smarteditor_widget/smarteditor.bootstrap.js') ]
        urls += [ URL('static', 'plugin_smarteditor_widget/smarteditor.coffee') ]
#        urls += [ URL('static', 'plugin_smarteditor_widget/smarteditor_models.coffee') ]
        urls += [ URL('static', 'plugin_smarteditor_widget/smarteditor_models.akamon.coffee') ]
        if renderstyle:
            urls += [ URL('static', 'plugin_smarteditor_widget/smarteditor.css') ]

        for _url in urls:
            if _url not in current.response.files:
                current.response.files.append(_url)

        script_el = SCRIPT( '''
          var width_filter = "%(filter)s";
          var controller   = "%(url)s";
        ''' % dict( filter='.container', url=URL('screensize') ) )

        responsivekit_el = TAG( 'script', )
#                                _src=URL('static','plugin_responsivekit/responsivekit.js') )


        #self.attributes['_onclick'] = '''
        #  alert("ok");
        #'''
        
        active_code = '''
          func_%(mode)s(this.parentNode.nextSibling, "%(id)s");
          this.parentNode.classList.add('editing');
        '''
        inactive_code = '''
          func_%(mode)s(this.parentNode.nextSibling, "%(id)s");
          this.parentNode.classList.remove('editing');
        '''

        if False and editbutton:
            self.append( DIV( '[ ',
                A('edit', _href='#', _class='edit',
#                  _onclick=active_code % {'mode':'edit', 'id':id},
                  ),
                A('update ', _href='#', _class='update',

#                  _onclick=inactive_code % {'mode':'update', 'id':id},
                  ),
                A('revert', _href='#', _class='revert',
#                  _onclick=inactive_code % {'mode':'revert', 'id':id},
                  ), ' ]',
                _class=self._editbuttons_class,
                _contenteditable='false'
                ) )

        #self.append( DIV(child, _id='test_id10', _class='smartedit span12') )
        #self.append( DIV("abc", _id="testid11", _class='smartedit span4') )
        #self.append( IMG(_src='http://www.google.co.jp/images/nav_logo102.png', _class='smartedit span4', _alt='google logo') )
        self.append( child )

    def xml(self):
        return DIV.xml(self)
