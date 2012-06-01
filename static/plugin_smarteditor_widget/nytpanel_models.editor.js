
/*
  編集可能領域に対する編集モデル
*/

(function() {
  var EditableModel, EditableView, ImgModel, ImgView, LinkModel, LinkView,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    _this = this;

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

  SmartEditor.factories.push(function(target_el) {
    var el, model, view;
    el = $(target_el).closest("[contenteditable=true]")[0];
    if ((el != null) && target_el.tagName !== 'IMG') {
      model = new EditableModel();
      model.schema = SmartEditor.utils.clone(model.schema);
      view = new EditableView({
        model: model,
        el: el,
        tagName: el.tagName
      });
      return model;
    }
  });

  /*
    画像に対する編集モデル
  */

  ImgModel = (function(_super) {

    __extends(ImgModel, _super);

    function ImgModel() {
      ImgModel.__super__.constructor.apply(this, arguments);
    }

    ImgModel.prototype.name = 'Image';

    ImgModel.prototype.defaults = {
      'src': void 0,
      'width': void 0,
      'height': void 0
    };

    ImgModel.prototype.schema = {
      'src': {
        type: 'Text',
        title: '画像url'
      },
      'width': {
        type: 'Text',
        title: '画像横幅'
      },
      'height': {
        type: 'Text',
        title: '画像縦幅'
      }
    };

    return ImgModel;

  })(SmartEditor.ElementModel);

  ImgView = (function(_super) {

    __extends(ImgView, _super);

    function ImgView() {
      this.src = __bind(this.src, this);
      this.height = __bind(this.height, this);
      this.width = __bind(this.width, this);
      this.closeEdit = __bind(this.closeEdit, this);
      this.openEdit = __bind(this.openEdit, this);
      ImgView.__super__.constructor.apply(this, arguments);
    }

    ImgView.prototype.initialize = function() {
      var key;
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
      return this;
    };

    ImgView.prototype.openEdit = function() {
      return this;
    };

    ImgView.prototype.closeEdit = function() {
      return this;
    };

    ImgView.prototype.width = function() {
      if (this.model.get('width') === '') {
        return this.$el.css('width', 'auto');
      } else {
        return this.$el.css('width', this.model.get('width') + 'px');
      }
    };

    ImgView.prototype.height = function() {
      if (this.model.get('height') === '') {
        return this.$el.css('height', 'auto');
      } else {
        return this.$el.css('height', this.model.get('height') + 'px');
      }
    };

    ImgView.prototype.src = function(obj) {
      this.$el.attr('src', this.model.get('src'));
      return this;
    };

    return ImgView;

  })(SmartEditor.ElementView);

  SmartEditor.factories.push(function(target_el) {
    var el, model, view;
    el = $(target_el).closest("[contenteditable=true]")[0];
    if ((el != null) && target_el.tagName === 'IMG') {
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
        title: 'リンクurl'
      }
    };

    return LinkModel;

  })(SmartEditor.ElementModel);

  LinkView = (function(_super) {

    __extends(LinkView, _super);

    function LinkView() {
      this.src = __bind(this.src, this);
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
      return this;
    };

    LinkView.prototype.src = function(obj) {
      var url;
      url = prompt('URL', this.$el.attr('href'));
      this.$el.attr('href', url);
      return this;
    };

    return LinkView;

  })(SmartEditor.ElementView);

  SmartEditor.factories.push(function(target_el) {
    var el, model, view;
    el = $(target_el).closest("div[contenteditable=true]")[0];
    if ((el != null) && target_el.tagName === 'A') {
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
