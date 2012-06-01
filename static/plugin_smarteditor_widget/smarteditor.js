
/*
  Authors: Naoto Kato, Nozomu Oshikiri, Natsuki Kimoto, Kenji Hosoda
*/

/*
Exposed global class
*/

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    _this = this;

  this.SmartEditor = (function() {

    SmartEditor.VERSION = '0.1.0';

    SmartEditor.widgets = {};

    SmartEditor.widgetMapper = {
      'Image': {
        'DropdownForms': {
          fields: ['src', 'width', 'height'],
          title: '画像設定'
        }
      }
    };

    SmartEditor.factories = [];

    SmartEditor.options = {
      menuCSSPrefix: "ui-btn"
    };

    SmartEditor.disableSelectors = ['.smarteditor-main-panel'];

    SmartEditor.utils = {
      clone: function(obj) {
        var flags, key, newInstance;
        if (!(obj != null) || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof RegExp) {
          flags = '';
          if (obj.global != null) flags += 'g';
          if (obj.ignoreCase != null) flags += 'i';
          if (obj.multiline != null) flags += 'm';
          if (obj.sticky != null) flags += 'y';
          return new RegExp(obj.source, flags);
        }
        newInstance = new obj.constructor();
        for (key in obj) {
          newInstance[key] = SmartEditor.utils.clone(obj[key]);
        }
        return newInstance;
      },
      dialog: function(dialog_id, html) {
        var dialog;
        $('.smarteditor-main-panel').hide();
        dialog = $('<div class=\"managed_html_dialog\" id=\"' + dialog_id + '\" style=\"display:none; z-index:900; position:fixed; top:0%;left:0%;width:100%;height:100%;\"><div class=\"dialog-back\" onclick=\";jQuery(&quot;#' + dialog_id + '&quot;).remove();;return false;\" style=\"width:100%;height:100%;\"></div><div><div class=\"dialog-front\" id=\"c' + dialog_id + '\" onclick=\"\nvar e = arguments[0] || window.event;\nif (jQuery(e.target).parent().attr(&#x27;id&#x27;) == &quot;c' + dialog_id + '&quot;) {;jQuery(&quot;#' + dialog_id + '&quot;).remove();;};\n\" style=\"\nposition:absolute;top:10%;left:5%;\nwidth:90%;height:80%;\nz-index:950;overflow:auto;\n\"><span style=\"font-weight:bold:font-size:18px;\">\u9078\u629e\u3059\u308b</span><span style=\"float:right\">[<a href=\"#\" onclick=\";jQuery(&quot;#' + dialog_id + '&quot;).remove();;return false;\">\u9589\u3058\u308b</a>]</span><hr /><div id=\"content_' + dialog_id + '\"></div></div></div></div>');
        dialog.find('#content_' + dialog_id).html(html);
        $(document.body).append(dialog);
        dialog.css('zIndex', (parseInt(dialog.css('zIndex')) || 1000) + 10);
        $.aop.before({
          target: $.fn,
          method: "show"
        }, function() {
          return this.trigger("show");
        });
        dialog.bind("show", function() {
          return $('.smarteditor-main-panel').hide();
        });
        $.aop.before({
          target: $.fn,
          method: "remove"
        }, function() {
          return this.trigger("remove");
        });
        dialog.bind("remove", function() {
          if (0 === $('input[name=__uploadify__name]').length) {
            $('.smarteditor-main-panel').show();
            return $('img[src=dummy-image]').remove();
          }
        });
        return dialog;
      },
      remove_document_write: function(val) {
        return val.replace(/document\.write\([^\)]*\)/, "");
      }
    };

    SmartEditor.prototype.mainPanelModel = void 0;

    SmartEditor.prototype.mainPanelView = void 0;

    SmartEditor.prototype.rootElement = void 0;

    function SmartEditor() {
      this.onClick = __bind(this.onClick, this);
      this._tunePos = __bind(this._tunePos, this);      this.mainPanelModel = new SmartEditor.MainPanelModel();
      this.mainPanelView = new SmartEditor.MainPanelView({
        model: this.mainPanelModel
      });
      document.body.appendChild(this.mainPanelView.el);
      this.rootElement = document.body;
      $(this.rootElement).on('mousedown', this.onClick);
      this;
    }

    SmartEditor.prototype._tunePos = function(pos) {
      var $el, viewWidth;
      $el = this.mainPanelView.$el;
      viewWidth = $(window).width();
      if (pos.x + $el.width() + 20 > viewWidth) {
        pos.x = viewWidth - ($el.width() + 20);
      }
      if (pos.x < 0) pos.x = 0;
      pos.y = pos.y - 70;
      if (pos.y < 0) return pos.y = 0;
    };

    SmartEditor.prototype.onClick = function(e) {
      var pos, targetModels;
      if ($(e.target).closest(SmartEditor.disableSelectors.join(',')).length) {
        return true;
      }
      e.stopPropagation();
      if (!this.mainPanelModel.get('targetLocked')) {
        targetModels = this.findElementModels(e.target);
        this.mainPanelModel.set({
          targetModels: targetModels
        });
        pos = {
          x: e.pageX - 50,
          y: e.pageY - 50
        };
        this._tunePos(pos);
        this.mainPanelModel.set({
          position: pos
        });
      }
      return this;
    };

    SmartEditor.prototype.findElementModels = function(targetEl) {
      var f, models, obj, _i, _len, _ref;
      models = [];
      _ref = SmartEditor.factories;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        obj = f(targetEl);
        if (obj != null) models.push(obj);
      }
      return models;
    };

    SmartEditor.prototype.closeEdit = function() {
      this.mainPanelView.close();
      return this;
    };

    return SmartEditor;

  })();

  /*
  Main floating panel of the editor
  */

  SmartEditor.MainPanelModel = (function(_super) {

    __extends(MainPanelModel, _super);

    function MainPanelModel() {
      MainPanelModel.__super__.constructor.apply(this, arguments);
    }

    MainPanelModel.prototype.defaults = {
      formExpanded: false,
      targetLocked: false,
      targetEl: void 0,
      targetModels: [],
      visibility: false,
      position: {
        x: 0,
        y: 0
      }
    };

    return MainPanelModel;

  })(Backbone.Model);

  SmartEditor.MainPanelView = (function(_super) {

    __extends(MainPanelView, _super);

    function MainPanelView() {
      this.toggleForm = __bind(this.toggleForm, this);
      this.expandPanel = __bind(this.expandPanel, this);
      this.closePanel = __bind(this.closePanel, this);
      this.updateForm = __bind(this.updateForm, this);
      this.changeFormExpanded = __bind(this.changeFormExpanded, this);
      this.changeTargetModels = __bind(this.changeTargetModels, this);
      this.changeTargetLocked = __bind(this.changeTargetLocked, this);
      this.changeButtons = __bind(this.changeButtons, this);
      this.changePosition = __bind(this.changePosition, this);
      this.changeVisibility = __bind(this.changeVisibility, this);
      this.dropPanel = __bind(this.dropPanel, this);
      this.movePanel = __bind(this.movePanel, this);
      this.dragPanel = __bind(this.dragPanel, this);
      MainPanelView.__super__.constructor.apply(this, arguments);
    }

    MainPanelView.prototype.tagName = "div";

    MainPanelView.prototype.className = "smarteditor-main-panel";

    MainPanelView.prototype.initialize = function() {
      var $closeBtn, v;
      this.$el = $(this.el);
      v = new SmartEditor.widgets['Action'].V({
        model: new SmartEditor.widgets['Action'].M({
          name: 'closePanel',
          elModel: this.model,
          schema: {
            type: 'Action',
            title: 'x'
          }
        })
      });
      $closeBtn = $("a", v.$el);
      this.$el.append($closeBtn);
      this.$buttonsEl = $("<ul class=\"buttons\"></ul>");
      this.$el.append(this.$buttonsEl);
      this.$subButtonsEl = $("<ul class=\"subbuttons\"></ul>");
      this.$el.append(this.$subButtonsEl);
      this.$el.append($("<fieldset class=\"bbf-form\"></fieldset>"));
      this.model.bind("change:position", this.changePosition);
      this.model.bind("change:formExpanded", this.changeFormExpanded);
      this.model.bind("change:targetModels", this.changeTargetModels);
      this.model.bind("change:visibility", this.changeVisibility);
      return this;
    };

    MainPanelView.prototype.events = {
      "click a.ui-btn-closePanel": "closePanel",
      "click a.ui-btn-expandPanel": "expandPanel"
    };

    MainPanelView.prototype.dragPanel = function(e) {
      this.model.set({
        draging: {
          x: e.pageX,
          y: e.pageY
        }
      });
      $(document.body).on('mousemove', this.movePanel);
      return e.preventDefault();
    };

    MainPanelView.prototype.movePanel = function(e) {
      var newpos, pos, prev_pos;
      prev_pos = this.model.get('draging');
      pos = this.model.get("position");
      newpos = {
        x: pos.x + (e.pageX - prev_pos.x),
        y: pos.y + (e.pageY - prev_pos.y)
      };
      this.model.set({
        draging: {
          x: e.pageX,
          y: e.pageY,
          animate: false
        }
      });
      return this.model.set({
        position: newpos
      });
    };

    MainPanelView.prototype.dropPanel = function(e) {
      var newpos, pos, prev_pos;
      $(document.body).off('mousemove', this.movePanel);
      prev_pos = this.model.get('draging');
      pos = this.model.get("position");
      newpos = {
        x: pos.x + (e.pageX - prev_pos.x),
        y: pos.y + (e.pageY - prev_pos.y)
      };
      this.model.set({
        draging: {}
      });
      return this.model.set({
        position: newpos
      });
    };

    MainPanelView.prototype.changeVisibility = function() {
      if (this.model.get('visibility')) {
        this.$el.show('fast');
        return this.changePosition();
      } else {
        return this.$el.hide('fast');
      }
    };

    MainPanelView.prototype.changePosition = function() {
      var pos;
      pos = this.model.get("position");
      if (this.model.get('visibility')) {
        if (!(pos.animate != null) || !pos.animate) {
          this.$el.animate({
            top: pos.y,
            left: pos.x,
            queue: false
          });
        } else {
          this.$el.style.top = pos.y;
          this.$el.style.left = pos.x;
        }
      }
      return this;
    };

    MainPanelView.prototype.createWidget = function(name, schemaObj, elModel) {
      var code, k, m, v, widgets, _ref;
      code = SmartEditor.options.menuCSSPrefix + "-" + name;
      widgets = SmartEditor.widgets;
      if (_ref = schemaObj.type, __indexOf.call((function() {
        var _results;
        _results = [];
        for (k in widgets) {
          v = widgets[k];
          _results.push(k);
        }
        return _results;
      })(), _ref) >= 0) {
        m = new widgets[schemaObj.type].M({
          name: name,
          elModel: elModel,
          schema: schemaObj
        });
        v = new widgets[schemaObj.type].V({
          model: m
        });
        return v.$el;
      }
    };

    MainPanelView.prototype.changeButtons = function() {
      var editorModel, f, m, name, obj, schema, targetModel, targetModels, w, widget, widgets, _i, _len, _ref, _ref2;
      editorModel = this.model;
      targetModels = editorModel.get("targetModels");
      this.$buttonsEl.empty();
      f = false;
      for (_i = 0, _len = targetModels.length; _i < _len; _i++) {
        targetModel = targetModels[_i];
        if (SmartEditor.widgetMapper[targetModel.name] != null) {
          _ref = SmartEditor.widgetMapper[targetModel.name];
          for (widget in _ref) {
            schema = _ref[widget];
            widgets = SmartEditor.widgets;
            if (widgets[widget] != null) {
              m = new widgets[widget].M({
                elModel: targetModel,
                schema: schema
              });
              w = new widgets[widget].V({
                model: m
              });
              this.$buttonsEl.append(w.el);
              f = true;
            }
          }
        } else {
          _ref2 = targetModel.schema;
          for (name in _ref2) {
            obj = _ref2[name];
            if (!obj.disabled) {
              this.$buttonsEl.append(this.createWidget(name, obj, targetModel));
              f = true;
            }
          }
        }
      }
      this.model.set({
        'visibility': f
      });
      return this;
    };

    MainPanelView.prototype.changeTargetLocked = function() {
      var hasLocked, targetModel, _i, _len, _ref;
      hasLocked = false;
      _ref = this.model.get("targetModels");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        targetModel = _ref[_i];
        if (targetModel.get('locked')) {
          hasLocked = true;
          break;
        }
      }
      return this.model.set({
        'targetLocked': hasLocked
      });
    };

    MainPanelView.prototype.changeTargetModels = function() {
      var editorModel, m, targetModel, targetModels, _i, _j, _len, _len2, _ref;
      editorModel = this.model;
      _ref = editorModel.previous("targetModels");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        targetModel = _ref[_i];
        targetModel.unbind('updatedSchema', this.changeButtons);
        targetModel.unbind('change:locked', this.changeTargetLocked);
        targetModel.trigger("closeEdit");
      }
      targetModels = editorModel.get("targetModels");
      this.changeButtons();
      for (_j = 0, _len2 = targetModels.length; _j < _len2; _j++) {
        m = targetModels[_j];
        m.trigger('openEdit');
        m.bind('change:locked', this.changeTargetLocked);
        m.bind('updatedSchema', this.changeButtons);
      }
      this.updateForm();
      return this;
    };

    MainPanelView.prototype.changeFormExpanded = function(editorModel) {
      var anim, f, model, pos;
      anim = "fast";
      if (!editorModel) anim = undefined;
      model = this.model.get("targetModels")[0];
      f = this.model.get("formExpanded");
      if (f && model) {
        this.updateForm();
        $(".bbf-form", this.el).show(anim);
      } else if (model) {
        $(".bbf-form", this.el).hide(anim);
      }
      pos = this.model.get("position");
      return pos;
    };

    MainPanelView.prototype.updateForm = function() {
      var $form_el, fields, form, form_el, k, targetModel, v, _i, _len, _ref, _ref2, _ref3, _results;
      return;
      $(".smarteditor-main-panel .bbf-form").empty();
      _ref = this.model.get("targetModels");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        targetModel = _ref[_i];
        targetModel.trigger("updateValue");
        fields = [];
        _ref2 = targetModel.schema;
        for (k in _ref2) {
          v = _ref2[k];
          if ((_ref3 = v.type) === 'Text' || _ref3 === 'Select') fields.push(k);
        }
        form = new Backbone.Form({
          model: targetModel,
          fields: fields,
          idPrefix: "smarteditor_editor_form_"
        });
        form_el = form.render().el;
        $form_el = $(form_el);
        $form_el.on("change", function() {
          return form.commit();
        });
        if (!this.model.get("formExpanded")) form_el.style.display = "None";
        _results.push($(".smarteditor-main-panel .bbf-form").replaceWith(form_el));
      }
      return _results;
    };

    MainPanelView.prototype.closePanel = function() {
      var targetModel, _i, _len, _ref;
      if (this.model.get("targetLocked")) return;
      this.$el.hide();
      _ref = this.model.get('targetModels');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        targetModel = _ref[_i];
        targetModel.trigger("closeEdit");
      }
      this.model.set({
        targetModels: [],
        targetEl: void 0,
        formExpanded: false
      });
      return this;
    };

    MainPanelView.prototype.expandPanel = function(e) {
      e.preventDefault();
      return this.toggleForm();
    };

    MainPanelView.prototype.toggleForm = function(e) {
      this.model.set({
        formExpanded: !this.model.get("formExpanded")
      });
      return this;
    };

    /*
      upLayer: ->
        el = @model.get("targetEl")
        $(el.parentNode).trigger "mousedown"
        @
    */

    return MainPanelView;

  })(Backbone.View);

  SmartEditor.ElementModel = (function(_super) {

    __extends(ElementModel, _super);

    function ElementModel() {
      ElementModel.__super__.constructor.apply(this, arguments);
    }

    ElementModel.prototype.defaults = {
      type: "base",
      id: void 0
    };

    ElementModel.prototype.schema = {};

    return ElementModel;

  })(Backbone.Model);

  SmartEditor.ElementView = (function(_super) {

    __extends(ElementView, _super);

    function ElementView() {
      ElementView.__super__.constructor.apply(this, arguments);
    }

    ElementView.prototype.defaults = {
      type: "base",
      id: void 0
    };

    ElementView.prototype.updateValue = function() {
      return this;
    };

    ElementView.prototype.initialize = function() {
      ElementView.__super__.initialize.apply(this, arguments);
      return $(this.el).on("click", function(e) {
        e.preventDefault();
        return false;
      });
    };

    return ElementView;

  })(Backbone.View);

  $(function() {
    return _this.smartEditor = new SmartEditor();
  });

  this.SmartEditorPlugins = (function() {

    function SmartEditorPlugins() {}

    SmartEditorPlugins.edit_dialog = {};

    SmartEditorPlugins.contenteditable = [];

    return SmartEditorPlugins;

  })();

}).call(this);
