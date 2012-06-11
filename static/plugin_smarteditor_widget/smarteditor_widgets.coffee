
#////////////////////////////////////////////////
#// Tooltip***Widget
#// スキーマによって選択される、パネルに表示する要素のModel & View
#///////////////////////////////////////

class TooltipLoadingWidgetModel extends Backbone.Model
  defaults:
    name: undefined
    schema: undefined
    elModel: undefined

class TooltipLoadingWidgetView extends Backbone.View
  tagName: 'li'
  className: ''
  initialize: ->
    @$el = $(@el)
    @render()
    @model.get('elModel').bind('change:'+@model.get('name'), @render )
    @

  render: =>
    if @model.get('elModel').get(@model.get('name'))
      @renderEnable()
    else
      @renderDisable()

  renderEnable: ->
    @el.innerHTML = @model.get('schema').message
  renderDisable: ->
    @el.innerHTML = ''

SmartEditor.widgets['Loading'] = {M:TooltipLoadingWidgetModel,V:TooltipLoadingWidgetView}

#------------------------------------------
class TooltipButtonWidgetModel extends Backbone.Model
  defaults:
    name: undefined
    schema: undefined
    elModel: undefined

class TooltipButtonWidgetView extends Backbone.View
  tagName: 'li'
  className: ''

  initialize: ->
    @$el = $(@el)
    @render()
    @

  events: 
    "click .ui-btn": "action"

  action: (e) ->
    e.preventDefault()
    eventName = @model.get('name')

    @model.get('elModel').trigger eventName, {el:e.target, val:@model.get('schema').val}
    @

  render: ->
    name = @model.get('name')
    code = SmartEditor.options.menuCSSPrefix + "-" + name

    $buttonEl = $('<a href=\"#\" class=\"ui-btn ' + code + '\" title=\"' + name + '\"></a>')
    $spanEl = $("<span class=\"ui-icon ui-icon-" + name + " " + code + "\"></span>")
    $spacerEl = $("<span class=\"spacer\"></span>")
    $spacerEl.append (if @renderLabel() then @renderLabel() else '&nbsp;')

    $buttonEl.append $spanEl
    $buttonEl.append $spacerEl
    @$el.append($buttonEl)

    @

  renderLabel: ->
    @model.get('schema').title

SmartEditor.widgets['Action'] = {M:TooltipButtonWidgetModel,V:TooltipButtonWidgetView}



#----------------------------
class TooltipTextWidgetModel extends Backbone.Model
  defaults:
    name: undefined
    schema: undefined
    elModel: undefined

class TooltipTextWidgetView extends Backbone.View
  tagName: 'li'
  className: ''
  initialize: ->
    @$el = $(@el)
    @render()
    @

  render: ->
    name = @model.get('name')
    schema = @model.get('schema')
    elModel = @model.get('elModel')

    form = new Backbone.Form(
      model: elModel
      fields: [name]
      idPrefix: SmartEditor.options.menuCSSPrefix + "-"
    )
    form.render()
    $form_el = $(form.el)
    $form_el.on "change", ->
      form.commit()

    @$el.append($form_el)

    @

SmartEditor.widgets['Text'] = {M:TooltipTextWidgetModel,V:TooltipTextWidgetView}


#----------------------------
class TooltipSelectWidgetModel extends Backbone.Model
  defaults:
    name: undefined
    schema: undefined
    elModel: undefined

class TooltipSelectWidgetView extends Backbone.View
  tagName: 'li'
  className: ''
  initialize: ->
    @$el = $(@el)
    @render()
    @

  render: ->
    name = @model.get('name')
    schema = @model.get('schema')
    elModel = @model.get('elModel')
    code = SmartEditor.options.menuCSSPrefix + "-" + name
    $buttonEl = $('<a href="#" class="dropdown-toggle ui-btn" data-toggle="dropdown" title="' + name + '"></a>')
    $spanEl = $("<span class=\"ui-icon ui-icon-" + name + " " + code + "\"></span>")
    title = if schema['title'] then schema['title'] else '&nbsp;'
    $spacerEl = $("<span class=\"spacer\">#{title}</span>")
    $buttonEl.append $spanEl
    $buttonEl.append $spacerEl

    $submenu = $('<ul class="dropdown-menu"></ul>')
    createWidget = (name, schema, elModel) =>
      v = new TooltipButtonWidgetView
        model: new TooltipButtonWidgetModel
          'name':name
          'schema':schema
          'elModel':elModel
      v.$el
    ($submenu.append createWidget(name, {type:'Action', title:$(obj.label), val:obj.val}, elModel)) for obj in schema.options
    @$el.addClass('dropdown')
    @$el.append($buttonEl)
    @$el.append($submenu)
    @

SmartEditor.widgets['Select'] = {M:TooltipSelectWidgetModel,V:TooltipSelectWidgetView}



class DropdownFormsModel extends Backbone.Model
  defaults:
    name: undefined
    schema: undefined
    elModel: undefined

class DropdownFormsView extends Backbone.View
  tagName: 'li'
  className: ''
  initialize: ->
    @$el = $(@el)
    @render()
    @

  render: ->
    schema = @model.get('schema')
    elModel = @model.get('elModel')
    form = new Backbone.Form(
      model: elModel
      fields: schema.fields
      idPrefix: SmartEditor.options.menuCSSPrefix + "-"
    )
    form.render()
    $form_el = $(form.el)
    $form_el.on "change", ->
      form.commit()

    code = SmartEditor.options.menuCSSPrefix + "-dropdownforms-" + elModel.name
    $buttonEl = $('<a href="#" class="dropdown-toggle ui-btn" data-toggle="dropdown" title="' + elModel.name + '"></a>')
    $spanEl = $("<span class=\"ui-icon ui-icon-" + name + " " + code + "\"></span>")
    title = if schema['title'] then schema['title'] else '&nbsp;'
    $spacerEl = $("<span class=\"spacer\">#{title}</span>")
    $buttonEl.append $spanEl
    $buttonEl.append $spacerEl

    $submenu = $('<ul class="dropdown-menu"></ul>')
    $submenu.append($form_el)

    $form_el.click (e) ->
      e.stopPropagation();

    @$el.empty()
    @$el.append($buttonEl)
    @$el.append($submenu)

    @

SmartEditor.widgets['DropdownForms'] = {M:DropdownFormsModel, V:DropdownFormsView}
