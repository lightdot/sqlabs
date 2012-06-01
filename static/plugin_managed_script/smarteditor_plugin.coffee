SmartEditorPlugins.edit_dialog['script'] = (@model, @view) =>

  baseEl = $(@model.targetEl)
  if baseEl.attr('hid') is undefined
    baseEl = baseEl.closest(".handlebars_content_block")

  dialog = SmartEditor.utils.dialog 'form_script', 
    "<table><tbody>" + 
    "<tr><td class=\"w2p_fl\"><label>Javascript: </label></td><td class=\"w2p_fw\"><textarea class=\"text\" cols=\"40\" name=\"script\" rows=\"10\"></textarea></td><td class=\"w2p_fc\"></td></tr>" + 
    "<table><tbody><tr id=\"submit_record__row\"><td class=\"w2p_fw\"><input type=\"button\" name=\"submit_button\" value=\"登録する\"></td></tr></tbody></table>"

  dialog.find('textarea[name=script]').val($('#no_table_script').val())
  dialog.find('input[name=submit_button]').bind 'click', (event) =>
    $('#no_table_script').val(dialog.find('textarea[name=script]').val())
    dialog.remove()
    @view.commit()

  dialog.show()
