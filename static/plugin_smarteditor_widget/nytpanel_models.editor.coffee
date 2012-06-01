
###
  編集可能領域に対する編集モデル
###
class EditableModel extends SmartEditor.ElementModel
  name: 'Editable'
  schema:
    #'test': {type: 'Action', title:'abc'}
    'fontSizeOfSelectRange': {type: 'Select', title: 'サイズ', options: {val:"#{n}pt", label:"<span style=\"font-size: #{n}pt\">#{n}pt</span>"} for n in [7,9,11,12,14,16]}
    'fontWeightOfSelectRange': {type: 'Select', title: '太さ', options: {val:"#{n}", label:"<span style=\"font-weight: #{n}\">#{n}</span>"} for n in ['normal', 'bold']}
    'insertImg': {type: 'Action', title:'画像'}
    'createLink': {type: 'Action', title:'リンク'}

class EditableView extends SmartEditor.ElementView
  initialize: ->
    super
    (@model.bind(key, @[key]) if @[key]?) for key of @model.schema
    (@model.bind("change:#{key}", @[key]) if @[key]?) for key of @model.defaults
    @model.bind("openEdit", @openEdit)
    @model.bind("closeEdit", @closeEdit)

    @$el = $(@el)
    @

  openEdit: =>
    @

  closeEdit: =>
    @

  test: (obj) =>
    @

  fontSizeOfSelectRange: (obj) =>
    # @$el.css 'fontSize', obj.val
    _change('fontSize', obj.val)

    @

  fontWeightOfSelectRange: (obj) =>
    # @$el.css 'fontWeight', obj.val
    _change('fontWeight', obj.val)

    @
  
  insertImg: (obj) =>
    
    baseEl = $(@model.targetEl)
    if baseEl.attr('hid') is undefined
      baseEl = baseEl.closest(".handlebars_content_block")
    
    document.execCommand('insertImage',false,'dummy-image');
    dialog = SmartEditor.utils.dialog 'managed_html_image_chooser', "loading..." 
    managed_html_ajax_page document.location, {"_action": "image_chooser", "_managed_html_image_grid": 'True',}, 'content_managed_html_image_chooser'
    dialog.show()
    @
    
  createLink: (obj) =>
    document.execCommand('CreateLink',false,window.prompt('URL','http://'));
  
SmartEditor.factories.push (target_el) =>
  el = $(target_el).closest("[contenteditable=true]")[0]

  if el? and target_el.tagName!='IMG'
    model = new EditableModel() 
    model.schema = SmartEditor.utils.clone model.schema
    view = new EditableView(
      model: model
      el: el
      tagName: el.tagName
    )

    return model
  return undefined

###
  画像に対する編集モデル
###
class ImgModel extends SmartEditor.ElementModel
  name: 'Image'
  defaults:
    'src': undefined
    'width': undefined
    'height': undefined
  schema:
    'src': {type: 'Text', title:'画像url'}
    'width': {type: 'Text', title:'画像横幅'}
    'height': {type: 'Text', title:'画像縦幅'}

class ImgView extends SmartEditor.ElementView
  initialize: ->
    super
    (@model.bind(key, @[key]) if @[key]?) for key of @model.schema
    (@model.bind("change:#{key}", @[key]) if @[key]?) for key of @model.defaults
    @model.bind("openEdit", @openEdit)
    @model.bind("closeEdit", @closeEdit)
    @$el = $(@el)
    @model.set({width: @$el.width(), src: @$el.attr('src')})
    @ 

  openEdit: =>
    @

  closeEdit: =>
    @

  width: =>
    if @model.get('width') is ''
      @$el.css('width', 'auto')
    else
      @$el.css('width', @model.get('width')+'px')

  height: =>
    if @model.get('height') is ''
      @$el.css('height', 'auto')
    else
      @$el.css('height', @model.get('height')+'px')

  src: (obj) =>
    @$el.attr('src', @model.get('src'))
    @

SmartEditor.factories.push (target_el) =>
  el = $(target_el).closest("[contenteditable=true]")[0]

  if el? and target_el.tagName=='IMG'
    model = new ImgModel() 
    model.schema = SmartEditor.utils.clone model.schema
    view = new ImgView(
      model: model
      el: target_el
      tagName: target_el.tagName
    )

    return model
  return undefined

###
  リンクに対する編集モデル
###
class LinkModel extends SmartEditor.ElementModel
  name: 'Link'
  schema:
    'src': {type: 'Action', title:'リンクurl'}

class LinkView extends SmartEditor.ElementView
  initialize: ->
    super
    (@model.bind(key, @[key]) if @[key]?) for key of @model.schema
    (@model.bind("change:#{key}", @[key]) if @[key]?) for key of @model.defaults
    @model.bind("openEdit", @openEdit)
    @model.bind("closeEdit", @closeEdit)
    @$el = $(@el)

    @ 

  openEdit: =>
    @

  closeEdit: =>
    @

  src: (obj) =>
    url = prompt('URL',@$el.attr('href'))
    @$el.attr('href', url)
    @

SmartEditor.factories.push (target_el) =>
  el = $(target_el).closest("div[contenteditable=true]")[0]

  if el? and target_el.tagName=='A'
    model = new LinkModel() 
    model.schema = SmartEditor.utils.clone model.schema
    view = new LinkView(
      model: model
      el: target_el
      tagName: target_el.tagName
    )

    return model
  return undefined
