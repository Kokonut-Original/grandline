// client/js/04-camera.js
// Dieu khien camera di chuyen theo nguoi choi va chuyen doi toa do the gioi sang man hinh.
// Phu thuoc: client/js/00-boot.js.

(function () {
  'use strict';
  const OP = window.OP = window.OP || {};
  OP.CAM = {
    worldToScreen: function (x, y) { return { x, y }; },
    follow: function () {}
  };
})();
