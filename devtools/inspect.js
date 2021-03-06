var attachInspector = function(wpe) {
    with(wpe) {
        var defaultTextAttributes = {
            text: "",
            w: 0,
            h: 0,
            fontStyle: "normal",
            fontSize: 40,
            fontFace: null,
            wordWrap: true,
            wordWrapWidth: 0,
            lineHeight: null,
            textBaseline: "alphabetic",
            textAlign: "left",
            offsetY: null,
            maxLines: 0,
            maxLinesSuffix: "..",
            precision: null,
            textColor: 0xffffffff,
            paddingLeft: 0,
            paddingRight: 0,
            shadow: false,
            shadowColor: 0xff000000,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 5,
            highlight: false,
            highlightHeight: 0,
            highlightColor: 0xff000000,
            highlightOffset: 0,
            highlightPaddingLeft: 0,
            highlightPaddingRight: 0,
            cutSx: 0,
            cutEx: 0,
            cutSy: 0,
            cutEy: 0
        };

// _properties must have been called already to prevent init mayhem.
        window.mutationCounter = 0;
        window.mutatingChildren = false;
        var observer = new MutationObserver(function(mutations) {
            var fa = ["x", "y", "w", "h", "alpha", "mountX", "mountY", "pivotX", "pivotY", "scaleX", "scaleY", "rotation", "visible", "clipping", "rect", "colorUl", "colorUr", "colorBl", "colorBr", "color", "borderWidthLeft", "borderWidthRight", "borderWidthTop", "borderWidthBottom", "borderWidth", "borderColorLeft", "borderColorRight", "borderColorTop", "borderColorBottom", "borderColor", "zIndex", "forceZIndexContext", "renderToTexture", "renderToTextureLazy", "hideResultTexture", "colorizeResultTexture"];
            var fac = fa.map(function(v) {return v.toLowerCase()});

            var ta = ["text", "fontStyle", "fontSize", "fontFace", "wordWrap", "wordWrapWidth", "lineHeight", "textBaseline", "textAlign", "offsetY", "maxLines", "maxLinesSuffix", "precision", "paddingLeft", "paddingRight", "shadow", "shadowOffsetX", "shadowOffsetY", "shadowBlur", "highlight", "highlightHeight", "highlightOffset", "highlightPaddingLeft", "highlightPaddingRight", "cutSx", "cutEx", "cutSy", "cutEy", "textColor", "shadowColor", "highlightColor"];
            var tac = ta.map(function(v) {return v.toLowerCase()});

            mutations.forEach(function(mutation) {
                if (mutation.type == 'childList') {

                    var node = mutation.target;
                    var c = mutation.target.view;
                }

                if (mutation.type == 'attributes' && mutation.attributeName !== 'style' && mutation.attributeName !== 'class') {
                    var n = mutation.attributeName.toLowerCase();
                    var c = mutation.target.view;

                    if (c.__ignore_attrib_changes === window.mutationCounter) {
                        // Ignore attribute changes that were caused by actual value modifications by js.
                        return;
                    }

                    var v = mutation.target.getAttribute(mutation.attributeName);
                    var index = fac.indexOf(n);
                    if (index !== -1) {
                        var rn = fa[index];
                        var pv;
                        try {
                            if (v === null) {
                                switch(rn) {
                                    case "pivotX":
                                    case "pivotY":
                                        pv = 0.5;
                                        break;
                                    case "alpha":
                                    case "scaleX":
                                    case "scaleY":
                                        pv = 1;
                                        break;
                                    case "visible":
                                        pv = true;
                                        break;
                                    case "clipping":
                                        pv = false;
                                        break;
                                    case "rect":
                                        pv = false;
                                        break;
                                    case "zIndex":
                                        pv = 0;
                                        break;
                                    case "forceZIndexContext":
                                        pv = false;
                                        break;
                                    case "color":
                                        pv = 0xffffffff;
                                        break;
                                    case "colorUl":
                                    case "colorUr":
                                    case "colorBl":
                                    case "colorBr":
                                        if (mutation.target.hasAttribute("color")) {
                                            // This may happen when the separate values are combined.
                                            return;
                                        }
                                        pv = 0xffffffff;
                                        break;
                                    case "renderToTexture":
                                        pv = false
                                        break;
                                    case "renderToTextureLazy":
                                        pv = false
                                        break;
                                    case "hideResultTexture":
                                        pv = false
                                        break;
                                    case "colorizeResultTexture":
                                        pv = false
                                        break;
                                    default:
                                        pv = 0;
                                }
                            } else {
                                switch(rn) {
                                    case "color":
                                    case "colorUl":
                                    case "colorUr":
                                    case "colorBl":
                                    case "colorBr":
                                        pv = parseInt(v, 16);
                                        break;
                                    case "visible":
                                    case "clipping":
                                    case "rect":
                                    case "forceZIndexContext":
                                    case "renderToTexture":
                                    case "renderToTextureLazy":
                                    case "hideResultTexture":
                                    case "colorizeResultTexture":
                                        pv = (v === "true");
                                        break;
                                    default:
                                        pv = parseFloat(v);
                                        if (isNaN(pv)) throw "e";
                                }
                            }

                            var fv;
                            switch(rn) {
                                case "color":
                                    var f = ['colorUl','colorUr','colorBl','colorBr'].map(function(q) {
                                        return mutation.target.hasAttribute(q);
                                    });

                                    if (!f[0]) c["colorUl"] = pv;
                                    if (!f[1]) c["colorUr"] = pv;
                                    if (!f[2]) c["colorBl"] = pv;
                                    if (!f[3]) c["colorBr"] = pv;
                                    break;
                                default:
                                    c[rn] = pv;
                            }

                            // Set final value, not the transitioned value.
                        } catch(e) {
                            console.error('Bad (ignored) attribute value', rn);
                        }
                    } else {
                        if (mutation.attributeName.indexOf("text-") !== -1) {
                            n = mutation.attributeName.substring(5);
                            index = tac.indexOf(n);
                            if (index == -1) {
                                return;
                            }
                            var rn = ta[index];
                            if (v === null) {
                                // Deleted.
                                pv = defaultTextAttributes[rn];
                            } else {
                                switch(rn) {
                                    case "fontStyle":
                                    case "textBaseline":
                                    case "textAlign":
                                    case "maxLinesSuffix":
                                    case "text":
                                        pv = v;
                                        break;
                                    case "wordWrap":
                                    case "shadow":
                                    case "highlight":
                                        pv = (v === "true");
                                        break;
                                    case "textColor":
                                    case "shadowColor":
                                    case "highlightColor":
                                        pv = parseInt(v, 16);
                                        break;
                                    case "fontFace":
                                        if (v.indexOf(",") == -1) {
                                            pv = v;
                                        } else {
                                            pv = v.split(",");
                                        }
                                        break;
                                    default:
                                        pv = parseFloat(v);
                                }
                            }

                            try {
                                c.text[rn] = pv;
                            } catch(e) {
                                console.error('Bad (ignored) text attribute value', rn, pv);
                            }
                        }
                    }
                }
            });

            window.mutationCounter++;
        });

        ViewCore.prototype.dhtml = function() {
            return this._view.dhtml();
        }

        View.prototype.dhtml = function() {
            if (!this.debugElement) {
                this.debugElement = document.createElement('DIV');
                this.debugElement.view = this;
                this.debugElement.style.position = 'absolute';

                this.debugElement.id = "" + this.id;
                observer.observe(this.debugElement, {attributes: true});
            }
            if (this.stage.root === this && !this.dhtml_root) {
                // Root element.
                var root = document.createElement('DIV');
                document.body.appendChild(root);
                var self = this;
                setTimeout(function() {
                    var bcr = self.stage.adapter.canvas.getBoundingClientRect();
                    root.style.left = bcr.left + 'px';
                    root.style.top = bcr.top + 'px';
                    root.style.width = Math.ceil(bcr.width / self.stage.getRenderPrecision()) + 'px';
                    root.style.height = Math.ceil(bcr.height / self.stage.getRenderPrecision()) + 'px';
                    root.style.transformOrigin = '0 0 0';
                    root.style.transform = 'scale(' + self.stage.getRenderPrecision() + ',' + self.stage.getRenderPrecision() + ')';
                }, 1000);

                root.style.position = 'absolute';
                root.style.overflow = 'hidden';
                root.style.zIndex = '65535';
                root.appendChild(this.debugElement);

                this.dhtml_root = root;
            }
            return this.debugElement;
        };

        var oView = View;

        var oSetParent = oView.prototype._setParent;
        View.prototype._setParent = function(parent) {
            var prevParent = this.parent;
            oSetParent.apply(this, arguments);

            if (!window.mutatingChildren) {
                if (parent) {
                    var index = parent._children.getIndex(this);
                    if (index == parent._children.get().length - 1) {
                        parent.dhtml().appendChild(this.dhtml());
                    } else {
                        parent.dhtml().insertBefore(this.dhtml(), parent.dhtml().children[index]);
                    }
                } else {
                    if (prevParent) {
                        prevParent.dhtml().removeChild(this.dhtml());
                    }
                }
            }
        };

        var oInit = Stage.prototype.init;
        Stage.prototype.init = function() {
            oInit.apply(this, arguments);

            // Apply stage scaling.
            this.root.updateDebugTransforms();
        };

        var oAddTag = oView.prototype.addTag;
        View.prototype.addTag = function(tag) {
            oAddTag.apply(this, arguments);

            if (tag) {
                this.dhtml().classList.add(tag);
            }
        };

        var oRemoveTag = oView.prototype.removeTag;
        View.prototype.removeTag = function(tag) {
            oRemoveTag.apply(this, arguments);

            if (tag) {
                this.view.dhtml().classList.remove(tag);
            }
        };

// Change an attribute due to new value inputs.
        var val = function(c, n, v, dv) {
            if (c._view) {
                c = c._view;
            }
            if (v == dv) {
                c.dhtmlRemoveAttribute(n);
            } else {
                c.dhtmlSetAttribute(n, v);
            }
        };

        View.prototype.dhtmlRemoveAttribute = function() {
            // We don't want the attribute listeners to be called during the next observer cycle.
            this.__ignore_attrib_changes = window.mutationCounter;
            this.dhtml().removeAttribute.apply(this.dhtml(), arguments);
        };

        View.prototype.dhtmlSetAttribute = function() {
            this.__ignore_attrib_changes = window.mutationCounter;
            this.dhtml().setAttribute.apply(this.dhtml(), arguments);
        };

        if (typeof Component !== "undefined") {
            Component.prototype.___state = Component.prototype.__state;
            Object.defineProperty(View.prototype, '__state', {
                get: function() {
                    return this.___state;
                },
                set: function(v) {
                    if (this.___state !== v) {
                        val(this, 'state', v, "");
                        this.___state = v;
                    }
                }
            });
        }

        View.prototype.__ref = View.prototype._ref;
        Object.defineProperty(View.prototype, '_ref', {
            get: function() {
                return this.__ref;
            },
            set: function(v) {
                if (this.__ref !== v) {
                    val(this, 'ref', v, null);
                    this.__ref = v;
                }
            }
        });

        View.prototype.__x = View.prototype._x;
        Object.defineProperty(View.prototype, '_x', {
            get: function() {
                return this.__x;
            },
            set: function(v) {
                if (this.__x !== v) {
                    val(this, 'x', v, 0);
                    this.__x = v;
                    this.updateLeft();
                }
            }
        });

        View.prototype.__y = View.prototype._y;
        Object.defineProperty(View.prototype, '_y', {
            get: function() {
                return this.__y;
            },
            set: function(v) {
                if (this.__y !== v) {
                    val(this, 'y', v, 0);
                    this.__y = v;
                    this.updateTop();
                }
            }
        });

        View.prototype.__w = View.prototype._w;
        Object.defineProperty(View.prototype, '_w', {
            get: function() {
                return this.__w;
            },
            set: function(v) {
                if (this.__w !== v) {
                    val(this, 'w', v, 0);
                    this.__w = v;
                }
            }
        });

        View.prototype.__h = View.prototype._h;
        Object.defineProperty(View.prototype, '_h', {
            get: function() {
                return this.__h;
            },
            set: function(v) {
                if (this.__h !== v) {
                    val(this, 'h', v, 0);
                    this.__h = v;
                }
            }
        });

        View.prototype.updateLeft = function() {
            var mx = this.mountX * this.renderWidth;
            var x = this._x - mx;
            this.dhtml().style.left = x + 'px';
        };

        View.prototype.updateTop = function() {
            var my = this.mountY * this.renderHeight;
            var y = this._y - my;
            this.dhtml().style.top = y + 'px';
        };

        ViewCore.prototype.__rw = 0;
        Object.defineProperty(ViewCore.prototype, '_rw', {
            get: function() {
                return this.__rw;
            },
            set: function(v) {
                this.__rw = v;
                this.dhtml().style.width = v + 'px';
                this._view.updateLeft();
            }
        });

        ViewCore.prototype.__rh = 0;
        Object.defineProperty(ViewCore.prototype, '_rh', {
            get: function() {
                return this.__rh;
            },
            set: function(v) {
                this.__rh = v;
                this.dhtml().style.height = v + 'px';
                this._view.updateTop();
            }
        });

        View.prototype.__alpha = 1;
        Object.defineProperty(View.prototype, '_alpha', {
            get: function() {
                return this.__alpha;
            },
            set: function(v) {
                if (this.__alpha !== v) {
                    val(this, 'alpha', v, 1);
                    this.__alpha = v;
                    this.dhtml().style.opacity = v;
                    this.dhtml().style.display = this.__visible && this.__alpha ? 'block' : 'none';
                }
            }
        });

        View.prototype.__visible = true;
        Object.defineProperty(View.prototype, '_visible', {
            get: function() {
                return this.__visible;
            },
            set: function(v) {
                if (this.__visible !== v) {
                    val(this, 'visible', v, true);
                    this.__visible = v;
                    this.dhtml().style.visibility = v ? 'visible' : 'hidden';
                    this.dhtml().style.display = this.__visible && this.__alpha ? 'block' : 'none';
                }
            }
        });

        View.prototype.__texture = null;
        Object.defineProperty(View.prototype, '_texture', {
            get: function() {
                return this.__texture;
            },
            set: function(v) {
                this.__texture = v;

                val(this, 'rect', this.rect, false);
                val(this, 'src', this.src, null);
            }
        });

        View.prototype.__rotation = 0;
        Object.defineProperty(View.prototype, '_rotation', {
            get: function() {
                return this.__rotation;
            },
            set: function(v) {
                if (this.__rotation !== v) {
                    val(this, 'rotation', v, 0);
                    this.__rotation = v;
                    this.updateDebugTransforms();
                }
            }
        });


        View.prototype.__scaleX = 1;
        Object.defineProperty(View.prototype, '_scaleX', {
            get: function() {
                return this.__scaleX;
            },
            set: function(v) {
                if (this.__scaleX !== v) {
                    val(this, 'scaleX', v, 1);
                    this.__scaleX = v;
                    this.updateDebugTransforms();
                }
            }
        });

        View.prototype.__scaleY = 1;
        Object.defineProperty(View.prototype, '_scaleY', {
            get: function() {
                return this.__scaleY;
            },
            set: function(v) {
                if (this.__scaleY !== v) {
                    val(this, 'scaleY', v, 1);
                    this.__scaleY = v;
                    this.updateDebugTransforms();
                }
            }
        });

        View.prototype.__pivotX = 0.5;
        Object.defineProperty(View.prototype, '_pivotX', {
            get: function() {
                return this.__pivotX;
            },
            set: function(v) {
                if (this.__pivotX !== v) {
                    val(this, 'pivotX', v, 0.5);
                    this.__pivotX = v;
                    this.updateDebugTransforms();
                }
            }
        });

        View.prototype.__pivotY = 0.5;
        Object.defineProperty(View.prototype, '_pivotY', {
            get: function() {
                return this.__pivotY;
            },
            set: function(v) {
                if (this.__pivotY !== v) {
                    val(this, 'pivotY', v, 0.5);
                    this.__pivotY = v;
                    this.updateDebugTransforms();
                }
            }
        });

        View.prototype.__mountX = 0;
        Object.defineProperty(View.prototype, '_mountX', {
            get: function() {
                return this.__mountX;
            },
            set: function(v) {
                if (this.__mountX !== v) {
                    val(this, 'mountX', v, 0);
                    this.__mountX = v;
                    this.updateLeft();
                }
            }
        });

        View.prototype.__mountY = 0;
        Object.defineProperty(View.prototype, '_mountY', {
            get: function() {
                return this.__mountY;
            },
            set: function(v) {
                if (this.__mountY !== v) {
                    val(this, 'mountY', v, 0);
                    this.__mountY = v;
                    this.updateTop();
                }
            }
        });

        ViewCore.prototype.__zIndex = 0;
        Object.defineProperty(ViewCore.prototype, '_zIndex', {
            get: function() {
                return this.__zIndex;
            },
            set: function(v) {
                if (this.__zIndex !== v) {
                    val(this, 'zIndex', v, 0);
                    this.__zIndex = v;
                    if (this.__zIndex || v) {
                        this.dhtml().style.zIndex = v;
                    }
                }
            }
        });

        ViewCore.prototype.__forceZIndexContext = false;
        Object.defineProperty(ViewCore.prototype, '_forceZIndexContext', {
            get: function() {
                return this.__forceZIndexContext;
            },
            set: function(v) {
                if (this.__forceZIndexContext !== v) {
                    val(this, 'forceZIndexContext', v, false);
                    this.__forceZIndexContext = v;
                }
            }
        });

        ViewCore.prototype.__clipping = false;
        Object.defineProperty(ViewCore.prototype, '_clipping', {
            get: function() {
                return this.__clipping;
            },
            set: function(v) {
                if (this.__clipping !== v) {
                    val(this, 'clipping', v, false);
                    this.__clipping = v;
                    var nv = v ? 'hidden' : 'visible';
                    if (v || !v && (this.dhtml().style.overflow == 'hidden')) {
                        this.dhtml().style.overflow = nv;
                    }
                }
            }
        });

        ViewCore.prototype.__withinBoundsMargin = false;
        Object.defineProperty(ViewCore.prototype, '_withinBoundsMargin', {
            get: function() {
                return this.__withinBoundsMargin;
            },
            set: function(v) {
                if (this.__withinBoundsMargin !== v) {
                    val(this, 'withinBoundsMargin', v, false);
                    this.__withinBoundsMargin = v;
                }
            }
        });

        ViewCore.prototype.__colorUl = 0xFFFFFFFF;
        Object.defineProperty(ViewCore.prototype, '_colorUl', {
            get: function() {
                return this.__colorUl;
            },
            set: function(v) {
                if (this.__colorUl !== v) {
                    val(this, 'colorUl', v.toString(16), "ffffffff");
                    this.__colorUl = v;
                    checkColors(this);
                }
            }
        });

        ViewCore.prototype.__colorUr = 0xFFFFFFFF;
        Object.defineProperty(ViewCore.prototype, '_colorUr', {
            get: function() {
                return this.__colorUr;
            },
            set: function(v) {
                if (this.__colorUr !== v) {
                    val(this, 'colorUr', v.toString(16), "ffffffff");
                    this.__colorUr = v;
                    checkColors(this);
                }
            }
        });

        ViewCore.prototype.__colorBl = 0xFFFFFFFF;
        Object.defineProperty(ViewCore.prototype, '_colorBl', {
            get: function() {
                return this.__colorBl;
            },
            set: function(v) {
                if (this.__colorBl !== v) {
                    val(this, 'colorBl', v.toString(16), "ffffffff");
                    this.__colorBl = v;
                    checkColors(this);
                }
            }
        });

        ViewCore.prototype.__colorBr = 0xFFFFFFFF;
        Object.defineProperty(ViewCore.prototype, '_colorBr', {
            get: function() {
                return this.__colorBr;
            },
            set: function(v) {
                if (this.__colorBr !== v) {
                    val(this, 'colorBr', v.toString(16), "ffffffff");
                    this.__colorBr = v;
                    checkColors(this);
                }
            }
        });

        var checkColors = function(viewRenderer) {
            let view = viewRenderer._view;
            if (viewRenderer._colorBr === undefined) {
                // View initialization.
                return;
            }

            if (viewRenderer._colorUl === viewRenderer._colorUr && viewRenderer._colorUl === viewRenderer._colorBl && viewRenderer._colorUl === viewRenderer._colorBr) {
                if (viewRenderer._colorUl !== 0xffffffff) {
                    view.dhtmlSetAttribute('color', viewRenderer._colorUl.toString(16));
                } else {
                    view.dhtmlRemoveAttribute('color');
                }
                view.dhtmlRemoveAttribute('colorul');
                view.dhtmlRemoveAttribute('colorur');
                view.dhtmlRemoveAttribute('colorbl');
                view.dhtmlRemoveAttribute('colorbr');
            } else {
                val(view, 'colorUr', viewRenderer.colorUr.toString(16), "ffffffff");
                val(view, 'colorUl', viewRenderer.colorUl.toString(16), "ffffffff");
                val(view, 'colorBr', viewRenderer.colorBr.toString(16), "ffffffff");
                val(view, 'colorBl', viewRenderer.colorBl.toString(16), "ffffffff");
                view.dhtmlRemoveAttribute('color');
            }
        };

        ViewTexturizer.prototype.__enabled = false;
        Object.defineProperty(ViewTexturizer.prototype, '_enabled', {
            get: function() {
                return this.__enabled;
            },
            set: function(v) {
                if (this.__enabled !== v) {
                    val(this, 'renderToTexture', v, false);
                    this.__enabled = v;
                }
            }
        });

        ViewTexturizer.prototype.__lazy = false;
        Object.defineProperty(ViewTexturizer.prototype, '_lazy', {
            get: function() {
                return this.__lazy;
            },
            set: function(v) {
                if (this.__lazy !== v) {
                    val(this, 'renderToTextureLazy', v, false);
                    this.__lazy = v;
                }
            }
        });

        ViewTexturizer.prototype.__colorize = false;
        Object.defineProperty(ViewTexturizer.prototype, '_colorize', {
            get: function() {
                return this.__colorize;
            },
            set: function(v) {
                if (this.__colorize !== v) {
                    val(this, 'colorizeResultTexture', v, false);
                    this.__colorize = v;
                }
            }
        });

        ViewTexturizer.prototype.__hideResult = false;
        Object.defineProperty(ViewTexturizer.prototype, '_hideResult', {
            get: function() {
                return this.__hideResult;
            },
            set: function(v) {
                if (this.__hideResult !== v) {
                    val(this, 'hideResultTexture', v, false);
                    this.__hideResult = v;
                }
            }
        });

        var dtaKeys = Object.keys(defaultTextAttributes);
        var dtaValues = dtaKeys.map(function(k) {return defaultTextAttributes[k];});

        var oOpdateTexture = ViewText.prototype.updateTexture;
        ViewText.prototype.updateTexture = function(v) {
            oOpdateTexture.apply(this, arguments);

            var tr = this.settings;
            var c = this.view;
            var i, n = dtaKeys.length;
            for (i = 0; i < n; i++) {
                var key = dtaKeys[i];
                var dvalue = dtaValues[i];
                var value = tr[key];
                var attKey = "text-" + key.toLowerCase();

                if (dvalue === value) {
                    c.dhtmlRemoveAttribute(attKey);
                } else {
                    var pv;
                    switch(key) {
                        case "fontStyle":
                        case "textBaseline":
                        case "textAlign":
                        case "maxLinesSuffix":
                            pv = value;
                            break;
                        case "wordWrap":
                        case "shadow":
                        case "highlight":
                            pv = value ? "true" : "false";
                            break;
                        case "textColor":
                        case "shadowColor":
                        case "highlightColor":
                            pv = "0x" + value.toString(16);
                            break;
                        case "fontFace":
                            pv = Array.isArray(value) ? value.join(",") : value;
                            break;
                        default:
                            pv = "" + value;
                    }

                    c.dhtmlSetAttribute(attKey, pv);
                }
            }
        };

        View.prototype.updateDebugTransforms = function() {
            if (this._pivotX !== 0.5 || this._pivotY !== 0.5) {
                this.dhtml().style.transformOrigin = (this._pivotX * 100) + '% '  + (this._pivotY * 100) + '%';
            } else if (this.dhtml().style.transformOrigin) {
                this.dhtml().style.transformOrigin = '50% 50%';
            }

            var r = this._rotation;
            var sx = this._scaleX;
            var sy = this._scaleY;

            if ((sx !== undefined && sy !== undefined) && (this.id === 0)) {
                // Root element: must be scaled.
                if (this.stage.options.w !== this.stage.options.renderWidth || this.stage.options.h !== this.stage.options.renderHeight) {
                    sx *= (this.stage.options.w / this.stage.options.renderWidth);
                    sy *= (this.stage.options.h / this.stage.options.renderHeight);
                }
            }
            var parts = [];
            if (r) parts.push('rotate(' + r + 'rad)');
            if ((sx !== undefined && sy !== undefined) && (sx !== 1 || sy !== 1)) parts.push('scale(' + sx + ', ' + sy + ')');

            this.dhtml().style.transform = parts.join(' ');
        };
    }
}

if (typeof Stage !== "undefined") {
    // Sync loading. Auto attach immediately.
    attachInspector({});
}
