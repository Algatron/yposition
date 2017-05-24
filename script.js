

angular.module('mainApp', [])


.component('mainComp', {

    controller: function($scope, $window, $element, $document) {

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

            this.data = 'hi!';

            this.popupConfig = { 
                trigger: 'hover',
                valign: 'bottom',
                halign: 'right',
                templateUrl: 'testTemplate.html'
                // template: '<test></test>'
                // template: '<div style="padding: 10px">' +
                //     '<div>aerfgerfg eragwerg eagr eag rqg erg qgr </div>' + 
                //     '<div>aerfgerfg eragwerg eagr eag rqg erg qgr </div>' +
                //     '{{ $ctrl.data }}<div>',
            };

            this.anchor = $('#anchor');
            this.updateAnchorLocation();

            angular.element($window).on('resize', this.onResize);

        }.bind(this);

    },

	templateUrl: "/appTemplate.html"
})

.directive('test', function() {
    return {
        restrict: 'E',
        controller: function($scope, $element) {

            this.$onInit = function() {
            };

            this.$onDestroy = function() {
            };
        },
        template: '<div>test</div>'
    };
})

.directive('yPosition', function($compile, viewCalculationsService) {
  return {
    restrict: 'A',
    scope: false,
    controllerAs: '$someeCtrl',
    controller: function($parse, $scope, $element, $document, $window, $attrs, $interpolate, $timeout) {


        this.recomputeLocation = function() {
            if (this.popupElement) {
                var anchorBounds = $element[0].getBoundingClientRect();
                var popupBounds = this.popupElement[0].getBoundingClientRect();

                var position = viewCalculationsService.calculatePreferredPosition(anchorBounds, 
                    popupBounds.width, popupBounds.height, this.config.valign, this.config.halign,
                    this.bodyElement[0].scrollTop, this.bodyElement[0].scrollLeft);
                viewCalculationsService.adjustToView(position, $window);
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
                case 'hover':
                    angular.element($element).on('mouseenter', this.show);
                    angular.element($element).on('mouseleave', this.hide);
                    this.untrigger = function() { 
                        angular.element($element).off('mouseenter', this.show);
                        angular.element($element).off('mouseleave', this.hide);
                    };
                    break;
                case 'click':
                default:  
                    angular.element($element).on('click', this.togglePoppup);
                    this.untrigger = function() { angular.element($element).off('click', this.togglePoppup); };
                    break;
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
                if (this.popupElementScope) {
                    this.popupElementScope.$destroy();
                    this.popupElementScope = null;
                }
                this.popupElement.remove();
                this.popupElement = null;
            }
            this.popupDisplayed = false; 
        }.bind(this);

        this._getTemplateString = function() {
            if (this.config.template) {
                return "<div style='position: absolute;' data-uuid='" + this.uuid + "'>" + 
                    this.config.template + "</div>";
            } else if (this.config.templateUrl) {
                return "<div style='position: absolute;' data-uuid='" + this.uuid + 
                    "'><data-ng-include src=\"'" + this.config.templateUrl + "'\"></data-ng-include></div>";
            } else {
                throw "yPosition_getTemplateString() - Missing template";
            }
        };

        this.show = function() {
            if (!this.popupDisplayed) {
                this.popupElement = this._getTemplateString();
                this.popupElementScope = $scope.$new();
                this.popupElement = $compile(this.popupElement)(this.popupElementScope);
                this.popupElement.appendTo(this.bodyElement).ready(function() {
                    $scope.$apply();
                    $timeout(this.recomputeLocation, 0, false);
                }.bind(this));
            }
            this.popupDisplayed = true;
        }.bind(this);

        this.$doCheck = function() {
            if (!this.oldConfig) {
                this.oldConfig = angular.copy(this.config);
                this.recomputeLocation();
            }
            if ((this.config.halign !== this.oldConfig.halign) ||
                (this.config.valign !== this.oldConfig.valign)) {
                this.oldConfig = angular.copy(this.config);
                this.recomputeLocation();
            }
        }.bind(this);

        this.$onInit = function() {

            this.uuid = 245135134513431;
            this.popupDisplayed = false;
            this.bodyElement = $('body');
            // this.config = $parse($attrs.yPosition)($scope);
            this.config = $scope.$eval($attrs.yPosition);
            this._validateConfig();
            this._setupTigger();
        };

        this.$onDestroy = function() {
            // TODO
            if (this.untrigger) {
                this.untrigger();
            }
        };


    }
  };
})


.service('viewCalculationsService', function() {

        this.calculatePreferredPosition = function(anchorBoundingClientRect, targetWidth, 
                targetHeight, targetValign, targetHalign, vertScroll, horizScroll) {

            var position = {
                width: targetWidth,
                height: targetHeight
            };

            switch (targetValign) {
                case 'top':
                    position.top = anchorBoundingClientRect.top + vertScroll - targetHeight;
                    break;
                case 'bottom':
                default:
                    position.top = anchorBoundingClientRect.bottom + vertScroll;
            }

            switch (targetHalign) {
                case 'left':
                    position.left = anchorBoundingClientRect.right + horizScroll - targetWidth;
                    break;
                case 'right':
                default:
                    position.left = anchorBoundingClientRect.left + horizScroll;
            }
            return position;
        }


        this.adjustToView = function(coords, $window) {

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

        };

});
