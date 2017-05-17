

angular.module('mainApp', [])


.component('mainComp', {

    controller: function($window) {

        function generateRectangleCss(viewWidth, viewHeight) {
            var divsize = ((Math.random() * 100) + 100).toFixed();
            var color = '#' + Math.round(0xffffff * Math.random()).toString(16);
            var posx = (Math.random() * (viewWidth + 200 - divsize)).toFixed() - 100;
            var posy = (Math.random() * (viewHeight + 200 - divsize)).toFixed() - 100;

            posy += 150;

            return {
                'width': divsize + 'px',
                'height': divsize + 'px',
                'background-color': color,
                'position': 'absolute',
                'left': posx + 'px',
                'top': posy + 'px',
                'border': 'solid'
            };
        }

        this.reset = function(onlyPosition) {
            if (!onlyPosition) {
                this.target = {
                    valign: 'top',
                    halign: 'right',
                    width: 200,
                    height: 80
                };
            }
            this.configs = [];
            for (var i = 0; i < this.numRectangles; ++i) {
                this.configs.push(generateRectangleCss($window.innerWidth, $window.innerHeight));
            }
        }.bind(this);

        this.$onInit = function() {
            
            this.numRectangles = 1;
            this.reset(false);
            
        }.bind(this);


    },

	templateUrl: "/appTemplate.html"


})

.component('rec', {

    template: "<div>Top:{{ $ctrl.data.top }}</div><div>Left:{{ $ctrl.data.left }}</div>",

    controller: function($element, $interval, $window) {

        this.compute = function() {
            console.info('ewrfgerwf');
        }.bind(this);

        this.updateLocationData = function() {
            this.data = {
                top: $($element[0]).offset().top - $window.scrollY,
                left: $($element[0]).offset().left - $window.scrollX
            }
        };

        this.$onInit = function() {

            this.registeredEvents = 'click';
            this.width = 200;
            this.height = 80;

            $($element).css(this.cssConfig);

            this.updateLocationData();

            $interval(this.updateLocationData.bind(this), 50);

            angular.element($element).on(this.registeredEvents, this.compute);

        };

        this.$onDestroy = function() {
            angular.element($element).off(this.registeredEvents, this.compute);
        };

    },

    bindings: {
        recId: '<',
        cssConfig: '<',
        popupConfig: '<'
    }
})



