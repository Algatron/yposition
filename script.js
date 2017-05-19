

angular.module('mainApp', [])


.component('mainComp', {

    controller: function($window, $element, $document) {

        function generateRectangleCss(viewWidth, viewHeight) {
            var recSize = ((Math.random() * 100) + 100).toFixed();
            var color = '#' + Math.round(0xffffff * Math.random()).toString(16);
            var posx = (Math.random() * (viewWidth + 200 - recSize)).toFixed() - 100;
            var posy = (Math.random() * (viewHeight + 200 - recSize)).toFixed() - 100;

            posy += 150;

            return {
                'width': recSize + 'px',
                'height': recSize + 'px',
                'background-color': color,
                'position': 'absolute',
                'left': posx + 'px',
                'top': posy + 'px',
                'border': 'solid'
            };
        }

        this.generateRandomCss = function() {
            this.anchorCss = generateRectangleCss($window.innerWidth, $window.innerHeight);
        }.bind(this);

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
            console.info('vsaef');
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

            this.popupConfig = { 
                template: '<div>Hello!</div>',
                trigger: 'click',
                valign: 'bottom',
                halign: 'right'
            };

            this.anchor = $('#anchor');
            this.updateAnchorLocation();

            angular.element($window).on('resize', this.onResize);

        }.bind(this);

    },

	templateUrl: "/appTemplate.html"
})

.directive('yPosition', function() {
  return {
    restrict: 'A',
    scope: {
        config: '=yPosition'
    },
    controllerAs: '$ctrl',
    controller: function($scope, $element) {


        function adjustToView(coords) {

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
            var anchorBounds = $element[0].getBoundingClientRect();
            var popupBounds = this.popupElement[0].getBoundingClientRect();

            var position = calculatePreferredPosition(anchorBounds, 
                popupBounds.width, popupBounds.height, this.config.valign, this.config.halign);
            this.popupElement.css(position);
        }.bind(this);

        this._validateConfig = function() {
            if (!this.config.template) {
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
                var PRE = "<div style='position: fixed; background-color: #DCDCDC' data-uuid=" + this.uuid + ">";
                var POST = "</div>";
                this.popupElement = angular.element(PRE + this.config.template + POST);
                this.popupElement.appendTo(this.bodyElement).ready(this.recomputeLocation);
            }
            this.popupDisplayed = true;
        };

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
            this.config = $scope.config;
            
            this._validateConfig();
            this._setupTigger();


        };

        this.$onDestroy = function() {
            // TODO
            angular.element($element).off('click', this.togglePoppup);
        };


    }
  };
});
