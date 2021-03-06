###
  Authors: Naoto Kato, Nozomu Oshikiri, Natsuki Kimoto, Kenji Hosoda
###

###
Exposed global class
###

class @SmartEditor

  # === class variables ===

  @VERSION: '0.1.0'

  @widgets: {}


  @widgetMapper: {}
#    'Image':
#      'DropdownForms':
#        fields: ['src','width','height']
#        title:'画像設定'

  # {テスト名: テスト関数, ...}
  # パネルのターゲットが決定される前に実行されるテスト関数
  @elementTests: {}

  # パネルのターゲットが決定去れたときに実行されるファクトリメソッド郡
  # factoryはBackbone.Modelオブジェクトを返す
  @factories: []

  @options:
    menuCSSPrefix: "ui-btn"

  @disableSelectors: ['.smarteditor-main-panel']

  @utils:
    # from http://coffeescriptcookbook.com/chapters/classes_and_objects/cloning
    clone: (obj) ->
      if not obj? or typeof obj isnt 'object'
        return obj

      if obj instanceof Date
        return new Date(obj.getTime()) 

      if obj instanceof RegExp
        flags = ''
        flags += 'g' if obj.global?
        flags += 'i' if obj.ignoreCase?
        flags += 'm' if obj.multiline?
        flags += 'y' if obj.sticky?
        return new RegExp(obj.source, flags) 

      newInstance = new obj.constructor()

      for key of obj
        newInstance[key] = SmartEditor.utils.clone obj[key]

      return newInstance
    
    dialog: (dialog_id, html) ->
      $('.smarteditor-main-panel').hide()
      dialog = $('<div class=\"managed_html_dialog\" id=\"' + dialog_id + '\" style=\"display:none; z-index:900; position:fixed; top:0%;left:0%;width:100%;height:100%;\"><div class=\"dialog-back\" onclick=\";jQuery(&quot;#' + dialog_id + '&quot;).remove();;return false;\" style=\"width:100%;height:100%;\"></div><div><div class=\"dialog-front\" id=\"c' + dialog_id + '\" onclick=\"\nvar e = arguments[0] || window.event;\nif (jQuery(e.target).parent().attr(&#x27;id&#x27;) == &quot;c' + dialog_id + '&quot;) {;jQuery(&quot;#' + dialog_id + '&quot;).remove();;};\n\" style=\"\nposition:absolute;top:10%;left:5%;\nwidth:90%;height:80%;\nz-index:950;overflow:auto;\n\"><span style=\"font-weight:bold:font-size:18px;\">\u9078\u629e\u3059\u308b</span><span style=\"float:right\">[<a href=\"#\" onclick=\";jQuery(&quot;#' + dialog_id + '&quot;).remove();;return false;\">\u9589\u3058\u308b</a>]</span><hr /><div id=\"content_' + dialog_id + '\"></div></div></div></div>')
      dialog.find('#content_' + dialog_id).html(html)
      $(document.body).append(dialog)
      dialog.css('zIndex', (parseInt(dialog.css('zIndex')) || 1000) + 10)
      $.aop.before {target: $.fn, method: "show"}, ->
        this.trigger("show")
      dialog.bind "show", ->
        $('.smarteditor-main-panel').hide()
      $.aop.before {target: $.fn, method: "remove"}, ->
        this.trigger("remove")
      dialog.bind "remove", ->
        if 0 == $('input[name=__uploadify__name]').length
          $('.smarteditor-main-panel').show()
          $('img[src=dummy-image]').remove()
      return dialog
    
    remove_document_write: (val) ->
      return val.replace(/document\.write\([^\)]*\)/,"")

    resize: (@$el) ->
      
      @$el.find('img').each ->
      
        clicked = false
        clicker = false
        start_x = 0
        start_y = 0
        ratio = $(this).width()/$(this).height()

        $(this).hover( 
          -> $(this).css('cursor', 'nw-resize'),
          -> $(this).css('cursor','default');clicked=false
        )

        $(this).mousedown (e) ->
          if e.preventDefault 
            e.preventDefault()
          clicked = true
          clicker = true
          start_x = Math.round(e.pageX - $(this).offset().left)
          start_y = Math.round(e.pageY - $(this).offset().top)
    
        $(this).mouseup (e) ->
          clicked = false
    
        $(this).click (e) ->
          if clicker
            this.imageEdit(e)

        $(this).mousemove (e) ->
          if clicked
            min_w = 30
            min_h = 30
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
      
  # === instance variables ===
  mainPanelModel: undefined
  mainPanelView: undefined
  rootElement: undefined

  constructor: () ->
    @mainPanelModel = new SmartEditor.MainPanelModel()
    @mainPanelView = new SmartEditor.MainPanelView(model: @mainPanelModel)

    document.body.appendChild @mainPanelView.el
    @rootElement = document.body
    $(@rootElement).on 'mousedown', @onClick
    @

  # 編集対象を設定する
  setTargetElement: (elm) =>
    if $(elm).closest(SmartEditor.disableSelectors.join(',')).length
      return true
    if not @mainPanelModel.get('targetLocked')
      targetModels = @findElementModels(elm)
      @mainPanelModel.set targetModels: targetModels

  # クリックイベントによって編集対象を設定する
  onClick: (e) =>
    if $(e.target).closest(SmartEditor.disableSelectors.join(',')).length
      return true
    e.stopPropagation()
