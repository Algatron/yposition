

angular.module('mainApp', [])


.component('mainComp', {

    controller: function($window, $element, $document) {

        this.updateAnchorLocation = function() {
            this.anchor.css(this.anchorCss);
        };

        this.updateMinMax = function() {
            var windowOffset = 50;
            // $window.innerWidth, $window.innerHeight
            this.leftMin = -1 * windowOffset;
            this.leftMax = $window.innerWidth;
            this.topMin = -1 * windowOffset;
            this.topMax = $window.innerHeight + windowOffset;
        }.bind(this);

        this.onResize = function() {
            this.windowWidth = $window.innerWidth;
            this.windowHeight = $window.innerHeight;
        }.bind(this);

        this.$onInit = function() {

            this.onResize();
            this.updateMinMax();

            this.anchorCss = {
                'width': 50,
                'height': 50,
                'left': 300,
                'top': 400,
                'position': 'absolute',
                'border': 'solid'
            };

            // this.data = 'hi!';

            this.popupConfig = { 
                scope: this,
                trigger: 'click',
                valign: 'bottom',
                halign: 'right',
                template: '<div style="margin: 10px">' +
                    '<div>aerfgerfg eragwerg eagr eag rqg erg qgr </div>' + 
                    '<div>aerfgerfg eragwerg eagr eag rqg erg qgr </div>' +
                    '{{ $ctrl.data }}<div>',
            };

            this.anchor = $('#anchor');
            this.updateAnchorLocation();

            angular.element($window).on('resize', this.onResize);

        }.bind(this);

    },

	templateUrl: "/appTemplate.html"
})

.directive('yPosition', function($compile) {
  return {
    restrict: 'A',
    scope: false,
    scope: {
        config: '=yPosition'
    },
    controllerAs: '$ctrl',
    controller: function($scope, $element, $document, $window, $attrs, $interpolate) {

        function adjustToView(coords) {

            // HORIZONTAL POSITION / SIZE
            // if width of popup is wider then viewport, position is full width
            if (coords.width >= $window.innerWidth) {
                coords.left = 0;
                coords.width = $window.innerWidth;
            } else {
                // if right edge of popup would be off the screen to the right, then
                // move it left until right edge of popup is on right side of viewport
                if (coords.left + coords.width >= $window.innerWidth) {
                    coords.left = $window.innerWidth - coords.width;
                }
                // if left edge is off the screen to left, move to 0
                if (coords.left <= 0) {
                    coords.left = 0;
                }
                // resize width if necessary to fit in viewport
                coords.width = Math.min(coords.width, $window.innerWidth - coords.left);
            }

            // VERTICAL POSITION / SIZE
            // if height of popup is taller than the viewport, position is full height
            if (coords.height >= $window.innerHeight) {
                coords.top = 0;
                coords.height = $window.innerHeight;
            } else {
                // if bottom edge of popup would be off the screen to the bottom, then
                // move it up until bottom edge of popup is on bottom side of viewport
                if (coords.top + coords.height >= $window.innerHeight) {
                    coords.top = $window.innerHeight - coords.height;
                }
                // if top edge is off the screen to top, move down to 0
                if (coords.top <= 0) {
                    coords.top = 0;
                }
                // resize width if necessary to fit in viewport
                coords.height = Math.min(coords.height, $window.innerHeight - coords.top);
            }

        }

        function calculatePreferredPosition(anchorBoundingClientRect, targetWidth, targetHeight, targetValign, targetHalign) {

            var position = {
                width: targetWidth,
                height: targetHeight
            };

            switch (targetValign) {
                case 'top':
                    position.top = anchorBoundingClientRect.top - targetHeight;
                    break;
                case 'bottom':
                default:
                    position.top = anchorBoundingClientRect.bottom;
            }

            switch (targetHalign) {
                case 'left':
                    position.left = anchorBoundingClientRect.right - targetWidth;
                    break;
                case 'right':
                default:
                    position.left = anchorBoundingClientRect.left;
            }
            return position;
        }

        this.recomputeLocation = function() {
            console.info('fwefewf');
            if (this.popupElement) {
                var anchorBounds = $element[0].getBoundingClientRect();
                var popupBounds = this.popupElement[0].getBoundingClientRect();

                var position = calculatePreferredPosition(anchorBounds, 
                    popupBounds.width, popupBounds.height, this.config.valign, this.config.halign);
                adjustToView(position);
                this.popupElement.css(position);
            }
        }.bind(this);

        this._validateConfig = function() {
            if (!this.config.template && !this.config.templateUrl) {
                throw "yPosition config missing template!";
            }
        }.bind(this);

        this._setupTigger = function() {
            switch (this.config.trigger) {
                case 'click':
                    angular.element($element).on('click', this.togglePoppup);
                    break;
                default:    
                    throw 'yPosition init - unknown trigger';
            }

        }.bind(this);

        this.togglePoppup = function() {
            if (this.popupDisplayed) {
                this.hide();
            } else {
                this.show(); 
            }
        }.bind(this);

        this.hide = function() {
            if (this.popupDisplayed) {
                this.popupElement.remove();
                delete this.popupElement;
            }
            this.popupDisplayed = false; 
        };

        this.show = function() {
            if (!this.popupDisplayed) {
                var PRE = "<div style='position: absolute; background-color: #DCDCDC' data-uuid=" + this.uuid + ">";
                var POST = "</div>";
                this.popupElement = angular.element(PRE + this.config.template + POST);
                var scope = this.config.scope.$scope || $scope;
                $compile(this.popupElement)(scope);    
                
                this.popupElement.appendTo(this.bodyElement).ready(this.recomputeLocation);
            }
            this.popupDisplayed = true;
        };

        this.$doCheck = function() {
            if (this.config) {
                if (!this.oldConfig) {
                    this.oldConfig = angular.copy(this.config);
                    this.recomputeLocation();
                }
                if ((this.config.halign !== this.oldConfig.halign) ||
                    (this.config.valign !== this.oldConfig.valign)) {
                    this.oldConfig = angular.copy(this.config);
                    this.recomputeLocation();
                }
            }
        }.bind(this);

        this.$onInit = function() {

            this.uuid = 245135134513431;
            this.popupDisplayed = false;
            this.bodyElement = $('body');
            this.config = $scope.config;

            // var x = $interpolate($attrs.yPosition)();
            // this.config = $scope.$eval($attrs.yPosition);
            this._validateConfig();
            this._setupTigger();

            angular.element($document[0].body).on('scroll', this.recomputeLocation);

        };

        this.$onDestroy = function() {
            // TODO
            angular.element($element).off('click', this.togglePoppup);
        };


    }
  };
});
