(function() {
    'use strict';

    var module = window.angular.module('sx.wizard.tpls', []);

    module.value('$wizardConsts', {
        template: '$sx-ngtk/wizard/wizard.html'
    });

    module.run(['$templateCache', '$wizardConsts',
        function($templateCache, $wizardConsts) {
            $templateCache.put($wizardConsts.template, '' +
                '<div class="">' +
                '<div class="modal-header">' +
                '    <button type="button" class="close" ng-click="cancel()">' +
                '        <span aria-hidden="true">&times;</span>' +
                '    </button>' +
                '    <h3 class="modal-title">{{_title}}</h3>' +
				'<div class="fuelux">' +

				'</div>' +
                '</div>' +
                '<div class="modal-body" style="padding-top: 0 !important">' +
                '  <div ng-show="_shadow && (_entering || _leaving)" class="shadow">' +
                '    <div class="outer">' +
                '      <div class="middle text-info">' +
                '        <div class="inner">' +
                '          <i class="fa fa-5x fa-spinner fa-pulse"></i>' +
                '        </div>' +
                '        <div class="inner">' +
                '          <h3 ng-show="_entering">loading...</h3>' +
                '          <h3 ng-show="_leaving">validating...</h3>' +
                '        </div>' +
                '      </div>' +
                '    </div>' +
                '  </div>' +
                '  <div class="step-container" ' +
                '       sx-wizard="$data" ' +
                '       sx-wizard-steps="$steps" ' +
                '       sx-wizard-current-step="$current" ' +
                '       sx-wizard-buttons="$buttons" ' +
                '       sx-wizard-show-shadow="showShadow()" ' +
                '       sx-wizard-hide-shadow="hideShadow()" ' +
                '       sx-wizard-init="go(0, false)">' +
                '  </div>' +
                '<div class="modal-footer">' +
                '  <div class="btn-group pull-left">' +
                '    <button class="btn btn-default" ' +
                '            ng-repeat="button in $current.step.$context.navigation.buttons"' +
                '            ng-disabled="_entering || _leaving" ' +
                '            ng-click="goById(button.stepFn(), false)">{{button.text}}</button>' +
                '  </div>' +
                '     <div class="row">' +
                '       <div class="col-sm-12 text-right bottom-prev-next">' +
                '           <button class="btn btn-primary btn-prev pull-left" ' +
                '                   ng-show="!_showFinishButton" ' +
                '                   ng-disabled="_entering || _leaving || _history.length <= 0" ' +
                '                   ng-click="previous()">Trở về trang trước</button>' +
                '           <button class="btn btn-primary btn-next"' +
                '                   ng-show="$stepsOrder.indexOf($current.step.id) == 0" ' +
                '                   ng-disabled="_entering || _leaving" ' +
                '                   ng-click="next()">Tiếp tục</button>' +
                '        <div class="btn-group pull-right theme-container animated tada">' + 
                '           <button class=" btn btn-success"  style="margin-right: 1px !important"' +
                '                   ng-show="$stepsOrder.indexOf($current.step.id) == 1" ' +
                '                   ng-disabled="_entering || _leaving" ' +
                '                   ng-click="post()">Đăng bài</button>' +
                '           <button class="btn btn-default" ng-show="!_showFinishButton" ng-click="cancel()">Hủy</button>' +
                '           <button class="btn btn-success" ng-show="_showFinishButton" ng-click="cancel()">Xong</button>' +
                '        </div>' +
                '       </div>' +
                '      </div>' +
                '</div>' +
                '</div>' +
                '');
        }
    ]);
}());