#      e.preventDefault()

    if not @mainPanelModel.get('targetLocked')
      targetModels = @findElementModels(e.target)
      @mainPanelModel.set targetModels: targetModels

      pos = {
        x: e.pageX - 50
        y: e.pageY - 50
      }

      $el = @mainPanelView.$el
      viewWidth = $(window).width()
      pos.x = viewWidth - ($el.width() + 20)  if pos.x + $el.width() + 20 > viewWidth
      pos.x = 0  if pos.x < 0
      pos.y = pos.y - 70
      pos.y = 0  if pos.y < 0

      @mainPanelModel.set position: pos
    @

  findElementModels: (targetEl) ->
    models = []
    testResults = {}
    for name, func of SmartEditor.elementTests
      testResults[name] = func(targetEl)

    for f in SmartEditor.factories
      obj = f(targetEl, testResults)
      if obj?
        models.push(obj)
    return models

  closeEdit: () ->
    @mainPanelView.close()
    @

###
Main floating panel of the editor
###
class SmartEditor.MainPanelModel extends Backbone.Model
  defaults:
    targetLocked: false       #編集対象にロックされたものがある
    targetEl: undefined	      #編集対象としてクリックされた要素
    targetModels: []	      #編集対象が持つモデル(将来的には複数)
    visibility: false         #パネルが表示されている
    position:                 #パネルの表示位置
      x: 0
      y: 0

