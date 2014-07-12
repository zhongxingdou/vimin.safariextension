(function() {
  var VIMLIKE = {
    hintText: '',
    nextPageText: '',
    prevPageText: '',
    mode: 'normal',
    interval: 60,
    handler: {
      '.': function() {
        VIMLIKE.nextPage();
      },
      ',': function() {
        VIMLIKE.prevPage();
      },
      'S-escape': function() {
        VIMLIKE.modechange();
      },
      'S-~': function() {
        VIMLIKE.modechange();
      },
      'd': function() {
        VIMLIKE.pagedown();
      },
      'C-d': function() {
        VIMLIKE.pagedown();
      },
      'u': function() {
        VIMLIKE.pageup();
      },
      'C-u': function() {
        VIMLIKE.pageup();
      },
      'j': function() {
        VIMLIKE.scrolldown();
      },
      'k': function() {
        VIMLIKE.scrollup();
      },
      'h': function() {
        VIMLIKE.scrollleft();
      },
      'l': function() {
        VIMLIKE.scrollright();
      },
      'gg': function() {
        VIMLIKE.scrollTop();
      },
      'gi': function() {
        VIMLIKE.focusFirstInput();
      },
      'S-g': function() {
        VIMLIKE.scrollBottom();
      },
      't': function() {
        VIMLIKE.openNewTab();
      },
      'S-x': function() {
        VIMLIKE.reopenTab();
      },
      'gt': function() {
        VIMLIKE.nextTab();
      },
      'S-k': function() {
        VIMLIKE.nextTab();
      },
      'gS-t': function() {
        VIMLIKE.previousTab();
      },
      'S-j': function() {
        VIMLIKE.previousTab();
      },
      'x': function() {
        VIMLIKE.closeTab();
      },
      'C-w': function() {
        VIMLIKE.closeTab();
      },
      'r': function() {
        VIMLIKE.reload();
      },
      'f': function() {
        VIMLIKE.hah(true);
      },
      // '/': function() {
      // VIMLIKE.hah(true);
      // },
      'S-f': function() {
        VIMLIKE.hah(false);
      },
      'S-h': function() {
        VIMLIKE.historyBack();
      },
      'S-l': function() {
        VIMLIKE.historyForward();
      },
      'escape': function() {
        VIMLIKE.blurFocus();
      },
      'C-[': function() {
        VIMLIKE.blurFocus();
      }
    },
    formHandler: {
      'escape': function() {
        VIMLIKE.blurFocus();
      },
      'C-[': function() {
        VIMLIKE.blurFocus();
      }
    },
    firstStroke: {},
    keyChoice: [],
    keyEvent: function(e) {
      if(VIMLIKE.mode == 'hint') {
        return;
      }
      var t = e.target;
      if(t.nodeType == 1) { //element
        var tn = t.tagName.toLowerCase();
        var pressKey = VIMLIKE.kc2char(e.keyCode || e.charCode);
        if(pressKey == 191) pressKey = '/'; //I want more good code :(
        if(e.metaKey) {
          pressKey = 'M-' + pressKey;
        }
        if(e.ctrlKey) {
          pressKey = 'C-' + pressKey;
        }
        if(e.shiftKey) {
          pressKey = 'S-' + pressKey;
          // if(pressKey != 'S-shift'){
            // console.info(pressKey);
          // }
        }
        if(e.altKey) {
          pressKey = 'A-' + pressKey;
        }
        if(pressKey == 'S-shift') { //don't use :)
          return;
        }

        if(VIMLIKE.mode == "useonline"){
          if(pressKey != "S-escape" && pressKey != "S-~") return;
        }

        //exit edit state in input controls
        if(tn == 'input' || tn == 'textarea' || tn == 'select') {
          if(typeof VIMLIKE.formHandler[pressKey] == 'function' && VIMLIKE.mode != 'useonline') {
            e.preventDefault();
            VIMLIKE.formHandler[pressKey].apply();
          }
          return;
        }

        VIMLIKE.keyChoice.push(pressKey);
        var keychain = VIMLIKE.keyChoice.join('');

        if(VIMLIKE.firstStroke[pressKey] && typeof VIMLIKE.handler[keychain] != 'function') {
          e.preventDefault();
          return;
        }

        //check w stroke bind
        if(typeof VIMLIKE.handler[keychain] == 'function') {
          pressKey = keychain;
        } else {
          if(typeof VIMLIKE.handler[pressKey] != 'function') {
            VIMLIKE.keyChoice.length = 0; //clear keychoice
            return;
          }
        }
        VIMLIKE.keyChoice.length = 0; //clear keychoice
        e.preventDefault();
        VIMLIKE.handler[pressKey].apply();
      }
    },
    clickLinkByText: function(text) {
      var links = document.getElementsByTagName("a");
      var matches = [];
      for(var i = 0, l = links.length; i < l; i++) {
        var a = links[i];
        if(a.text.search(new RegExp(text)) != -1) {
          matches.push(a);
        }
      }

      if(matches.length) {
        text.split('|').forEach(function(atext) {
          if(atext.trim() == "")return true;
          var finded = false;
          matches.forEach(function(a) {
            if(a.text.indexOf(atext) != -1) {
              a.click();
              finded = true;
              return false;
            }
          });
          if(finded) return false;
        });
      }
    },
    nextPage: function() {
      this.clickLinkByText(VIMLIKE.nextPageText);
    },
    prevPage: function() {
      this.clickLinkByText(VIMLIKE.prevPageText);
    },
    distanceAdd: 0,
    scrolling: false,
    scrollDirection: '',
    scrollTimer: null,
    pressKeep: false,
    stopScroll: function() {
      this.pressKeep = false;
      this.distanceAdd = 0;
      this.scrollDirection = '';
      this.scrolling = false;
      this.scrollTimer && clearTimeout(this.scrollTimer);
    },
    scrollLastTime: new Date(),
    scrollTo: function(direction, distance, step, interval, inner) {
      if(this.scrolling) {
        if(!inner) {
          if(direction != this.scrollDirection) { //difrence direction
            this.stopScroll();
            //console.info("change to " + direction);
            return this.scrollTo(direction, distance, step, interval);
          } else { //same direction
            var past = (new Date) - this.scrollLastTime;
            if(past < 50) {
              //console.info("ignore");
              return;
            } else {
              this.scrollLastTime = new Date();
            }
            this.pressKeep = true;
            this.distanceAdd += distance;
            //console.info("add distance: " + distance);
            //console.info("distanceAdd: " + this.distanceAdd);
            return;
          }
        } else {
          //console.info("remaning scroll distance: " + distance);
        }
      } else {
        //console.info("start scroll :" + direction + " " + distance);
        //this.pressKeep = false;
        //this.distanceAdd = 0;
        this.scrolling = true;
        this.scrollDirection = direction;
        this.scrollLastTime = new Date();
      }

      if(this.distanceAdd) {
        distance += this.distanceAdd;
        this.distanceAdd = 0;
      }

      if(step > 0) { //向下滚
        if(distance <= 0) {
          return this.stopScroll();
        }
      } else { //向上滚
        if(distance >= 0) {
          return this.stopScroll();
        }
      }

      var self = this;
      this.scrollTimer = window.setTimeout(function() {
        scroll(0, window.pageYOffset + step);
        self.scrollTo(direction, distance - step, step, interval, true);
      }, interval);
    },
    pagedown: function() {
      //this.scrollTo('down', VIMLIKE.interval * 10, 10, 1);
      scroll(0, window.pageYOffset + (VIMLIKE.interval * 10));
    },
    pageup: function() {
      //this.scrollTo('up', -(VIMLIKE.interval * 10), -10, 1);
      scroll(0, window.pageYOffset - (VIMLIKE.interval * 10));
    },
    scrolldown: function() {
      //this.scrollTo('down', VIMLIKE.interval, 2, 1);
      scroll(0, window.pageYOffset + VIMLIKE.interval);
    },
    scrollup: function() {
      //this.scrollTo('up', -VIMLIKE.interval, -2, 1);
      scroll(0, window.pageYOffset - VIMLIKE.interval);
    },
    scrollTop: function() {
      scroll(0, -document.documentElement.scrollHeight);
    },
    scrollBottom: function() {
      scroll(0, document.documentElement.scrollHeight);
    },
    scrollleft: function() {
      scrollBy(-VIMLIKE.interval, 0);
    },
    scrollright: function() {
      scrollBy(VIMLIKE.interval, 0);
    },
    openNewTab: function() {
      safari.self.tab.dispatchMessage('vimlike', 'open');
    },
    openBackGround: function(url) {
      safari.self.tab.dispatchMessage('vimlike', {
        background: url
      });
    },
    focusFirstInput: function(){
      var els =  document.getElementsByTagName("input");
      for(var i=0,l=els.length; i<l; i++){
        var el = els[i];
        if(el.type=="text"){
          el.focus();
          break;
        }
      }
    },
    reopenTab: function() {
      safari.self.tab.dispatchMessage('vimlike', 'reopen');
    },
    previousTab: function() {
      safari.self.tab.dispatchMessage('vimlike', 'previous');
    },
    nextTab: function() {
      safari.self.tab.dispatchMessage('vimlike', 'next');
    },
    closeTab: function() {
      safari.self.tab.dispatchMessage('vimlike', 'close');
    },
    reload: function() {
      location.reload();
    },
    hah: function(isCurrent) {
      var hintKeys = VIMLIKE.hintText.toUpperCase();
      var xpath = '//a[@href]|//input[not(@type="hidden")]|//textarea|//select|//img[@onclick]|//button';
      var hintColor = '#ffff00';
      var hintColorForm = '#00ffff';
      var hintColorFocused = '#ff00ff';
      var keyMap = {
        '8': 'Bkspc',
        '46': 'Delete',
        '32': 'Space',
        '13': 'Enter',
        '16': 'Shift',
        '17': 'Ctrl',
        '18': 'Alt'
      };

      var hintKeysLength;
      var hintContainerId = 'hintContainer';
      var hintElements = [];
      var inputKey = '';
      var lastMatchHint = null;
      var hintTextLength;
      var k = 0;

      function getAbsolutePosition(elem, html, body, inWidth, inHeight) {
        var style = getComputedStyle(elem, null);
        if(style.visibility === 'hidden' || style.opacity === '0') return false;
        //var rect = rectFixForOpera( elem, getComputedStyle(elem,null)) || elem.getClientRects()[0];
        var rect = elem.getClientRects()[0];
        if(rect && rect.right - rect.left >= 0 && rect.left >= 0 && rect.top >= -5 && rect.bottom <= inHeight + 5 && rect.right <= inWidth) {
          return {
            top: (body.scrollTop || html.scrollTop) - html.clientTop + rect.top,
            left: (body.scrollLeft || html.scrollLeft) - html.clientLeft + rect.left
          };
        }
        return false;

      }

      function calcIterLength(hintElementsCount, hintKeysLength) {
        var iter = 1;
        while(Math.pow(hintKeysLength, iter) <= hintElementsCount) {
          iter += 1;
        }
        return iter;
      }

      function decToNBase(num, nBaseSymbols) {
        var nBase = nBaseSymbols.length;
        var nBaseNum = "";
        var s, y;
        do {
          s = Math.floor(num / nBase);
          y = num % nBase;
          nBaseNum = nBaseSymbols.charAt(y) + nBaseNum;
          if(s >= nBase) {
            num = s;
          } else {
            if(s > 0) {
              nBaseNum = nBaseSymbols.charAt(s) + nBaseNum;
            }
            break;
          }
        } while (true);
        return nBaseNum;
      }

      function createText(num, textLength) {
        var nBaseNum = decToNBase(num, hintKeys);

        var zeroChar = hintKeys.charAt(0);
        while(nBaseNum.length < textLength) {
          nBaseNum = zeroChar + nBaseNum;
        }

        return nBaseNum;
      }

      function getXPathElements(win) {
        function resolv(p) {
          if(p == 'xhtml') return 'http://www.w3.org/1999/xhtml';
        }
        var result = win.document.evaluate(xpath, win.document, resolv, 7, null);
        for(var i = 0, arr = [], len = result.snapshotLength; i < len; i++) {
          arr[i] = result.snapshotItem(i);
        }
        return arr;
      }

      function start(win) {
        var html = win.document.documentElement;
        var body = win.document.body;
        var inWidth = win.innerWidth;
        var inHeight = win.innerHeight;

        var df = document.createDocumentFragment();
        var div = df.appendChild(document.createElement('div'));
        div.id = hintContainerId;

        var spanStyle = {
          'position': 'absolute',
          'zIndex': '214783647',
          'color': '#000',
          'fontSize': '10pxt',
          'fontFamily': 'monospace',
          'lineHeight': '10pt',
          'padding': '0px',
          'margin': '0px',
          'opacity': '0.7'
        };
        var elems = getXPathElements(win);
        var AllPos = [];
        elems = elems.filter(function(elem) {
          var pos = getAbsolutePosition(elem, html, body, inWidth, inHeight);
          if(pos !== false) {
            AllPos.push(pos);
          }
          return pos !== false;
        });

        hintTextLength = calcIterLength(elems.length, hintKeys.length);
        elems.forEach(function(elem, i) {
          // var pos = getAbsolutePosition(elem, html, body, inWidth, inHeight);
          // if(pos === false) return;
          var pos = AllPos[i];
          var hint = createText(k, hintTextLength);
          var span = win.document.createElement('span');
          span.appendChild(document.createTextNode(hint));
          var st = span.style;
          for(var key in spanStyle) {
            st[key] = spanStyle[key];
          }
          st.backgroundColor = elem.hasAttribute('href') === true ? hintColor : hintColorForm;
          st.left = Math.max(0, pos.left - 8) + 'px';
          st.top = Math.max(0, pos.top - 8) + 'px';
          hintElements[hint] = span;
          span.element = elem;
          div.appendChild(span);
          k++;
        }, this);
        win.document.addEventListener('keydown', handle, true);
        win.document.body.appendChild(df);
      }

      function handle(eve) {
        var key = eve.keyCode || eve.charCode;
        if(key in keyMap === false) {
          removeHints();
          return;
        }
        var onkey = keyMap[key];
        switch(onkey) {
        case 'Enter':
          if(lastMatchHint.element.type == 'text') {
            eve.preventDefault();
            eve.stopPropagation();
          }
          if(!isCurrent) {
            if(/https?:\/\//.test(lastMatchHint.element.href)) {
              eve.preventDefault();
              eve.stopPropagation();
              VIMLIKE.openBackGround(lastMatchHint.element.href);
            }
          }
          resetInput();
          removeHints();
        case 'Shift':
        case 'Ctrl':
        case 'Alt':
          return;
        }
        eve.preventDefault();
        eve.stopPropagation();
        switch(onkey) {
        case 'Bkspc':
        case 'Delete':
          if(!inputKey) {
            removeHints();
            return;
          }
          resetInput();
          return;
        case 'Space':
          removeHints();
          return;
        default:
          inputKey = onkey;
        }

        if(inputKey.length < hintTextLength) {
          var inputPointCount = 0;
          var span;
          Object.keys(hintElements).forEach(function(hint) {
            if(hint.indexOf(inputKey) === 0) {
              span = hintElements[hint];
              var part = hint.substr(1);
              span.innerHTML = part;
              hintElements[part] = span;
              delete hintElements[hint];
              inputPointCount++;
            } else {
              span = hintElements[hint];
              delete hintElements[hint];
              span.parentNode.removeChild(span);
            }
          });

          if(inputPointCount === 0) {
            resetInput();
            removeHints();
          } else {
            hintTextLength--;
          }
        } else {
          var matchHintSpan = hintElements[inputKey];
          if(!matchHintSpan) {
            resetInput();
            removeHints();
          } else {
            resetInput();
            removeHints();
            matchHintSpan.element.focus();
            if(matchHintSpan.element.tagName.toUpperCase() === "A") {
              if(!isCurrent) {
                VIMLIKE.openBackGround(matchHintSpan.element.href);
              } else {
                matchHintSpan.element.click();
              }
            } else {
              matchHintSpan.element.click();
            }
          }
        }

        // blurHint();
        // if(inputKey in hintElements === false) {
        // resetInput(); //!!!
        // inputKey += onkey;
        // }
        //!!!
        // lastMatchHint = hintElements[inputKey];
        // lastMatchHint.style.backgroundColor = hintColorFocused;
        // lastMatchHint.element.focus();
      }

      function removeHints() {
        var frame = top.frames;
        if(!document.getElementsByTagName('frameset')[0]) {
          end(top);
        }
        Array.prototype.forEach.call(frame, function(elem) {
          try {
            end(elem);
          } catch(e) {}
        }, this);
      }

      function blurHint() {
        if(lastMatchHint) {
          lastMatchHint.style.backgroundColor = lastMatchHint.element.hasAttribute('href') === true ? hintColor : hintColorForm;
        }
      }

      function resetInput() {
        inputKey = '';
        blurHint();
        lastMatchHint = null;
      }

      function end(win) {
        var div = win.document.getElementById(hintContainerId);
        win.document.removeEventListener('keydown', handle, true);
        if(div) {
          win.document.body.removeChild(div);
        }
        VIMLIKE.mode = 'normal';
      }

      function hahInit() {
        hintKeysLength = hintKeys.length;
        hintKeys.split('').forEach(function(l) {
          keyMap[l.charCodeAt(0)] = l;
        }, this);
      }

      function hahDraw() {

        var frame = window.frames;
        if(!document.getElementsByTagName('frameset')[0]) {
          start(window);
        } else {
          Array.prototype.forEach.call(frame, function(elem) {
            try {
              start(elem);
            } catch(e) {}
          }, this);
        }
      }

      VIMLIKE.mode = 'hint';
      hahInit();
      hahDraw();
    },
    historyBack: function() {
      history.back();
    },
    historyForward: function() {
      history.forward();
    },
    blurFocus: function() {
      document.activeElement.blur();
    },
    modechange: function() {
      switch(VIMLIKE.mode) {
      case 'useonline':
        VIMLIKE.mode = 'normal';
        break;
      case 'normal':
        VIMLIKE.mode = 'useonline';
        break;
      default:
        VIMLIKE.mode = 'normal';
      }
      var modeDiv = document.getElementById('VIMLIKE_MODE_DIV');
      modeDiv.style.display = "block";
      if(modeDiv) {
        modeDiv.innerHTML = VIMLIKE.mode;
        var fadeOut = function(opa) {
            modeDiv.style.opacity = opa / 100;
            opa -= 10;
            if(opa < 10) {
              modeDiv.style.opacity = 0.1;
              modeDiv.style.display = "none";
              return;
            }
            setTimeout(function() {
              fadeOut(opa);
            }, 100);
          };
        fadeOut(80);
      }
    },
    kc2char: function(kc) {
      function between(a, b) {
        return a <= kc && kc <= b;
      }
      var _32_40 = "space pageup pagedown end home left up right down".split(" ");
      var kt = {
        8: "backspace",
        9: "tab",
        13: "enter",
        16: "shift",
        17: "control",
        27: "escape",
        46: "delete",
        188: ",",
        190: ".",
        192: "~"
      };
      return(between(65, 90) ? String.fromCharCode(kc + 32) : // a-z
      between(48, 57) ? String.fromCharCode(kc) : // 0-9
      between(96, 105) ? String.fromCharCode(kc - 48) : // num 0-9
      between(32, 40) ? _32_40[kc - 32] : kt.hasOwnProperty(kc) ? kt[kc] : kc);
    },
    init: function() {
      for(var key in VIMLIKE.handler) {
        if(key.length > 1 && !(/S-|C-|A-|escape/.test(key))) {
          VIMLIKE.firstStroke[key[0]] = true;
        }
      }
      VIMLIKE.createModeDiv();
      safari.self.tab.dispatchMessage('vimlike', 'load');

    },
    createModeDiv: function() {
      var modeDiv = document.createElement('div');
      modeDiv.id = 'VIMLIKE_MODE_DIV';
      var styles = {
        // 'bottom': '0px',
        // 'right': '0px',
        'top': '100px',
        'left': Math.floor((document.body.offsetWidth - 200) / 2) + 'px',
        'width': '200px',
        'height': '200px',
        'lineHeight': '200px',
        'backgroundColor': '#88cc88',
        'color': '#333',
        'fontSize': '30pt',
        'position': 'fixed',
        'borderRadius': '10px',
        'zIndex': '100',
        'border': '1px dotted #333',
        'opacity': '0.1',
        'textAlign': 'center',
        'display': 'none'
      };
      for(var key in styles) {
        modeDiv.style[key] = styles[key];
      }
      modeDiv.innerHTML = VIMLIKE.mode;
      modeDiv.addEventListener('mouseover', function() {
        this.style.opacity = '0.8';
      }, false);
      modeDiv.addEventListener('mouseout', function() {
        this.style.opacity = '0.1';
      }, false);
      document.body.appendChild(modeDiv);
    }

  };

  VIMLIKE.init();
  document.addEventListener('keydown', function(e) {
    VIMLIKE.keyEvent(e);
  }, false);

  document.addEventListener('keyup', function(e) {
    if(!VIMLIKE.pressKeep) return;
    VIMLIKE.stopScroll();
  }, false);

  if(typeof window.VIMLIKE == "undefined") {
    window.VIMLIKE = VIMLIKE;
  }

  safari.self.addEventListener('message', function(e) {
    if(['hintText', 'nextPageText', 'prevePageText'].indexOf(e.name) != -1){
      VIMLIKE[e.name] = e.message;
    }
  }, false);
})();