(function() {
  var _this = this;

  SmartEditorPlugins.edit_dialog['script'] = function(model, view) {
    var baseEl, dialog;
    _this.model = model;
    _this.view = view;
    baseEl = $(_this.model.targetEl);
    if (baseEl.attr('hid') === void 0) {
      baseEl = baseEl.closest(".handlebars_content_block");
    }
    dialog = SmartEditor.utils.dialog('form_script', "<table><tbody>" + "<tr><td class=\"w2p_fl\"><label>Javascript: </label></td><td class=\"w2p_fw\"><textarea class=\"text\" cols=\"40\" name=\"script\" rows=\"10\"></textarea></td><td class=\"w2p_fc\"></td></tr>" + "<table><tbody><tr id=\"submit_record__row\"><td class=\"w2p_fw\"><input type=\"button\" name=\"submit_button\" value=\"登録する\"></td></tr></tbody></table>");
    dialog.find('textarea[name=script]').val($('#no_table_script').val());
    dialog.find('input[name=submit_button]').bind('click', function(event) {
      $('#no_table_script').val(dialog.find('textarea[name=script]').val());
      dialog.remove();
      return _this.view.commit();
    });
    return dialog.show();
  };

}).call(this);