class SmartEditor.MainPanelView extends Backbone.View
  tagName: "div"
  className: "smarteditor-main-panel"

  $buttonsEl: undefined,
  $subButtonsEl: undefined,

  initialize: ->
    @$el = $(@el)

    v = new SmartEditor.widgets['Action'].V(
      model: new SmartEditor.widgets['Action'].M(
        {name: 'closePanel', elModel:@model, schema:{type:'Action', title:'x'} }))
    $closeBtn = $("a",v.$el)
    @$el.append $closeBtn

    @$buttonsEl = $("<ul class=\"buttons\"></ul>")
    @$el.append @$buttonsEl
    @$subButtonsEl = $("<ul class=\"subbuttons\"></ul>")
    @$el.append @$subButtonsEl

    @model.bind "change:position", @changePosition
    @model.bind "change:targetModels", @changeTargetModels
    @model.bind "change:visibility", @changeVisibility
    @

  events: 
    "click a.ui-btn-closePanel": "closePanel"
    "mousedown.smarteditor-main-panel": "dragPanel"

  dragPanel: (e) =>
    @model.set draging: {x:e.pageX, y:e.pageY}
    $(document.body).off('mousemove', @movePanel)
    $(document.body).off('mouseup', @dropPanel)
    $(document.body).on('mousemove', @movePanel)
    $(document.body).on('mouseup', @dropPanel)
    e.preventDefault()

  movePanel: (e) =>
    prev_pos = @model.get 'draging'
    pos = @model.get("position")
    newpos = 
      x: pos.x + (e.pageX - prev_pos.x)
      y: pos.y + (e.pageY - prev_pos.y)
      animate:false

    @model.set draging: {x:e.pageX, y:e.pageY}
    @model.set position: newpos

  dropPanel: (e) =>
    $(document.body).off('mousemove', @movePanel)
    $(document.body).off('mouseup', @dropPanel)
    prev_pos = @model.get 'draging'
    pos = @model.get("position")

    newpos = 
      x: pos.x + (e.pageX - prev_pos.x)
      y: pos.y + (e.pageY - prev_pos.y)
    @model.set draging: {}
    @model.set position: newpos

  changeVisibility: =>
    if @model.get('visibility')
      @$el.show 'fast'
    else
      @$el.hide 'fast'

  changePosition: =>
    pos = @model.get("position")
    if @model.get('visibility')
      if not pos.animate? or pos.animate
        @$el.animate
          top: pos.y
          left: pos.x
          ,
          queue: false
      else
        @$el.css('top', pos.y);
        @$el.css('left', pos.x);
    @

  createWidget: (name, schemaObj, elModel) ->
    code = SmartEditor.options.menuCSSPrefix + "-" + name
    widgets = SmartEditor.widgets

    if schemaObj.type in (k for k,v of widgets)
      m = new widgets[schemaObj.type].M({name: name, elModel:elModel, schema:schemaObj })
      v = new widgets[schemaObj.type].V({model: m})
      return v.el
    return undefined

  changeSchemas: =>
    editorModel = @model

    targetModels = editorModel.get("targetModels")
    @$buttonsEl.empty()
    hasModel = false
    disables = []
    for targetModel in targetModels
      for name,obj of targetModel.schema
        if obj.conflicts and not obj.disabled
          disables = disables.concat obj.conflicts
    isConflict = (model, schema_name) ->
      return ((model.name == disable.model) and (schema_name == disable.schema)) for disable in disables

    for targetModel in targetModels
      if SmartEditor.widgetMapper[targetModel.name]?
        for widget, schema of SmartEditor.widgetMapper[targetModel.name]
          widgets = SmartEditor.widgets
          if widgets[widget]?
            m = new widgets[widget].M({elModel:targetModel, schema:schema})
            w = new widgets[widget].V({model:m})
            @$buttonsEl.append w.el
            hasModel=true
      else
        ((@$buttonsEl.append @createWidget(name, obj, targetModel); hasModel=true) if not obj.disabled and not isConflict(targetModel,name)) for name,obj of targetModel.schema
    @model.set {'visibility': hasModel}
    @

  changeTargetLocked: =>
    hasLocked = false
    for targetModel in @model.get("targetModels")
      if targetModel.get('locked')
        hasLocked = true
        break
    @model.set 'targetLocked': hasLocked


  changeTargetModels: =>
    editorModel = @model
    for targetModel in editorModel.previous("targetModels")
      targetModel.unbind('updatedSchema', @changeSchemas)
      targetModel.unbind('change:locked', @changeTargetLocked)
      targetModel.trigger "closeEdit"
    targetModels = editorModel.get("targetModels")
    @changeSchemas()
    for m in targetModels
      m.trigger 'openEdit'
      m.bind('change:locked', @changeTargetLocked)
      m.bind('updatedSchema', @changeSchemas)

    @

  closePanel: =>
    if @model.get("targetLocked")
      return
    @$el.hide()
    for targetModel in @model.get('targetModels')
      targetModel.trigger "closeEdit"

    @model.set
      targetModels: []
      targetEl: undefined
    @



class SmartEditor.ElementModel extends Backbone.Model
  defaults:
    type: "base"
    id: undefined
  schema: {}

class SmartEditor.ElementView extends Backbone.View
  defaults:
    type: "base"
    id: undefined

  updateValue: ->
    @

  initialize: ->
    super
    $(@el).on "click", (e) ->
      e.preventDefault()
      false


# TODO REFACTORING
$ =>
  @smartEditor = new SmartEditor()

class @SmartEditorPlugins

  @edit_dialog: {}
  
  @contenteditable: []
