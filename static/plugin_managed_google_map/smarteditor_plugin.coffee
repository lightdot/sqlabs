SmartEditorPlugins.contenteditable.push 'google_map'

SmartEditorPlugins.edit_dialog['google_map'] = (@model, @view) =>
  
  baseEl = $(@model.targetEl)
  if baseEl.attr('hid') is undefined
    baseEl = baseEl.closest(".handlebars_content_block")
  dialog = SmartEditor.utils.dialog 'form_google_map', "<table><tbody>" + 
    "<tr><td class=\"w2p_fl\"><label>タイトル: </label></td><td class=\"w2p_fw\"><input class=\"string\" name=\"title\" type=\"text\" value=\"\"></td><td class=\"w2p_fc\"></td></tr>" + 
    "<tr><td class=\"w2p_fl\"><label>緯度: </label></td><td class=\"w2p_fw\"><input class=\"string\" name=\"lat\" type=\"text\" value=\"\"></td><td class=\"w2p_fc\"></td></tr>" + 
    "<tr><td class=\"w2p_fl\"><label>経度: </label></td><td class=\"w2p_fw\"><input class=\"string\" name=\"long\" type=\"text\" value=\"\"></td><td class=\"w2p_fc\"></td></tr>" + 
    "<tr><td class=\"w2p_fl\"><label>マーカー緯度: </label></td><td class=\"w2p_fw\"><input class=\"string\" name=\"marker_lat\" type=\"text\" value=\"\"></td><td class=\"w2p_fc\"></td></tr>" + 
    "<tr><td class=\"w2p_fl\"><label>マーカー経度: </label></td><td class=\"w2p_fw\"><input class=\"string\" name=\"marker_long\" type=\"text\" value=\"\"></td><td class=\"w2p_fc\"></td></tr>" + 
    "<tr><td class=\"w2p_fl\"><label>マーカー画像: </label></td><td class=\"w2p_fw\"><input class=\"string\" name=\"marker_image\" type=\"text\" value=\"\"></td><td class=\"w2p_fc\"></td></tr>" + 
    "<tr><td class=\"w2p_fl\"><label>テンプレート: </label></td><td class=\"w2p_fw\"><textarea class=\"text\" cols=\"40\" name=\"template\" rows=\"10\"></textarea></td><td class=\"w2p_fc\"></td></tr>" + 
    "<tr id=\"submit_record__row\"><td class=\"w2p_fl\"></td><td class=\"w2p_fw\"><input type=\"button\" name=\"submit\" value=\"登録する\"></td><td class=\"w2p_fc\"></td></tr></tbody></table>"
  dialog.find('input[name=title]').val($('#no_table_title').val())
  dialog.find('input[name=lat]').val($('#no_table_lat').val())
  dialog.find('input[name=long]').val($('#no_table_long').val())
  dialog.find('input[name=marker_lat]').val($('#no_table_marker_lat').val())
  dialog.find('input[name=marker_long]').val($('#no_table_marker_long').val())
  dialog.find('input[name=marker_image]').val($('#no_table_marker_image').val())
  dialog.find('textarea[name=template]').html($('#no_table_template').html())
  dialog.find('input[name=submit]').bind 'click', (event) =>
    $('#no_table_title').val(dialog.find('input[name=title]').val())
    $('#no_table_lat').val(dialog.find('input[name=lat]').val())
    $('#no_table_long').val(dialog.find('input[name=long]').val())
    $('#no_table_marker_lat').val(dialog.find('input[name=marker_lat]').val())
    $('#no_table_marker_long').val(dialog.find('input[name=marker_long]').val())
    $('#no_table_marker_image').val(dialog.find('input[name=marker_image]').val())
    $('#no_table_template').html(dialog.find('textarea[name=template]').val())
    dialog.remove()
    @view.commit()

  dialog.show()
