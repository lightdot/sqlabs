(function() {
  var EditableModel, EditableView, ImgModel, ImgView, LinkModel, LinkView, resize_images,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    _this = this,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  SmartEditor.elementTests.isEditable = function(el, test_results) {
    var f, t;
    t = $(el).closest("div[contenteditable=true]");
    f = $(el).closest("div[contenteditable=false]");
    if (f.length === 0) return t.length > 0;
    if (t.length > 0) return t.find(f).length === 0;
    return false;
  };

  /*
    編集可能領域に対する編集モデル
  */

  EditableModel = (function(_super) {
    var n;

    __extends(EditableModel, _super);

    function EditableModel() {
      EditableModel.__super__.constructor.apply(this, arguments);
    }

    EditableModel.prototype.name = 'Editable';

    EditableModel.prototype.schema = {
      'fontSizeOfSelectRange': {
        type: 'Select',
        title: 'サイズ',
        options: (function() {
          var _i, _len, _ref, _results;
          _ref = [7, 9, 11, 12, 14, 16];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            n = _ref[_i];
            _results.push({
              val: "" + n + "pt",
              label: "<span style=\"font-size: " + n + "pt\">" + n + "pt</span>"
            });
          }
          return _results;
        })()
      },
      'fontWeightOfSelectRange': {
        type: 'Select',
        title: '太さ',
        options: (function() {
          var _i, _len, _ref, _results;
          _ref = ['normal', 'bold'];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            n = _ref[_i];
            _results.push({
              val: "" + n,
              label: "<span style=\"font-weight: " + n + "\">" + n + "</span>"
            });
          }
          return _results;
        })()
      },
      'insertImg': {
        type: 'Action',
        title: '画像'
      },
      'createLink': {
        type: 'Action',
        title: 'リンク'
      }
    };

    return EditableModel;

  })(SmartEditor.ElementModel);

  EditableView = (function(_super) {

    __extends(EditableView, _super);

    function EditableView() {
      this.createLink = __bind(this.createLink, this);
      this.insertImg = __bind(this.insertImg, this);
      this.fontWeightOfSelectRange = __bind(this.fontWeightOfSelectRange, this);
      this.fontSizeOfSelectRange = __bind(this.fontSizeOfSelectRange, this);
      this.test = __bind(this.test, this);
      this.closeEdit = __bind(this.closeEdit, this);
      this.openEdit = __bind(this.openEdit, this);
      EditableView.__super__.constructor.apply(this, arguments);
    }

    EditableView.prototype.initialize = function() {
      var key;
      EditableView.__super__.initialize.apply(this, arguments);
      for (key in this.model.schema) {
        if (this[key] != null) this.model.bind(key, this[key]);
      }
      for (key in this.model.defaults) {
        if (this[key] != null) this.model.bind("change:" + key, this[key]);
      }
      this.model.bind("openEdit", this.openEdit);
      this.model.bind("closeEdit", this.closeEdit);
      this.$el = $(this.el);
      return this;
    };

    EditableView.prototype.openEdit = function() {
      return this;
    };

    EditableView.prototype.closeEdit = function() {
      return this;
    };

    EditableView.prototype.test = function(obj) {
      return this;
    };

    EditableView.prototype.fontSizeOfSelectRange = function(obj) {
      _change('fontSize', obj.val);
      return this;
    };

    EditableView.prototype.fontWeightOfSelectRange = function(obj) {
      _change('fontWeight', obj.val);
      return this;
    };

    EditableView.prototype.insertImg = function(obj) {
      var baseEl, dialog;
      baseEl = $(this.model.targetEl);
      if (baseEl.attr('hid') === void 0) {
        baseEl = baseEl.closest(".handlebars_content_block");
      }
      document.execCommand('insertImage', false, 'dummy-image');
      dialog = SmartEditor.utils.dialog('managed_html_image_chooser', "loading...");
      managed_html_ajax_page(document.location, {
        "_action": "image_chooser",
        "_managed_html_image_grid": 'True'
      }, 'content_managed_html_image_chooser');
      dialog.show();
      return this;
    };

    EditableView.prototype.createLink = function(obj) {
      return document.execCommand('CreateLink', false, window.prompt('URL', 'http://'));
    };

    return EditableView;

  })(SmartEditor.ElementView);

  SmartEditor.factories.push(function(target_el, test_results) {
    var model, view;
    if (test_results['isEditable'] && target_el.tagName !== 'IMG') {
      model = new EditableModel();
      model.schema = SmartEditor.utils.clone(model.schema);
      view = new EditableView({
        model: model,
        el: target_el,
        tagName: target_el.tagName
      });
      return model;
    }
  });

  /*
    画像に対する編集モデル
  */

  resize_images = new Array();

  ImgModel = (function(_super) {

    __extends(ImgModel, _super);

    function ImgModel() {
      ImgModel.__super__.constructor.apply(this, arguments);
    }

    ImgModel.prototype.name = 'Image';

    ImgModel.prototype.defaults = {};

    ImgModel.prototype.schema = {
      'image_change': {
        type: 'Action',
        title: '画像変更',
        disabled: false
      },
      'resize_start': {
        type: 'Action',
        title: '画像リサイズ開始',
        disabled: true
      },
      'resize_end': {
        type: 'Action',
        title: '画像リサイズ終了',
        disabled: true
      }
    };

    return ImgModel;

  })(SmartEditor.ElementModel);

  ImgView = (function(_super) {

    __extends(ImgView, _super);

    function ImgView() {
      this.resize_end = __bind(this.resize_end, this);
      this.resize_start = __bind(this.resize_start, this);
      this.image_change = __bind(this.image_change, this);
      this.closeEdit = __bind(this.closeEdit, this);
      this.openEdit = __bind(this.openEdit, this);
      ImgView.__super__.constructor.apply(this, arguments);
    }

    ImgView.prototype.initialize = function() {
      var key, _ref;
      ImgView.__super__.initialize.apply(this, arguments);
      for (key in this.model.schema) {
        if (this[key] != null) this.model.bind(key, this[key]);
      }
      for (key in this.model.defaults) {
        if (this[key] != null) this.model.bind("change:" + key, this[key]);
      }
      this.model.bind("openEdit", this.openEdit);
      this.model.bind("closeEdit", this.closeEdit);
      this.$el = $(this.el);
      this.model.set({
        width: this.$el.width(),
        src: this.$el.attr('src')
      });
      if (_ref = this.$el.attr('hid'), __indexOf.call(resize_images, _ref) >= 0) {
        this.model.schema['resize_start'].disabled = true;
        return this.model.schema['resize_end'].disabled = false;
      } else {
        this.model.schema['resize_start'].disabled = false;
        return this.model.schema['resize_end'].disabled = true;
      }
    };

    ImgView;

    ImgView.prototype.openEdit = function() {};

    ImgView;

    ImgView.prototype.closeEdit = function() {};

    ImgView;

    ImgView.prototype.image_change = function() {
      var dialog, el;
      el = this.$el;
      dialog = SmartEditor.utils.dialog('managed_html_image_chooser', "loading...");
      managed_html_ajax_page(document.location, {
        "_action": "image_chooser",
        "_managed_html_image_grid": 'True'
      }, 'content_managed_html_image_chooser', function() {
        dialog.find('.ui-btn[href=#]').attr('onclick', '');
        return dialog.find('.ui-btn[href=#]').click(function() {
          el.attr({
            'src': $(this).closest('tr').find('textarea').val(),
            'height': el.height() + 'px',
            'width': el.width() + 'px'
          });
          return dialog.remove();
        });
      });
      return dialog.show();
    };

    ImgView;

    ImgView.prototype.resize_start = function() {
      var clicked, clicker, ratio, start_x, start_y;
      resize_images.push(this.$el.attr('hid'));
      this.model.schema['resize_start'].disabled = true;
      this.model.schema['resize_end'].disabled = false;
      this.model.trigger('updatedSchema');
      clicked = false;
      clicker = false;
      start_x = 0;
      start_y = 0;
      ratio = this.$el.width() / this.$el.height();
      this.$el.hover(function() {
        return $(this).css('cursor', 'nw-resize');
      }, function() {
        $(this).css('cursor', 'default');
        return clicked = false;
      });
      this.$el.mousedown(function(e) {
        if (e.preventDefault) e.preventDefault();
        clicked = true;
        clicker = true;
        start_x = Math.round(e.pageX - $(this).offset().left);
        return start_y = Math.round(e.pageY - $(this).offset().top);
      });
      this.$el.mouseup(function(e) {
        return clicked = false;
      });
      return this.$el.mousemove(function(e) {
        var div_h, min_h, min_w, mouse_x, mouse_y, new_h, new_w;
        if (clicked) {
          min_w = 50;
          min_h = 50;
          clicker = false;
          mouse_x = Math.round(e.pageX - $(this).offset().left) - start_x;
          mouse_y = Math.round(e.pageY - $(this).offset().top) - start_y;
          div_h = $(this).height();
          new_h = parseInt(div_h) + mouse_y;
          new_w = new_h * ratio;
          if (new_w > min_w) $(this).width(new_w);
          if (new_h > min_h) $(this).height(new_h);
          start_x = Math.round(e.pageX - $(this).offset().left);
          return start_y = Math.round(e.pageY - $(this).offset().top);
        }
      });
    };

    ImgView.prototype.resize_end = function() {
      resize_images.pop(this.$el.attr('hid'));
      this.model.schema['resize_start'].disabled = false;
      this.model.schema['resize_end'].disabled = true;
      this.model.trigger('updatedSchema');
      this.$el.unbind('hover');
      this.$el.unbind('mousedown');
      this.$el.unbind('mouseup');
      return this.$el.unbind('mousemove');
    };

    return ImgView;

  })(SmartEditor.ElementView);

  SmartEditor.factories.push(function(target_el, test_results) {
    var model, view;
    if (test_results['isEditable'] && target_el.tagName === 'IMG') {
      model = new ImgModel();
      model.schema = SmartEditor.utils.clone(model.schema);
      view = new ImgView({
        model: model,
        el: target_el,
        tagName: target_el.tagName
      });
      return model;
    }
  });

  /*
    リンクに対する編集モデル
  */

  LinkModel = (function(_super) {

    __extends(LinkModel, _super);

    function LinkModel() {
      LinkModel.__super__.constructor.apply(this, arguments);
    }

    LinkModel.prototype.name = 'Link';

    LinkModel.prototype.schema = {
      'src': {
        type: 'Action',
        title: 'リンクurl',
        conflicts: [
          {
            model: 'Editable',
            schema: 'createLink'
          }
        ]
      },
      'remove': {
        type: 'Action',
        title: 'リンク解除'
      }
    };

    return LinkModel;

  })(SmartEditor.ElementModel);

  LinkView = (function(_super) {

    __extends(LinkView, _super);

    function LinkView() {
      this.src = __bind(this.src, this);
      this.remove = __bind(this.remove, this);
      this.closeEdit = __bind(this.closeEdit, this);
      this.openEdit = __bind(this.openEdit, this);
      LinkView.__super__.constructor.apply(this, arguments);
    }

    LinkView.prototype.initialize = function() {
      var key;
      LinkView.__super__.initialize.apply(this, arguments);
      for (key in this.model.schema) {
        if (this[key] != null) this.model.bind(key, this[key]);
      }
      for (key in this.model.defaults) {
        if (this[key] != null) this.model.bind("change:" + key, this[key]);
      }
      this.model.bind("openEdit", this.openEdit);
      this.model.bind("closeEdit", this.closeEdit);
      this.$el = $(this.el);
      return this;
    };

    LinkView.prototype.openEdit = function() {
      return this;
    };

    LinkView.prototype.closeEdit = function() {
      this.model.unbind("src");
      this.model.unbind("remove");
      this.model.unbind("openEdit");
      this.model.unbind("closeEdit");
      return this;
    };

    LinkView.prototype.remove = function(obj) {
      var parent;
      parent = this.el.parentNode;
      this.$el.after(this.el.childNodes);
      this.$el.remove();
      smartEditor.setTargetElement(parent);
      return this;
    };

    LinkView.prototype.src = function(obj) {
      var url;
      url = prompt('URL', this.$el.attr('href'));
      if (url != null) this.$el.attr('href', url);
      return this;
    };

    return LinkView;

  })(SmartEditor.ElementView);

  SmartEditor.factories.push(function(target_el, test_results) {
    var model, view;
    if (test_results['isEditable'] && target_el.tagName === 'A') {
      model = new LinkModel();
      model.schema = SmartEditor.utils.clone(model.schema);
      view = new LinkView({
        model: model,
        el: target_el,
        tagName: target_el.tagName
      });
      return model;
    }
  });

}).call(this);