.service('calcs', function($document, $window) {

    var MENU_EDGE_MARGIN = 0;

    /**
     * Computes menu position and sets the style on the menu container
     * @param {HTMLElement} el - the menu container element
     * @param {object} opts - the interim element options object
     */
    this.calculateMenuPosition = function calculateMenuPosition(el, opts, template) {

      // var containerNode = el[0];
      var containerNode = el;
      // var openMenuNode = el[0].firstElementChild;
      var openMenuNode = template;
      var openMenuNodeRect = openMenuNode.getBoundingClientRect();
      var boundryNode = $document[0].body;
      var boundryNodeRect = boundryNode.getBoundingClientRect();

      var menuStyle = $window.getComputedStyle(openMenuNode);

      // var originNode = opts.target[0].querySelector(prefixer.buildSelector('md-menu-origin')) || opts.target[0];
      // var originNodeRect = originNode.getBoundingClientRect();

      var bounds = {
        left: boundryNodeRect.left + MENU_EDGE_MARGIN,
        top: Math.max(boundryNodeRect.top, 0) + MENU_EDGE_MARGIN,
        bottom: Math.max(boundryNodeRect.bottom, Math.max(boundryNodeRect.top, 0) + boundryNodeRect.height) - MENU_EDGE_MARGIN,
        right: boundryNodeRect.right - MENU_EDGE_MARGIN
      };

      var alignTarget;
      var alignTargetRect = { top:0, left : 0, right:0, bottom:0 };
      var existingOffsets  = { top:0, left : 0, right:0, bottom:0  };
      var positionMode = opts.mdMenuCtrl.positionMode();

      if (positionMode.top == 'target' || positionMode.left == 'target' || positionMode.left == 'target-right') {
        alignTarget = firstVisibleChild();
        if ( alignTarget ) {
          // TODO: Allow centering on an arbitrary node, for now center on first menu-item's child
          alignTarget = alignTarget.firstElementChild || alignTarget;
          alignTarget = alignTarget.querySelector(prefixer.buildSelector('md-menu-align-target')) || alignTarget;
          alignTargetRect = alignTarget.getBoundingClientRect();

          existingOffsets = {
            top: parseFloat(containerNode.style.top || 0),
            left: parseFloat(containerNode.style.left || 0)
          };
        }
      }

      var position = {};
      var transformOrigin = 'top ';

      switch (positionMode.top) {
        case 'target':
          position.top = existingOffsets.top + originNodeRect.top - alignTargetRect.top;
          break;
        case 'cascade':
          position.top = originNodeRect.top - parseFloat(menuStyle.paddingTop) - originNode.style.top;
          break;
        case 'bottom':
          position.top = originNodeRect.top + originNodeRect.height;
          break;
        default:
          throw new Error('Invalid target mode "' + positionMode.top + '" specified for md-menu on Y axis.');
      }

      var rtl = ($mdUtil.bidi() == 'rtl');

      switch (positionMode.left) {
        case 'target':
          position.left = existingOffsets.left + originNodeRect.left - alignTargetRect.left;
          transformOrigin += rtl ? 'right'  : 'left';
          break;
        case 'target-left':
          position.left = originNodeRect.left;
          transformOrigin += 'left';
          break;
        case 'target-right':
          position.left = originNodeRect.right - openMenuNodeRect.width + (openMenuNodeRect.right - alignTargetRect.right);
          transformOrigin += 'right';
          break;
        case 'cascade':
          var willFitRight = rtl ? (originNodeRect.left - openMenuNodeRect.width) < bounds.left : (originNodeRect.right + openMenuNodeRect.width) < bounds.right;
          position.left = willFitRight ? originNodeRect.right - originNode.style.left : originNodeRect.left - originNode.style.left - openMenuNodeRect.width;
          transformOrigin += willFitRight ? 'left' : 'right';
          break;
        case 'right':
          if (rtl) {
            position.left = originNodeRect.right - originNodeRect.width;
            transformOrigin += 'left';
          } else {
            position.left = originNodeRect.right - openMenuNodeRect.width;
            transformOrigin += 'right';
          }
          break;
        case 'left':
          if (rtl) {
            position.left = originNodeRect.right - openMenuNodeRect.width;
            transformOrigin += 'right';
          } else {
            position.left = originNodeRect.left;
            transformOrigin += 'left';
          }
          break;
        default:
          throw new Error('Invalid target mode "' + positionMode.left + '" specified for md-menu on X axis.');
      }

      var offsets = opts.mdMenuCtrl.offsets();
      position.top += offsets.top;
      position.left += offsets.left;

      clamp(position);

      var scaleX = Math.round(100 * Math.min(originNodeRect.width / containerNode.offsetWidth, 1.0)) / 100;
      var scaleY = Math.round(100 * Math.min(originNodeRect.height / containerNode.offsetHeight, 1.0)) / 100;

      return {
        top: Math.round(position.top),
        left: Math.round(position.left),
        // Animate a scale out if we aren't just repositioning
        transform: !opts.alreadyOpen ? $mdUtil.supplant('scale({0},{1})', [scaleX, scaleY]) : undefined,
        transformOrigin: transformOrigin
      };

      /**
       * Clamps the repositioning of the menu within the confines of
       * bounding element (often the screen/body)
       */
      function clamp(pos) {
        pos.top = Math.max(Math.min(pos.top, bounds.bottom - containerNode.offsetHeight), bounds.top);
        pos.left = Math.max(Math.min(pos.left, bounds.right - containerNode.offsetWidth), bounds.left);
      }

      /**
       * Gets the first visible child in the openMenuNode
       * Necessary incase menu nodes are being dynamically hidden
       */
      function firstVisibleChild() {
        for (var i = 0; i < openMenuNode.children.length; ++i) {
          if ($window.getComputedStyle(openMenuNode.children[i]).display != 'none') {
            return openMenuNode.children[i];
          }
        }
      }
    };



});
