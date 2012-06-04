(function() {
  var ManagedHTMLModel, ManagedHTMLView,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    _this = this;

  ManagedHTMLModel = (function(_super) {

    __extends(ManagedHTMLModel, _super);

    function ManagedHTMLModel() {
      ManagedHTMLModel.__super__.constructor.apply(this, arguments);
    }

    ManagedHTMLModel.prototype.defaults = {
      'locked': false,
      'loading': false,
      'hasChange': false,
      'targetEl': void 0
    };

    ManagedHTMLModel.prototype.schema = {
      'back': {
        type: 'Action',
        title: '戻る',
        disabled: true
      },
      'commit': {
        type: 'Action',
        title: '登録',
        disabled: true
      },
      'edit': {
        type: 'Action',
        title: '編集',
        disabled: true
      },
      'html_editor': {
        type: 'Action',
        title: 'HTML',
        disabled: true
      },
      'insert': {
        type: 'Action',
        title: '新規',
        disabled: true
      },
      'delete': {
        type: 'Action',
        title: '削除',
        disabled: true
      },
      'publish': {
        type: 'Action',
        title: '公開',
        disabled: true
      },
      'history': {
        type: 'Action',
        title: '履歴',
        disabled: true
      },
      'loading': {
        type: 'Loading',
        message: '<div class="managed_html_spinner" style="width:100%;top:12px;left:10px;position:absolute;"></div>'
      }
    };

    return ManagedHTMLModel;

  })(SmartEditor.ElementModel);

  ManagedHTMLView = (function(_super) {

    __extends(ManagedHTMLView, _super);

    function ManagedHTMLView() {
      this.history = __bind(this.history, this);
      this.publish = __bind(this.publish, this);
      this.move = __bind(this.move, this);
      this["delete"] = __bind(this["delete"], this);
      this.insert = __bind(this.insert, this);
      this.html_editor = __bind(this.html_editor, this);
      this.edit = __bind(this.edit, this);
      this.commit = __bind(this.commit, this);
      this.back = __bind(this.back, this);
      this.closeEdit = __bind(this.closeEdit, this);
      this.openEdit = __bind(this.openEdit, this);
      ManagedHTMLView.__super__.constructor.apply(this, arguments);
    }

    ManagedHTMLView.prototype.initialize = function() {
      var key, name, plugin, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _m, _ref, _ref2, _ref3, _ref4, _ref5;
      ManagedHTMLView.__super__.initialize.apply(this, arguments);
      for (key in this.model.schema) {
        if (this[key] != null) this.model.bind(key, this[key]);
      }
      for (key in this.model.defaults) {
        if (this[key] != null) this.model.bind("change:" + key, this[key]);
      }
      this.model.bind("openEdit", this.openEdit);
      this.model.bind("closeEdit", this.closeEdit);
      this.$el = $(this.el);
      this.el.content_id = this.el.id.replace('managed_html_content_block_', '');
      this.el.form_id = "managed_html_content_form_" + this.el.content_id;
      if (0 < $(this.model.get('targetEl')).closest('[contenteditable=true]').length) {
        _ref = ['back', 'commit', 'insert', 'html_editor'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          this.model.schema[name].disabled = false;
        }
      } else {
        _ref2 = ['edit', 'history'];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          name = _ref2[_j];
          this.model.schema[name].disabled = false;
        }
      }
      if (this.$el.hasClass('managed_html_content_block_pending') && $('#' + this.el.form_id).length === 0) {
        this.model.schema.publish.disabled = false;
      }
      if (0 !== this.$el.closest("div[contenteditable=true][id!=" + this.el.id + "]").length && 0 !== this.$el.closest(".handlebars_content_block").find('.managed_html_content_inner').length) {
        _ref3 = ['edit', 'history', 'back', 'commit', 'insert', 'html_editor'];
        for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
          name = _ref3[_k];
          this.model.schema[name].disabled = true;
        }
        _ref4 = ['move', 'insert', 'html_editor', 'delete'];
        for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
          name = _ref4[_l];
          this.model.schema[name].disabled = false;
        }
      }
      $('.managed_html_content_anchor_pending, .managed_html_content_anchor').attr("contenteditable", false);
      _ref5 = SmartEditorPlugins.contenteditable;
      for (_m = 0, _len5 = _ref5.length; _m < _len5; _m++) {
        plugin = _ref5[_m];
        $('[content_type=' + plugin + ']').attr("contenteditable", false).find('*').attr("contenteditable", false);
      }
      return this;
    };

    ManagedHTMLView.prototype.openEdit = function() {
      return this;
    };

    ManagedHTMLView.prototype.closeEdit = function() {
      return this;
    };

    ManagedHTMLView.prototype.back = function(obj) {
      var _this = this;
      $("*", this.$el).attr("contenteditable", false);
      this.model.set({
        'locked': true,
        'loading': true
      });
      managed_html_ajax_page(document.location, {
        "_action": "back",
        "_managed_html": this.el.content_id
      }, this.el.id, function() {
        var hid, _ref;
        _this.model.set({
          'locked': false,
          'loading': false
        });
        hid = (_ref = $(_this.model.get('targetEl'))) != null ? _ref.attr('hid') : void 0;
        if ((hid != null) && $('[hid=' + hid + ']').length > 0) {
          return smartEditor.resetTargetElement($('[hid=' + hid + ']')[0]);
        }
      });
      return this;
    };

    ManagedHTMLView.prototype.commit = function(obj) {
      var $data, dom, postData, text,
        _this = this;
      $("*", this.$el).attr("contenteditable", false);
      this.model.set({
        'loading': true,
        'locked': true
      });
      if ($("#" + this.el.form_id + " form textarea").attr('name') === 'handlebars') {
        $data = '';
        if (this.$el.find('[hid]').length === 0) {
          $data = $('<div>').append(this.$el.find('.managed_html_content_inner').html());
        } else {
          text = $("#" + this.el.form_id + " form textarea").text().replace(/document\.write\([^\)]*\)/, "");
          $data = $($('<div>').append(text));
        }
        dom = this.$el.clone();
        dom.find('[id^=managed_html_content_block_]').each(function() {
          var name, type;
          name = $(this).attr('id').replace('managed_html_content_block_', '');
          type = $(this).attr('content_type');
          $(this).after('{{load type="' + type + '" name="' + name + '"}}');
          return $(this).remove();
        });
        dom.find('.new_content_block').each(function() {
          var name, type;
          name = $(this).attr('hid');
          type = $(this).attr('content_type');
          $(this).after('{{load type="' + type + '" name="' + name + '"}}');
          return $(this).remove();
        });
        dom.find('[hid]').each(function() {
          return $data.find('[hid=' + $(this).attr('hid') + ']').html(SmartEditor.utils.remove_document_write($(this).html()));
        });
        $data.find('[content_type=script]').remove();
        $data.find('.managed_html_content_anchor').closest(".handlebars_content_block").remove();
        $("#" + this.el.form_id + " form textarea").text($data.html());
      } else if ($("#" + this.el.form_id + " form textarea").attr('name') === 'html') {
        $("#" + this.el.form_id + " form textarea").text(this.$el.find('.managed_html_content_inner').html());
      }
      postData = {
        '_action': "edit",
        '_managed_html': this.el.content_id
      };
      $("#" + this.el.form_id + " form").find(':input').each(function() {
        return postData[$(this).attr('name')] = $(this).val();
      });
      managed_html_ajax_page(document.location, postData, this.el.id, function() {
        var name, _i, _j, _len, _len2, _ref, _ref2;
        _this.model.set({
          'loading': false,
          'locked': false
        });
        _ref = ['back', 'commit', 'insert', 'html_editor'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          _this.model.schema[name].disabled = true;
        }
        _ref2 = ['edit', 'history', 'publish'];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          name = _ref2[_j];
          _this.model.schema[name].disabled = false;
        }
        _this.model.trigger('updatedSchema');
        _this.$el.addClass('managed_html_content_block_pending');
        return $('#' + _this.el.form_id).remove();
      });
      return this;
    };

    ManagedHTMLView.prototype.edit = function() {
      var _this = this;
      this.model.set({
        'loading': true,
        'locked': true
      });
      this.$el.find('div.managed_html_content_block .managed_html_content_inner,div.managed_html_content_block .managed_html_content_inner > *').css('outline', '3px solid rgba(255, 0, 0, 0.6)');
      this.$el.find('.managed_html_content_block .managed_html_content_inner').each(function() {
        return $(this).closest(".managed_html_content_block").attr('contenteditable', 'false').css('background-color', 'grey');
      });
      $('#' + this.el.form_id).remove();
      $('body').append($('<div>').attr('id', this.el.form_id).hide());
      managed_html_ajax_page(document.location, {
        "_action": "edit",
        "_managed_html": this.el.content_id
      }, this.el.form_id, function() {
        var hid, name, _i, _len, _ref, _ref2;
        _this.model.set({
          'loading': false,
          'locked': false
        });
        $("*:not(.managed_html_content_block .managed_html_content_inner, .managed_html_content)", _this.$el).attr("contenteditable", true);
        if ($('#' + _this.el.form_id + " form textarea").attr('name') !== 'handlebars') {
          _ref = ['insert', 'html_editor'];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            name = _ref[_i];
            _this.model.schema[name].disabled = true;
          }
          _this.model.trigger('updatedSchema');
        }
        if (SmartEditorPlugins.edit_dialog[_this.$el.attr('content_type')]) {
          SmartEditorPlugins.edit_dialog[_this.$el.attr('content_type')](_this.model, _this);
        }
        hid = (_ref2 = $(_this.model.get('targetEl'))) != null ? _ref2.attr('hid') : void 0;
        if ((hid != null) && $('[hid=' + hid + ']').length > 0) {
          return smartEditor.resetTargetElement($('[hid=' + hid + ']')[0]);
        }
      });
      return this;
    };

    ManagedHTMLView.prototype.html_editor = function() {
      var baseEl, dialog,
        _this = this;
      this.model.set({
        'loading': true,
        'locked': true
      });
      baseEl = $(this.model.get('targetEl'));
      if (baseEl.attr('hid') === void 0) {
        baseEl = baseEl.closest(".handlebars_content_block");
      }
      dialog = SmartEditor.utils.dialog('form_html_editor', "loading...");
      managed_html_ajax_page(document.location, {
        "_action": "edit",
        "_managed_html": this.el.content_id,
        'dummy_form': 'true'
      }, 'content_form_html_editor', function() {
        var $data, form, name, _i, _len, _ref;
        _this.model.set({
          'loading': false,
          'locked': false
        });
        _ref = ['back', 'commit', 'insert', 'html_editor'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          _this.model.schema[name].disabled = false;
        }
        _this.model.trigger('updatedSchema');
        form = dialog.find('form');
        $('#managed_html_content_form_' + _this.el.content_id).find('input[name=_formkey]').val(form.find('input[name=_formkey]').val());
        try {
          $data = $($('<div>').append(SmartEditor.utils.remove_document_write(form.find('textarea').text())));
          form.find('textarea').val("<div>" + form.find('textarea').text() + "</div>");
        } catch (error) {
          "And the error is ... " + error;
        }
        form.append($('<input type="button" name="submit_button" value="登録する"/>'));
        return form.find('input[name=submit_button]').bind('click', function(event) {
          var iframe, key, postData, source_active, value;
          _this.model.set({
            'loading': true,
            'locked': true
          });
          postData = {
            '_action': "edit",
            '_managed_html': _this.el.content_id
          };
          form.find(':input').each(function() {
            return postData[$(this).attr('name')] = $(this).val();
          });
          iframe = dialog.find('iframe');
          source_active = dialog.find('.tabsbar .source').hasClass('active');
          if (!source_active && iframe.length > 0) {
            key = iframe.next().attr('name');
            value = form.find('iframe:first').contents().find('body').html();
            postData[key] = value;
          }
          managed_html_ajax_page(document.location, postData, _this.el.id, function() {
            var name, _j, _k, _len2, _len3, _ref2, _ref3;
            _this.model.set({
              'loading': false,
              'locked': false
            });
            _ref2 = ['back', 'commit', 'insert', 'html_editor'];
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              name = _ref2[_j];
              _this.model.schema[name].disabled = true;
            }
            _ref3 = ['edit', 'history', 'publish'];
            for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
              name = _ref3[_k];
              _this.model.schema[name].disabled = false;
            }
            _this.model.trigger('updatedSchema');
            $('#' + _this.el.form_id).remove();
            return _this.$el.addClass('managed_html_content_block_pending');
          });
          return dialog.remove();
        });
      });
      dialog.show();
      return this;
    };

    ManagedHTMLView.prototype.insert = function(obj) {
      var baseEl, dialog,
        _this = this;
      this.model.set({
        'loading': true,
        'locked': true
      });
      baseEl = $(this.model.get('targetEl'));
      if (baseEl.attr('hid') === void 0) {
        baseEl = baseEl.closest(".handlebars_content_block");
      }
      dialog = SmartEditor.utils.dialog('form_insert', "loading...");
      managed_html_ajax_page(document.location, {
        "_action": "show_add_content",
        "_managed_html": this.el.content_id,
        "target_el": baseEl.attr('hid')
      }, 'content_form_insert', function() {
        _this.model.set({
          'loading': false,
          'locked': false
        });
        dialog.find('form input[type=submit]').after($('<input type="button" name="submit_button" value="登録する"/>')).hide();
        return dialog.find('form input[name=submit_button]').bind('click', function(event) {
          var $data, load;
          load = '<div>{{load type="' + dialog.find('[name=content_type]').val() + '" name="' + dialog.find('[name=_name]').val() + '"}}</div>';
          $data = $($('<div>').append(SmartEditor.utils.remove_document_write($('#' + _this.el.form_id + " form textarea").text())));
          $data.find('[hid=' + baseEl.attr('hid') + ']').after(load);
          $('#' + _this.el.form_id + " form textarea").text($data.html());
          baseEl.after($('<div hid="' + dialog.find('[name=_name]').val() + '" contenteditable="false" class="new_content_block" content_type="' + dialog.find('[name=content_type]').val() + '"><div class="managed_html_content_anchor" onclick="">&nbsp;</div><div onclick="" class="managed_html_content_inner"><div class="managed_html_empty_content">&nbsp;</div></div></div>'));
          return dialog.remove();
        });
      });
      dialog.show();
      return this;
    };

    ManagedHTMLView.prototype["delete"] = function(obj) {
      var $data, baseEl, name, parent, _i, _len, _ref;
      baseEl = $(this.model.get('targetEl'));
      if (baseEl.attr('hid') === void 0) {
        baseEl = baseEl.closest(".handlebars_content_block");
      }
      baseEl = baseEl.closest(".handlebars_content_block");
      parent = baseEl.closest(".managed_html_content_block");
      $data = $($('<div>').append(SmartEditor.utils.remove_document_write($("#" + parent.attr('id').replace('managed_html_content_block_', 'managed_html_content_form_') + " form textarea").text())));
      $data.find('[hid=' + baseEl.attr('hid') + ']').remove();
      $("#" + parent.attr('id').replace('managed_html_content_block_', 'managed_html_content_form_') + " form textarea").text($data.html().replace('{{load type="' + this.$el.attr('content_type') + '" name="' + this.el.content_id + '"}}', ''));
      this.$el.remove();
      $('#' + this.el.form_id).remove();
      _ref = ['edit', 'html_editor', 'history', 'publish'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        this.model.schema[name].disabled = false;
      }
      this.model.trigger('updatedSchema');
      this.model.set({
        'locked': false,
        "hasChange": true
      });
      return this;
    };

    ManagedHTMLView.prototype.move = function(obj) {
      var baseEl;
      baseEl = $(this.model.get('targetEl'));
      if (baseEl.attr('hid') === void 0) {
        baseEl = baseEl.closest(".handlebars_content_block");
      }
      baseEl.draggable().draggable('enable');
      baseEl.closest("[content_type=handlebars]").find(".handlebars_content_block").droppable({
        drop: function(ev, ui) {
          var $data, form, parent;
          ui.draggable.draggable('disable');
          ui.draggable.css({
            'left': '',
            'top': ''
          });
          $(this).after(ui.draggable);
          $('.handlebars_content_block').removeClass('ui-droppable').removeClass('ui-draggable').removeClass('ui-draggable-disabled').removeClass('ui-state-disabled');
          parent = ui.draggable.closest("[content_type=handlebars]");
          form = "#managed_html_content_form_" + parent.attr('id').replace('managed_html_content_block_', '');
          $data = $($('<div>').append(SmartEditor.utils.remove_document_write($(form + " form textarea").text())));
          $data.find('[hid=' + $(this).attr('hid') + ']').after($data.find('[hid=' + ui.draggable.attr('hid') + ']'));
          return $(form + " form textarea").text($data.html());
        }
      });
      return this;
    };

    ManagedHTMLView.prototype.publish = function(obj) {
      var _this = this;
      managed_html_ajax_page(document.location, {
        "_action": "publish_now",
        "_managed_html": this.el.content_id
      }, this.el.id, function() {
        _this.model.set({
          "hasChange": false
        });
        _this.model.set({
          'loading': false
        });
        return _this.model.trigger('updatedSchema');
      });
      this.model.set({
        'loading': true
      });
      this.model.schema.publish.disabled = true;
      this.model.trigger('updatedSchema');
      return this;
    };

    ManagedHTMLView.prototype.history = function(obj) {
      var dialog, el;
      el = this.el;
      $('body').append($('<div>').attr('id', this.el.form_id).hide());
      managed_html_ajax_page(document.location, {
        "_action": "edit",
        "_managed_html": this.el.content_id
      }, this.el.form_id);
      dialog = SmartEditor.utils.dialog('form_history', "loading...");
      managed_html_ajax_page(document.location, {
        "_action": "history",
        "_managed_html_history_grid": this.el.content_id
      }, 'content_form_history', function() {
        return dialog.find('.ui-btn[href=#]').click(function() {
          var postData,
            _this = this;
          $('#' + el.form_id + ' form').find('textarea').val($(this).closest('tr').find('textarea').val());
          postData = {
            '_action': "edit",
            '_managed_html': el.content_id
          };
          $('#' + el.form_id + ' form').find(':input').each(function() {
            return postData[$(this).attr('name')] = $(this).val();
          });
          return managed_html_ajax_page(document.location, postData, el.id, function() {
            dialog.remove();
            return $('#' + el.form_id).remove();
          });
        });
      });
      dialog.show();
      return this;
    };

    return ManagedHTMLView;

  })(SmartEditor.ElementView);

  SmartEditor.disableSelectors.push('.managed_html_dialog');

  SmartEditor.factories.push(function(target_el) {
    var el, model, view;
    el = $(target_el).closest(".managed_html_content_block")[0];
    if (el != null) {
      model = new ManagedHTMLModel({
        targetEl: target_el
      });
      model.schema = SmartEditor.utils.clone(model.schema);
      view = new ManagedHTMLView({
        model: model,
        el: el,
        tagName: el.tagName
      });
      return model;
    }
  });

}).call(this);
