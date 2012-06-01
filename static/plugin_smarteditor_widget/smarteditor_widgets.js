(function() {
  var DropdownFormsModel, DropdownFormsView, TooltipButtonWidgetModel, TooltipButtonWidgetView, TooltipLoadingWidgetModel, TooltipLoadingWidgetView, TooltipSelectWidgetModel, TooltipSelectWidgetView, TooltipTextWidgetModel, TooltipTextWidgetView,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  TooltipLoadingWidgetModel = (function(_super) {

    __extends(TooltipLoadingWidgetModel, _super);

    function TooltipLoadingWidgetModel() {
      TooltipLoadingWidgetModel.__super__.constructor.apply(this, arguments);
    }

    TooltipLoadingWidgetModel.prototype.defaults = {
      name: void 0,
      schema: void 0,
      elModel: void 0
    };

    return TooltipLoadingWidgetModel;

  })(Backbone.Model);

  TooltipLoadingWidgetView = (function(_super) {

    __extends(TooltipLoadingWidgetView, _super);

    function TooltipLoadingWidgetView() {
      this.render = __bind(this.render, this);
      TooltipLoadingWidgetView.__super__.constructor.apply(this, arguments);
    }

    TooltipLoadingWidgetView.prototype.tagName = 'li';

    TooltipLoadingWidgetView.prototype.className = '';

    TooltipLoadingWidgetView.prototype.initialize = function() {
      this.$el = $(this.el);
      this.render();
      this.model.get('elModel').bind('change:' + this.model.get('name'), this.render);
      return this;
    };

    TooltipLoadingWidgetView.prototype.render = function() {
      if (this.model.get('elModel').get(this.model.get('name'))) {
        return this.renderEnable();
      } else {
        return this.renderDisable();
      }
    };

    TooltipLoadingWidgetView.prototype.renderEnable = function() {
      return this.el.innerHTML = this.model.get('schema').message;
    };

    TooltipLoadingWidgetView.prototype.renderDisable = function() {
      return this.el.innerHTML = '';
    };

    return TooltipLoadingWidgetView;

  })(Backbone.View);

  SmartEditor.widgets['Loading'] = {
    M: TooltipLoadingWidgetModel,
    V: TooltipLoadingWidgetView
  };

  TooltipButtonWidgetModel = (function(_super) {

    __extends(TooltipButtonWidgetModel, _super);

    function TooltipButtonWidgetModel() {
      TooltipButtonWidgetModel.__super__.constructor.apply(this, arguments);
    }

    TooltipButtonWidgetModel.prototype.defaults = {
      name: void 0,
      schema: void 0,
      elModel: void 0
    };

    return TooltipButtonWidgetModel;

  })(Backbone.Model);

  TooltipButtonWidgetView = (function(_super) {

    __extends(TooltipButtonWidgetView, _super);

    function TooltipButtonWidgetView() {
      TooltipButtonWidgetView.__super__.constructor.apply(this, arguments);
    }

    TooltipButtonWidgetView.prototype.tagName = 'li';

    TooltipButtonWidgetView.prototype.className = '';

    TooltipButtonWidgetView.prototype.initialize = function() {
      this.$el = $(this.el);
      this.render();
      return this;
    };

    TooltipButtonWidgetView.prototype.events = {
      "click .ui-btn": "action"
    };

    TooltipButtonWidgetView.prototype.action = function(e) {
      var eventName;
      e.preventDefault();
      eventName = this.model.get('name');
      this.model.get('elModel').trigger(eventName, {
        el: e.target,
        val: this.model.get('schema').val
      });
      return this;
    };

    TooltipButtonWidgetView.prototype.render = function() {
      var $buttonEl, $spacerEl, $spanEl, code, name;
      name = this.model.get('name');
      code = SmartEditor.options.menuCSSPrefix + "-" + name;
      $buttonEl = $("<a href=\"#\" class=\"ui-btn " + code + "\" title=\"" + name + "\">");
      $spanEl = $("<span class=\"ui-icon ui-icon-" + name + " " + code + "\">");
      $spacerEl = $("<span class=\"spacer\">");
      $spacerEl.append((this.renderLabel() ? this.renderLabel() : '&nbsp;'));
      $buttonEl.append($spanEl);
      $buttonEl.append($spacerEl);
      this.$el.append($buttonEl);
      return this;
    };

    TooltipButtonWidgetView.prototype.renderLabel = function() {
      return this.model.get('schema').title;
    };

    return TooltipButtonWidgetView;

  })(Backbone.View);

  SmartEditor.widgets['Action'] = {
    M: TooltipButtonWidgetModel,
    V: TooltipButtonWidgetView
  };

  TooltipTextWidgetModel = (function(_super) {

    __extends(TooltipTextWidgetModel, _super);

    function TooltipTextWidgetModel() {
      TooltipTextWidgetModel.__super__.constructor.apply(this, arguments);
    }

    TooltipTextWidgetModel.prototype.defaults = {
      name: void 0,
      schema: void 0,
      elModel: void 0
    };

    return TooltipTextWidgetModel;

  })(Backbone.Model);

  TooltipTextWidgetView = (function(_super) {

    __extends(TooltipTextWidgetView, _super);

    function TooltipTextWidgetView() {
      TooltipTextWidgetView.__super__.constructor.apply(this, arguments);
    }

    TooltipTextWidgetView.prototype.tagName = 'li';

    TooltipTextWidgetView.prototype.className = '';

    TooltipTextWidgetView.prototype.initialize = function() {
      this.$el = $(this.el);
      this.render();
      return this;
    };

    TooltipTextWidgetView.prototype.render = function() {
      var $form_el, elModel, form, name, schema;
      name = this.model.get('name');
      schema = this.model.get('schema');
      elModel = this.model.get('elModel');
      form = new Backbone.Form({
        model: elModel,
        fields: [name],
        idPrefix: SmartEditor.options.menuCSSPrefix + "-"
      });
      form.render();
      $form_el = $(form.el);
      $form_el.on("change", function() {
        return form.commit();
      });
      this.$el.append($form_el);
      return this;
    };

    return TooltipTextWidgetView;

  })(Backbone.View);

  SmartEditor.widgets['Text'] = {
    M: TooltipTextWidgetModel,
    V: TooltipTextWidgetView
  };

  TooltipSelectWidgetModel = (function(_super) {

    __extends(TooltipSelectWidgetModel, _super);

    function TooltipSelectWidgetModel() {
      TooltipSelectWidgetModel.__super__.constructor.apply(this, arguments);
    }

    TooltipSelectWidgetModel.prototype.defaults = {
      name: void 0,
      schema: void 0,
      elModel: void 0
    };

    return TooltipSelectWidgetModel;

  })(Backbone.Model);

  TooltipSelectWidgetView = (function(_super) {

    __extends(TooltipSelectWidgetView, _super);

    function TooltipSelectWidgetView() {
      TooltipSelectWidgetView.__super__.constructor.apply(this, arguments);
    }

    TooltipSelectWidgetView.prototype.tagName = 'li';

    TooltipSelectWidgetView.prototype.className = '';

    TooltipSelectWidgetView.prototype.initialize = function() {
      this.$el = $(this.el);
      this.render();
      return this;
    };

    TooltipSelectWidgetView.prototype.render = function() {
      var $buttonEl, $spacerEl, $spanEl, $submenu, code, createWidget, elModel, name, obj, schema, title, _i, _len, _ref,
        _this = this;
      name = this.model.get('name');
      schema = this.model.get('schema');
      elModel = this.model.get('elModel');
      code = SmartEditor.options.menuCSSPrefix + "-" + name;
      $buttonEl = $('<a href="#" class="dropdown-toggle ui-btn" data-toggle="dropdown" title="' + name + '">');
      $spanEl = $("<span class=\"ui-icon ui-icon-" + name + " " + code + "\">");
      title = schema['title'] ? schema['title'] : '&nbsp;';
      $spacerEl = $("<span class=\"spacer\">" + title + "</span>");
      $buttonEl.append($spanEl);
      $buttonEl.append($spacerEl);
      $submenu = $('<ul class="dropdown-menu">');
      createWidget = function(name, schema, elModel) {
        var v;
        v = new TooltipButtonWidgetView({
          model: new TooltipButtonWidgetModel({
            'name': name,
            'schema': schema,
            'elModel': elModel
          })
        });
        return v.$el;
      };
      _ref = schema.options;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        $submenu.append(createWidget(name, {
          type: 'Action',
          title: $(obj.label),
          val: obj.val
        }, elModel));
      }
      this.el.classList.add('dropdown');
      this.$el.append($buttonEl);
      this.$el.append($submenu);
      return this;
    };

    return TooltipSelectWidgetView;

  })(Backbone.View);

  SmartEditor.widgets['Select'] = {
    M: TooltipSelectWidgetModel,
    V: TooltipSelectWidgetView
  };

  DropdownFormsModel = (function(_super) {

    __extends(DropdownFormsModel, _super);

    function DropdownFormsModel() {
      DropdownFormsModel.__super__.constructor.apply(this, arguments);
    }

    DropdownFormsModel.prototype.defaults = {
      name: void 0,
      schema: void 0,
      elModel: void 0
    };

    return DropdownFormsModel;

  })(Backbone.Model);

  DropdownFormsView = (function(_super) {

    __extends(DropdownFormsView, _super);

    function DropdownFormsView() {
      DropdownFormsView.__super__.constructor.apply(this, arguments);
    }

    DropdownFormsView.prototype.tagName = 'li';

    DropdownFormsView.prototype.className = '';

    DropdownFormsView.prototype.initialize = function() {
      this.$el = $(this.el);
      this.render();
      return this;
    };

    DropdownFormsView.prototype.render = function() {
      var $buttonEl, $form_el, $spacerEl, $spanEl, $submenu, code, elModel, form, schema, title;
      schema = this.model.get('schema');
      elModel = this.model.get('elModel');
      form = new Backbone.Form({
        model: elModel,
        fields: schema.fields,
        idPrefix: SmartEditor.options.menuCSSPrefix + "-"
      });
      form.render();
      $form_el = $(form.el);
      $form_el.on("change", function() {
        return form.commit();
      });
      code = SmartEditor.options.menuCSSPrefix + "-dropdownforms-" + elModel.name;
      $buttonEl = $('<a href="#" class="dropdown-toggle ui-btn" data-toggle="dropdown" title="' + elModel.name + '">');
      $spanEl = $("<span class=\"ui-icon ui-icon-" + name + " " + code + "\">");
      title = schema['title'] ? schema['title'] : '&nbsp;';
      $spacerEl = $("<span class=\"spacer\">" + title + "</span>");
      $buttonEl.append($spanEl);
      $buttonEl.append($spacerEl);
      $submenu = $('<ul class="dropdown-menu">');
      $submenu.append($form_el);
      $form_el.click(function(e) {
        return e.stopPropagation();
      });
      this.$el.empty();
      this.$el.append($buttonEl);
      this.$el.append($submenu);
      return this;
    };

    return DropdownFormsView;

  })(Backbone.View);

  SmartEditor.widgets['DropdownForms'] = {
    M: DropdownFormsModel,
    V: DropdownFormsView
  };

}).call(this);
