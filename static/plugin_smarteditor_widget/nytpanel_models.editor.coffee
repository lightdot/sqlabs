
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
#    document.execCommand('fontsize', obj.val)
    _change('fontSize', obj.val)
    @

  fontWeightOfSelectRange: (obj) =>
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
resize_images = new Array()
class ImgModel extends SmartEditor.ElementModel
  name: 'Image'
  defaults:{}
  schema: 
    'image_change': {type: 'Action', title:'画像変更',disabled:false}
    'resize_start': {type: 'Action', title:'画像リサイズ開始',disabled:true}
    'resize_end': {type: 'Action', title:'画像リサイズ終了',disabled:true}

class ImgView extends SmartEditor.ElementView
  initialize: ->
    super
    (@model.bind(key, @[key]) if @[key]?) for key of @model.schema
    (@model.bind("change:#{key}", @[key]) if @[key]?) for key of @model.defaults
    @model.bind("openEdit", @openEdit)
    @model.bind("closeEdit", @closeEdit)
    @$el = $(@el)
    @model.set({width: @$el.width(), src: @$el.attr('src')})
    if @$el.attr('hid') in resize_images
      @model.schema['resize_start'].disabled = true
      @model.schema['resize_end'].disabled = false
    else
      @model.schema['resize_start'].disabled = false
      @model.schema['resize_end'].disabled = true

  @ 

  openEdit: =>
  @

  closeEdit: =>
  @
  
  image_change: =>
    el = @$el
    dialog = SmartEditor.utils.dialog 'managed_html_image_chooser', "loading..." 
    managed_html_ajax_page document.location, {"_action": "image_chooser", "_managed_html_image_grid": 'True',}, 'content_managed_html_image_chooser', ->
      dialog.find('.ui-btn[href=#]').attr('onclick', '')
      dialog.find('.ui-btn[href=#]').click ->
        el.attr(
          'src': $(this).closest('tr').find('textarea').val()
          'height':el.height()+'px',
          'width':el.width()+'px'
        )
        dialog.remove()
    dialog.show()
  @
  
  resize_start: =>
    
    resize_images.push(@$el.attr('hid'))
    @model.schema['resize_start'].disabled = true
    @model.schema['resize_end'].disabled = false
    @model.trigger 'updatedSchema'

    clicked = false
    clicker = false
    start_x = 0
    start_y = 0
    ratio = @$el.width()/@$el.height()

    @$el.hover( 
      -> $(this).css('cursor', 'nw-resize'),
      -> $(this).css('cursor','default');clicked=false
    )

    @$el.mousedown (e) ->
      if e.preventDefault 
        e.preventDefault()
      clicked = true
      clicker = true
      start_x = Math.round(e.pageX - $(this).offset().left)
      start_y = Math.round(e.pageY - $(this).offset().top)
    
    @$el.mouseup (e) ->
      clicked = false
    
    @$el.mousemove (e) ->
      if clicked
        min_w = 50
        min_h = 50
        clicker = false
        mouse_x = Math.round(e.pageX - $(this).offset().left) - start_x
        mouse_y = Math.round(e.pageY - $(this).offset().top) - start_y
        div_h = $(this).height()
        new_h = parseInt(div_h)+mouse_y
        new_w = new_h*ratio
        if new_w > min_w
          $(this).width(new_w)
        if new_h > min_h
          $(this).height(new_h)
        start_x = Math.round(e.pageX - $(this).offset().left)
        start_y = Math.round(e.pageY - $(this).offset().top)
  
  resize_end: =>
    
    resize_images.pop(@$el.attr('hid'))
    @model.schema['resize_start'].disabled = false
    @model.schema['resize_end'].disabled = true
    @model.trigger 'updatedSchema'
    @$el.unbind('hover')
    @$el.unbind('mousedown')
    @$el.unbind('mouseup')
    @$el.unbind('mousemove')

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
