(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  (function() {
    var ElementModel_default, ElementView_default, collections, models, views, _AnchorModel, _DivModel, _ImgModel, _LinkImgModel;
    ElementModel_default = (function(_super) {

      __extends(ElementModel_default, _super);

      function ElementModel_default() {
        ElementModel_default.__super__.constructor.apply(this, arguments);
      }

      ElementModel_default.prototype.defaults = {
        type: "default",
        classes: "",
        commands: ["decreseWidth", "increseWidth", "deleteElement", ["abc", "def", "test"]]
      };

      ElementModel_default.prototype.schema = {
        type: {
          type: "Text"
        },
        classes: {
          type: "Text"
        }
      };

      return ElementModel_default;

    })(ElementModel_base);
    ElementView_default = (function(_super) {

      __extends(ElementView_default, _super);

      function ElementView_default() {
        this.changeClasses = __bind(this.changeClasses, this);
        ElementView_default.__super__.constructor.apply(this, arguments);
      }

      ElementView_default.prototype.className = "smartedit";

      ElementView_default.prototype.initialize = function() {
        var id, size, type;
        ElementView_default.__super__.initialize.call(this);
        $(this.el).on("click", function(e) {
          e.preventDefault();
          return false;
        });
        this.model.bind("change:classes", this.changeClasses);
        this.initModelEvents();
        type = this.model.get("type");
        id = this.model.get("id");
        if (id) this.el.id = id;
        if (!this.el.parentNode) {
          this.el.className = this.model.get("classes");
          size = sizeName[this.model.get("sizeIdx")];
          this.el.classList.add(size);
          return this.initElements(true);
        } else {
          this.initElements(false);
          return this.update_value();
        }
      };

      ElementView_default.prototype.initElements = function() {};

      ElementView_default.prototype.initModelEvents = function() {};

      ElementView_default.prototype.update_value = function() {
        return this.model.set({
          classes: this.el.className
        });
      };

      ElementView_default.prototype.close_edit = function() {
        return this.update_value();
      };

      ElementView_default.prototype.save = function(msg) {
        this.model.set({
          body: this.el.innerHTML
        });
        return $("#view_element")[0].innerHTML = msg + ": " + this.model.get("body");
      };

      ElementView_default.prototype.changeClasses = function() {
        this.el.className = this.model.get("classes");
        return window.SmartEditor.editor_panel.model.trigger("update_form");
      };

      ElementView_default.prototype._getSizeIdx = function() {
        var j, sizeIdx, unit;
        sizeIdx = undefined;
        j = 0;
        while (j < sizeName.length) {
          if (this.el.classList.contains(sizeName[j])) {
            sizeIdx = j;
            break;
          }
          j++;
        }
        if (!sizeIdx) {
          unit = $($(".container")[0]).width() / sizeName.length;
          sizeIdx = Math.floor($(this.el).width() / unit);
        }
        return sizeIdx;
      };

      ElementView_default.prototype._setSizeIdx = function(newSizeIdx) {
        var j;
        j = 0;
        while (j < sizeName.length) {
          if (j !== newSizeIdx) this.el.classList.remove(sizeName[j]);
          j++;
        }
        if (newSizeIdx >= 0 && newSizeIdx < sizeName.length) {
          return this.el.classList.add(sizeName[newSizeIdx]);
        }
      };

      ElementView_default.prototype._setWidth = function(num) {
        var idx;
        idx = this._getSizeIdx() + num;
        if (idx >= sizeName.length) {
          idx = sizeName.length - 1;
        } else {
          if (idx < 0) idx = 0;
        }
        this._setSizeIdx(idx);
        return window.SmartEditor.editor_panel.model.trigger("update_form");
      };

      ElementView_default.prototype.increseWidth = function() {
        return this._setWidth(+1);
      };

      ElementView_default.prototype.decreseWidth = function() {
        return this._setWidth(-1);
      };

      ElementView_default.prototype.deleteElement = function() {
        var el;
        el = this.el;
        el.parentNode.removeChild(el);
        return window.SmartEditor.editor_panel.model.trigger("closePanel");
      };

      ElementView_default.prototype.surroundColumn = function(e) {
        var $col_el, editableEl, range;
        range = window.getSelection().getRangeAt(0);
        $col_el = $("<div class=\"span3\">");
        if (range.startContainer === range.endContainer && range.endOffset - range.startOffset <= 0) {
          editableEl = this.model.get("target_el");
          if (editableEl && !$(editableEl).is(".span1,.span2,.span3,.span4,.span5,.span6,.span7,.span8,.span9,.span10,.span1,.span12")) {
            $col_el = $(editableEl).wrap($col_el).parent();
          }
        } else {
          range.surroundContents($col_el[0]);
        }
        if (!$col_el.parent().is(".row")) $col_el.wrap("<div class=\"row\">");
        return SmartEditor.setupElements(range.startContainer.parentNode);
      };

      ElementView_default.prototype.insertColumn = function(e) {
        var content, el, model, target, view;
        content = prompt("Enter a text");
        model = new SmartEditor.models.DivModel();
        view = new SmartEditor.views.DivView({
          model: model,
          tagName: model.get("tagName")
        });
        model.set({
          body: content,
          id: "column_" + this.model.get("currentNum")
        });
        el = view.el;
        target = this.model.get("editableEl");
        return target.parentNode.insertBefore(el, target);
      };

      ElementView_default.prototype.undo = function(e) {
        document.execCommand("undo", false, null);
        return window.SmartEditor.setupElements(window.getSelection().getRangeAt(0).startContainer.parentNode);
      };

      ElementView_default.prototype.redo = function(e) {
        document.execCommand("redo", false, null);
        return window.SmartEditor.setupElements(window.getSelection().getRangeAt(0).startContainer.parentNode);
      };

      return ElementView_default;

    })(Backbone.View);
    views.ElementView_default = ElementView_default;
    views = window.SmartEditor.views;
    models = window.SmartEditor.models;
    collections = window.SmartEditor.collections;
    _DivModel = {
      defaults: {
        type: "div",
        tagName: "div",
        body: "",
        sizeIdx: -1,
        commands: models.defaultModel.prototype.defaults.commands.concat(["bold", "italic", "underline", "link", "insertImage", "joinNext", "fontIncrease", "fontDecrease"])
      },
      schema: {
        body: {
          type: "TextArea"
        }
      }
    };
    _.extend(_DivModel.schema, models.defaultModel.prototype.schema);
    models.DivModel = models.defaultModel.extend(_DivModel);
    views.DivView = views.defaultView.extend({
      initModelEvents: function() {
        _.bindAll(this, "changeBody");
        return this.model.bind("change:body", this.changeBody);
      },
      initElements: function(create) {
        if (create) return $(this.el).append(this.model.get("body"));
      },
      update_value: function() {
        views.defaultView.prototype.update_value.apply(this, arguments);
        return this.model.set({
          body: this.el.innerHTML
        });
      },
      changeBody: function() {
        if (this.el.innerHTML !== this.model.get("body")) {
          this.el.innerHTML = this.model.get("body");
          return SmartEditor.setupElements(this.el);
        }
      },
      insertImage: function(e) {
        var img_model, img_view, range, url;
        url = prompt("Entar a url");
        if (!url) return false;
        img_model = new models.ImgModel({
          url: url
        });
        img_view = new views.ImgView({
          model: img_model,
          tagName: img_model.get("tagName")
        });
        range = window.getSelection().getRangeAt(0);
        return range.insertNode(img_view.el);
      },
      bold: function(e) {
        document.execCommand("bold", false, null);
        return window.SmartEditor.setupElements(window.getSelection().getRangeAt(0).startContainer.parentNode);
      },
      italic: function(e) {
        document.execCommand("italic", false, null);
        return window.SmartEditor.setupElements(window.getSelection().getRangeAt(0).startContainer.parentNode);
      },
      underline: function(e) {
        document.execCommand("underline", false, null);
        return window.SmartEditor.setupElements(window.getSelection().getRangeAt(0).startContainer.parentNode);
      },
      fontIncrease: function(e) {
        var Range;
        Range = window.getSelection().getRangeAt(0).startContainer;
        document.execCommand("fontsize", false, "5%");
        return window.SmartEditor.setupElements(window.getSelection().getRangeAt(0).startContainer.parentNode);
      },
      fontDecrease: function(e) {
        var Range;
        Range = window.getSelection().getRangeAt(0).startContainer;
        document.execCommand("fontsize", false, "1%");
        return window.SmartEditor.setupElements(window.getSelection().getRangeAt(0).startContainer.parentNode);
      },
      link: function(e) {
        var range, url;
        range = window.getSelection().getRangeAt(0);
        if (range.startContainer.parentNode.tagName === "A" || range.endContainer.parentNode.tagName === "A") {
          document.execCommand("unlink", false, null);
        } else {
          url = prompt("Enter a url");
          document.execCommand("createLink", false, url);
        }
        return SmartEditor.setupElements(range.startContainer.parentNode);
      },
      joinNext: function(e) {
        var el;
        return el = this.el;
        /*
              num = 0
              $(el.nextSibling).remove()  while el.nextSibling and ((not el.nextSibling.children or el.nextSibling.children.length <= 0) and (not el.nextSibling.textContent or not /\S/.test(el.nextSibling.textContent)) or el.nextSibling.tagName is "BR")
              i = 0
        
              while i < 2 and not el.nextSibling?
                el = el.parentNode
                $(el.nextSibling).remove()  while el.nextSibling and ((not el.nextSibling.children or el.nextSibling.children.length <= 0) and (not el.nextSibling.textContent or not /\S/.test(el.nextSibling.textContent)) or el.nextSibling.tagName is "BR")
                i++
              $target = $(el.nextSibling)
              return  unless $target.length
              if $target.is(el.tagName) and ->
                i = 0
        
                while i < $target[0].classList.length
                  obj = $target[0].classList.item(i)
                  return false  if obj[0] isnt "_" and not el.classList.contains(obj)
                  i++
                true
              ()
                el.appendChild $target[0].removeChild($target[0].childNodes[0])  while $target[0].childNodes.length > 0
                $target.remove()
              else
                $(el).append $target
              SmartEditor.setupElements el.parentNode
        */
      }
    });
    _ImgModel = {
      defaults: {
        type: "img",
        tagName: "img",
        commands: models.defaultModel.prototype.defaults.commands.concat([]),
        src: "",
        alt: "empty image"
      },
      schema: {
        src: {
          type: "Text"
        },
        alt: {
          type: "Text"
        }
      }
    };
    _.extend(_ImgModel.schema, models.defaultModel.prototype.schema);
    models.ImgModel = models.defaultModel.extend(_ImgModel);
    views.ImgView = views.defaultView.extend({
      initElements: function(create) {
        if (create) {
          $(this.el).attr("src", this.model.get("src"));
          return $(this.el).attr("alt", this.model.get("alt"));
        }
      },
      initModelEvents: function() {
        _.bindAll(this, "changeSRC", "changeAlt");
        this.model.bind("change:src", this.changeSRC);
        return this.model.bind("change:alt", this.changeAlt);
      },
      update_value: function() {
        views.defaultView.prototype.update_value.apply(this, arguments);
        return this.model.set({
          src: this.el.src,
          alt: this.el.alt
        });
      },
      changeSRC: function() {
        return this.el.src = this.model.get("src");
      },
      changeAlt: function() {
        return this.el.alt = this.model.get("alt");
      }
    });
    _AnchorModel = {
      defaults: {
        type: "anchor",
        tagName: "a",
        content: "new link",
        url: ""
      },
      schema: {
        url: {
          type: "Text"
        },
        content: {
          type: "Text"
        }
      }
    };
    _AnchorModel.defaults.commands = models.defaultModel.prototype.defaults.commands.concat(["unLink"]);
    _.extend(_AnchorModel.schema, models.defaultModel.prototype.schema);
    models.AnchorModel = models.defaultModel.extend(_AnchorModel);
    views.AnchorView = views.defaultView.extend({
      initElements: function(create) {
        if (create) {
          $(this.el).attr("href", this.model.get("url"));
          return this.el.innerHTML = this.model.get("content");
        }
      },
      initModelEvents: function() {
        _.bindAll(this, "changeURL", "changeContent");
        this.model.bind("change:url", this.changeURL);
        return this.model.bind("change:content", this.changeContent);
      },
      update_value: function() {
        views.defaultView.prototype.update_value.apply(this, arguments);
        return this.model.set({
          url: this.el.href,
          content: this.el.innerHTML
        });
      },
      changeURL: function() {
        return this.el.href = this.model.get("url");
      },
      changeContent: function() {
        if (this.el.innerHTML !== this.model.get("content")) {
          this.el.innerHTML = this.model.get("content");
          return SmartEditor.setupElements(this.el);
        }
      },
      unLink: function() {
        window.SmartEditor.editor_panel.model.trigger("upLayer");
        $(this.el).before($(this.el.childNodes));
        return this.el.parentNode.removeChild(this.el);
      }
    });
    _LinkImgModel = {
      defaults: {
        type: "linkimg",
        tagName: "a",
        sizeIdx: 5,
        href: "",
        url: "",
        alt: "empty image",
        img_el: undefined,
        commands: models.defaultModel.prototype.defaults.commands.concat(["unLink"])
      },
      schema: {
        href: {
          type: "Text"
        },
        url: {
          type: "Text"
        },
        alt: {
          type: "Text"
        }
      }
    };
    _.extend(_LinkImgModel.schema, models.defaultModel.prototype.schema);
    models.LinkImgModel = models.defaultModel.extend(_LinkImgModel);
    return views.LinkImgView = views.defaultView.extend({
      initElements: function(create) {
        if (create) {
          this.$el = $(this.el);
          this.$el.attr("href", this.model.get("href"));
          this.$img = $("<img>");
          this.$img.attr("src", this.model.get("url"));
          this.$img.attr("alt", this.model.get("alt"));
          return this.$el.append(this.$img);
        } else {
          this.$img = $(this.el);
          return this.$el = this.$img.closest("a");
        }
      },
      initModelEvents: function() {
        _.bindAll(this, "changeURL", "changeAlt", "changeHref", "unLink");
        this.model.bind("change:url", this.changeURL);
        this.model.bind("change:alt", this.changeAlt);
        this.model.bind("change:href", this.changeHref);
        return this.model.bind("unlink", this.unLink);
      },
      update_value: function() {
        views.defaultView.prototype.update_value.apply(this, arguments);
        return this.model.set({
          url: this.$img.attr("src"),
          alt: this.$img.attr("alt"),
          href: this.$el.attr("href")
        });
      },
      changeURL: function() {
        return this.$img.attr("src", this.model.get("url"));
      },
      changeAlt: function() {
        return this.$img.attr("alt", this.model.get("alt"));
      },
      changeHref: function() {
        return this.$el.attr("href", this.model.get("href"));
      },
      unLink: function() {
        var parent;
        this.$el.before(this.$el[0].childNodes);
        parent = this.$el[0].parentNode;
        this.$el[0].parentNode.removeChild(this.$el[0]);
        this.$img.unbind();
        window.SmartEditor.editor_panel.view.closePanel();
        return window.SmartEditor.setupElements(parent);
      }
    });
  })();

}).call(this);
