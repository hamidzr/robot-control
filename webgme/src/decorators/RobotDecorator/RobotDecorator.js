/*globals define, _*/
/*jshint browser: true, camelcase: false*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */

define([
    'js/Decorators/DecoratorBase',
    './DiagramDesigner/RobotDecorator.DiagramDesignerWidget',
    './PartBrowser/RobotDecorator.PartBrowserWidget'
], function (DecoratorBase, RobotDecoratorDiagramDesignerWidget, RobotDecoratorPartBrowserWidget) {

    'use strict';

    var RobotDecorator,
        DECORATOR_ID = 'RobotDecorator';

    RobotDecorator = function (params) {
        var opts = _.extend({loggerName: this.DECORATORID}, params);

        DecoratorBase.apply(this, [opts]);

        this.logger.debug('RobotDecorator ctor');
    };

    _.extend(RobotDecorator.prototype, DecoratorBase.prototype);
    RobotDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    RobotDecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            DiagramDesigner: RobotDecoratorDiagramDesignerWidget,
            PartBrowser: RobotDecoratorPartBrowserWidget
        };
    };

    return RobotDecorator;
});