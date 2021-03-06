/*
 * https://github.com/legalthings/signature-pad-angular
 * Copyright (c) 2015 ; Licensed MIT
 */

angular.module('signature', []);

angular.module('signature').directive('signaturePad', ['$window', '$timeout',
  function ($window, $timeout) {
    'use strict';

    var signaturePad, canvas, element, EMPTY_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';
    return {
      restrict: 'EA',
      replace: true,
      template: '<div class="signature" ng-style="{height: height + \'px\', width: width + \'px\'}"><canvas ng-mouseup="onMouseup()" ng-mousedown="notifyDrawing({ drawing: true })"></canvas></div>',
      scope: {
        accept: '=',
        clear: '=',
        dataurl: '=',
        height: '@',
        width: '@',
        notifyDrawing: '&onDrawing',
      },
      controller: [
        '$scope',
        function ($scope) {
          $scope.accept = function () {
            var signature = {};

            if (!$scope.signaturePad.isEmpty()) {
              signature.dataUrl = $scope.signaturePad.toDataURL();
              signature.isEmpty = false;
            } else {
              signature.dataUrl = EMPTY_IMAGE;
              signature.isEmpty = true;
            }

            return signature;
          };

          $scope.onMouseup = function () {
            $scope.updateModel();

            // notify that drawing has ended
            $scope.notifyDrawing({ drawing: false });
          };

          $scope.updateModel = function () {
            /*
             defer handling mouseup event until $scope.signaturePad handles
             first the same event
             */
            $timeout()
              .then(function () {
                var result = $scope.accept();
                $scope.dataurl = result.isEmpty ? undefined : result.dataUrl;
              });
          };

          $scope.clear = function () {
            $scope.signaturePad.clear();
            $scope.dataurl = undefined;
          };

          $scope.$watch("dataurl", function (dataUrl) {
            if (dataUrl) {
              $scope.signaturePad.fromDataURL(dataUrl);
            }
          });
        }
      ],
      link: function (scope, element, attrs) {
        canvas = element.find('canvas')[0];
        scope.signaturePad = new SignaturePad(canvas);
        
        
        if (scope.signature && !scope.signature.$isEmpty && scope.signature.dataUrl) {
          scope.signaturePad.fromDataURL(scope.signature.dataUrl);
        }
        
        var canvas = element.find('canvas')[0];
        var target = element[0];
        
        var ratio =  Math.max($window.devicePixelRatio || 1, 1);
        canvas.style.width = target.offsetWidth + "px";
        canvas.style.height = target.offsetHeight + "px";
        canvas.width = target.offsetWidth * ratio;
        canvas.height = target.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);

        element.on('touchstart', onTouchstart);

        element.on('touchend', onTouchend);

        function onTouchstart() {
          scope.$apply(function () {
            // notify that drawing has started
            scope.notifyDrawing({ drawing: true });
          });
        }

        function onTouchend() {
          scope.$apply(function () {
            // updateModel
            scope.updateModel();

            // notify that drawing has ended
            scope.notifyDrawing({ drawing: false });
          });
        }
      }
    };
  }
]);

// Backward compatibility
angular.module('ngSignaturePad', ['signature']);