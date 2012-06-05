class ManagedHTMLModel extends SmartEditor.ElementModel

  defaults:
    'locked': false
    'loading': false
    'hasChange': false
    'targetEl': undefined

  schema:
    'back': {type: 'Action', title:'戻る',disabled:true}
    'commit': { type: 'Action', title:'登録', disabled:true}
    'edit': {type: 'Action', title:'編集', disabled:true}
    'html_editor': {type: 'Action', title:'HTML', disabled:true}
    'insert': {type: 'Action', title:'新規', disabled:true}
    #'move': {type: 'Action', title:'移動', disabled:true}
    'delete': {type: 'Action', title:'削除', disabled:true}
    'publish': {type: 'Action', title:'公開', disabled:true}
    'history': {type: 'Action', title:'履歴', disabled:true}
    'loading': {type: 'Loading', message: '<div class="managed_html_spinner" style="width:100%;top:12px;left:10px;position:absolute;"></div>'}
    
class ManagedHTMLView extends SmartEditor.ElementView
  initialize: ->
    super
    (@model.bind(key, @[key]) if @[key]?) for key of @model.schema
    (@model.bind("change:#{key}", @[key]) if @[key]?) for key of @model.defaults
    @model.bind("openEdit", @openEdit)
    @model.bind("closeEdit", @closeEdit)
    @$el = $(@el)

    @el.content_id = @el.id.replace('managed_html_content_block_', '')
    @el.form_id = "managed_html_content_form_"+@el.content_id
    
    if this.$el.is('.editing')
      @model.schema[name].disabled = false for name in ['back', 'commit', 'insert', 'html_editor']
    else
      @model.schema[name].disabled = false for name in ['edit', 'history']
    
    if @$el.hasClass('managed_html_content_block_pending') and $('#'+@el.form_id).length == 0
      @model.schema.publish.disabled = false

    if 0 != @$el.closest("div[contenteditable=true][id!="+@el.id+"]").length and 0 != @$el.closest(".handlebars_content_block").find('.managed_html_content_inner').length
      @model.schema[name].disabled = true for name in ['edit','history', 'back', 'commit', 'insert', 'html_editor']
      @model.schema[name].disabled = false for name in ['insert', 'html_editor', 'delete']

    $('.managed_html_content_anchor_pending, .managed_html_content_anchor').attr "contenteditable", false
    
    for plugin in SmartEditorPlugins.contenteditable
      $('[content_type='+plugin+']').attr("contenteditable", false).find('*').attr("contenteditable", false)
    @

  openEdit: =>
    @

  closeEdit: =>
    @model.unbind('openEdit')
    @model.unbind('closeEdit')
    @unbind()
    @

  back: (obj) =>
    $("*", @$el).attr "contenteditable", false
    @$el.removeClass('editing')
    @model.set 
      'locked': true
      'loading': true
    managed_html_ajax_page document.location, {"_action": "back", "_managed_html": @el.content_id}, @el.id, =>
      @model.set 
        'locked': false
        'loading': false
      smartEditor.setTargetElement(@el)
    @

  commit: (obj) =>
    $("*", @$el).attr "contenteditable", false
    @$el.removeClass('editing')
    @model.set 
      'loading': true
      'locked': true
    if $("#"+@el.form_id+" form textarea").attr('name') is 'handlebars'
      $data = ''
      if @$el.find('[hid]').length == 0
        $data = $('<div>').append(@$el.find('.managed_html_content_inner').html())
      else
        text = $("#"+@el.form_id+" form textarea").text().replace(/document\.write\([^\)]*\)/,"")
        $data = $($('<div>').append(text))
      
      dom = @$el.clone()
      dom.find('[id^=managed_html_content_block_]').each ->
        name = $(this).attr('id').replace('managed_html_content_block_', '')
        type = $(this).attr('content_type')
        $(this).after('{{load type="' + type + '" name="' + name + '"}}')
        $(this).remove()
      dom.find('.new_content_block').each ->
        name = $(this).attr('hid')
        type = $(this).attr('content_type')
        $(this).after('{{load type="' + type + '" name="' + name + '"}}')
        $(this).remove()
      dom.find('[hid]').each ->
        $data.find('[hid='+$(this).attr('hid')+']').html(SmartEditor.utils.remove_document_write($(this).html()))
      $data.find('[content_type=script]').remove()
      $data.find('.managed_html_content_anchor').closest(".handlebars_content_block").remove()
      $data.removeAttr('contenteditable')
      $("#"+@el.form_id+" form textarea").text($data.html())

    else if $("#"+@el.form_id+" form textarea").attr('name') is 'html'
      $("#"+@el.form_id+" form textarea").text(@$el.find('.managed_html_content_inner').html())

    postData =
      '_action':"edit"
      '_managed_html':@el.content_id
    $("#"+@el.form_id+" form").find(':input').each ->
      postData[$(this).attr('name')] = $(this).val()
    managed_html_ajax_page document.location, postData, @el.id, =>
      @model.set 
        'loading': false
        'locked': false
      smartEditor.setTargetElement(@el)

      @$el.addClass('managed_html_content_block_pending')
      $('#'+@el.form_id).remove()
    @

  edit: =>
    @model.set 
      'loading': true
      'locked': true
    @$el.find('div.managed_html_content_block .managed_html_content_inner,div.managed_html_content_block .managed_html_content_inner > *').css('outline', '3px solid rgba(255, 0, 0, 0.6)')
    @$el.find('.managed_html_content_block .managed_html_content_inner').each ->
      $(this).closest(".managed_html_content_block").attr('contenteditable', 'false').css('background-color', 'grey')

    $('#'+@el.form_id).remove()
    $('body').append($('<div>').attr('id', @el.form_id).hide())

    managed_html_ajax_page document.location, {"_action": "edit", "_managed_html": @el.content_id}, @el.form_id, =>
      @model.set 
        'loading': false
        'locked': false

      $("*:not(.managed_html_content_block .managed_html_content_inner, .managed_html_content)",@$el).attr "contenteditable", true
      @$el.addClass('editing')

      if $('#'+@el.form_id+" form textarea").attr('name') != 'handlebars'
        @model.schema[name].disabled = true for name in ['insert', 'html_editor']
        @model.trigger 'updatedSchema'

      if SmartEditorPlugins.edit_dialog[@$el.attr('content_type')]
        SmartEditorPlugins.edit_dialog[@$el.attr('content_type')](@model, this)

      hid = $(@model.get('targetEl'))?.attr('hid')
      if hid?
        for elm in $('[hid='+hid+']')
          closest = $(elm).closest('.managed_html_content_block')
          if closest.length>0 && closest[0]==@el
            smartEditor.setTargetElement(elm)
      else
        smartEditor.setTargetElement(@$el)
    @
  
  html_editor: =>
    @model.set 
      'loading': true
      'locked': true
    baseEl = $(@model.get('targetEl'))
    if baseEl.attr('hid') is undefined
      baseEl = baseEl.closest(".handlebars_content_block")

    dialog = SmartEditor.utils.dialog 'form_html_editor', "loading..." 
    managed_html_ajax_page document.location, {"_action": "edit", "_managed_html": @el.content_id, 'dummy_form':'true'}, 'content_form_html_editor', =>
      @model.set 
        'loading': false
        'locked': false
      @model.schema[name].disabled = false for name in ['back', 'commit', 'insert', 'html_editor']
      @model.trigger 'updatedSchema'

      form = dialog.find('form')
      $('#managed_html_content_form_'+@el.content_id).find('input[name=_formkey]').val(form.find('input[name=_formkey]').val())
      
      try
        $data = $($('<div>').append(SmartEditor.utils.remove_document_write(form.find('textarea').text())))
        form.find('textarea').val("<div>"+form.find('textarea').text()+"</div>")
      catch error
        "And the error is ... #{error}"
      form.append($('<input type="button" name="submit_button" value="登録する"/>'))
      form.find('input[name=submit_button]').bind 'click', (event) =>
        @model.set 
          'loading': true
          'locked': true

        postData =
          '_action':"edit"
          '_managed_html':@el.content_id
        form.find(':input').each ->
          postData[$(this).attr('name')] = $(this).val()
        iframe = dialog.find('iframe')
        source_active = dialog.find('.tabsbar .source').hasClass('active')
        if !source_active and iframe.length>0
          key = iframe.next().attr('name')
          value = form.find('iframe:first').contents().find('body').html()
          postData[key] = value

        managed_html_ajax_page document.location, postData, @el.id, =>
          @model.set 
            'loading': false
            'locked': false
          @model.schema[name].disabled = true for name in ['back', 'commit', 'insert', 'html_editor']
          @model.schema[name].disabled = false for name in ['edit', 'history', 'publish']
          @model.trigger 'updatedSchema'
          $('#'+@el.form_id).remove()
          @$el.addClass('managed_html_content_block_pending')
        dialog.remove()
    dialog.show()
    @
  
  insert:(obj) =>
    @model.set 
      'loading': true
      'locked': true
    baseEl = $(@model.get('targetEl'))
    if baseEl.attr('hid') is undefined
      baseEl = baseEl.closest(".handlebars_content_block")
    dialog = SmartEditor.utils.dialog 'form_insert', "loading..." 
    managed_html_ajax_page document.location, {"_action": "show_add_content", "_managed_html": @el.content_id, "target_el":baseEl.attr('hid')}, 'content_form_insert', =>
      @model.set 
        'loading': false
        'locked': false
      dialog.find('form input[type=submit]').after($('<input type="button" name="submit_button" value="登録する"/>')).hide()
      dialog.find('form input[name=submit_button]').bind 'click', (event) =>
        load = '<div>{{load type="'+dialog.find('[name=content_type]').val()+'" name="'+dialog.find('[name=_name]').val()+'"}}</div>'
        $data = $($('<div>').append(SmartEditor.utils.remove_document_write($('#' + @el.form_id + " form textarea").text())))
        $data.find('[hid=' + baseEl.attr('hid') + ']').after(load)
        $('#' + @el.form_id + " form textarea").text($data.html())
        baseEl.after($('<div hid="'+dialog.find('[name=_name]').val()+'" contenteditable="false" class="new_content_block" content_type="'+dialog.find('[name=content_type]').val()+'"><div class="managed_html_content_anchor" onclick="">&nbsp;</div><div onclick="" class="managed_html_content_inner"><div class="managed_html_empty_content">&nbsp;</div></div></div>'));
        dialog.remove()
    dialog.show()
    @
  
  delete: (obj) =>
    baseEl = $(@model.get('targetEl'))
    if baseEl.attr('hid') is undefined
      baseEl = baseEl.closest(".handlebars_content_block")
    baseEl = baseEl.closest(".handlebars_content_block")
    parent = baseEl.closest(".managed_html_content_block")
    $data = $($('<div>').append(SmartEditor.utils.remove_document_write($("#"+parent.attr('id').replace('managed_html_content_block_', 'managed_html_content_form_')+" form textarea").text())))
    $data.find('[hid='+baseEl.attr('hid')+']').remove()
    $("#"+parent.attr('id').replace('managed_html_content_block_', 'managed_html_content_form_')+" form textarea").text($data.html().replace('{{load type="'+@$el.attr('content_type')+'" name="'+@el.content_id+'"}}', ''))
    @$el.remove()
    $('#'+@el.form_id).remove()
    @model.schema[name].disabled = false for name in ['edit', 'html_editor', 'history', 'publish']
    @model.trigger 'updatedSchema'
    @model.set
      'locked': false
      "hasChange": true
    @

  move: (obj) =>
    baseEl = $(@model.get('targetEl'))
    if baseEl.attr('hid') is undefined
      baseEl = baseEl.closest(".handlebars_content_block")
    baseEl.draggable().draggable('enable')
    baseEl.closest("[content_type=handlebars]").find(".handlebars_content_block").droppable(
      drop: (ev, ui) ->
        ui.draggable.draggable('disable')
        ui.draggable.css({'left':'', 'top':''})
        $(this).after(ui.draggable)
        $('.handlebars_content_block').
          removeClass('ui-droppable').
          removeClass('ui-draggable').
          removeClass('ui-draggable-disabled').
          removeClass('ui-state-disabled')
          
        parent = ui.draggable.closest("[content_type=handlebars]")
        form = "#managed_html_content_form_"+parent.attr('id').replace('managed_html_content_block_', '')
        $data = $($('<div>').append(SmartEditor.utils.remove_document_write($(form+" form textarea").text())))
        $data.find('[hid=' + $(this).attr('hid') + ']').
          after($data.find('[hid=' + ui.draggable.attr('hid') + ']'))
        $(form+" form textarea").text($data.html())
    )
    @
    
  publish: (obj) =>
    managed_html_ajax_page(document.location, {"_action": "publish_now", "_managed_html": @el.content_id}, @el.id, =>
      @model.set "hasChange": false
      @model.set 'loading': false
      @model.trigger 'updatedSchema'
    )
    @model.set 'loading': true
    @model.schema.publish.disabled = true
    @model.trigger 'updatedSchema'
    @
  
  history: (obj) =>
    el = @el
    $('body').append($('<div>').attr('id', @el.form_id).hide())
    managed_html_ajax_page(document.location, {"_action": "edit", "_managed_html": @el.content_id}, @el.form_id)
    dialog = SmartEditor.utils.dialog 'form_history', "loading..." 
    managed_html_ajax_page document.location, {"_action": "history", "_managed_html_history_grid": @el.content_id}, 'content_form_history', ->
      dialog.find('.ui-btn[href=#]').click ->
        $('#'+el.form_id+' form').find('textarea').val($(this).closest('tr').find('textarea').val())
        postData =
          '_action':"edit"
          '_managed_html':el.content_id
        $('#'+el.form_id+' form').find(':input').each ->
          postData[$(this).attr('name')] = $(this).val()
        managed_html_ajax_page document.location, postData, el.id, =>
          dialog.remove();
          $('#'+el.form_id).remove()
    dialog.show()
    @

# クリックイベントによる対象変更をキャンセルする。jQueryセレクタで指定
SmartEditor.disableSelectors.push('.managed_html_dialog')

SmartEditor.factories.push (target_el) =>
  el = $(target_el).closest(".managed_html_content_block")[0]

  if el?
    model = new ManagedHTMLModel({
      targetEl: target_el
    })
    model.schema = SmartEditor.utils.clone model.schema
    view = new ManagedHTMLView(
      model: model
      el: el
      tagName: el.tagName
    )
    return model
  return undefined

#  models['ManagedHTMLModel'] = ManagedHTMLModel
#  views['ManagedHTMLView'] = ManagedHTMLView
