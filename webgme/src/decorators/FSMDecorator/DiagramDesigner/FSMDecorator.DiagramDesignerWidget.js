/*globals define, _*/
/*jshint browser: true, camelcase: false*/
/**
 * This decorator inherits from the ModelDecorator.DiagramDesignerWidget.
 * With no changes to the methods - it will functions just like the ModelDecorator.
 *
 * For more methods see the ModelDecorator.DiagramDesignerWidget.js in the webgme repository.
 *
 * @author pmeijer / https://github.com/pmeijer
 */

define([
    'js/RegistryKeys',
    'js/Constants',
    'js/Controls/DropDownMenu',
    'decorators/ModelDecorator/DiagramDesigner/ModelDecorator.DiagramDesignerWidget',
    'jquery',
    'underscore'
], function (
    REGISTRY_KEYS,
    CONSTANTS,
    DropDownMenu,
    ModelDecoratorDiagramDesignerWidget) {

    'use strict';

    var FSMDecorator,
        DECORATOR_ID = 'FSMDecorator',
        COMMAND_META_TYPES = ['Start', 'Move', 'Turn', 'Stop'];

    FSMDecorator = function (options) {
        var opts = _.extend({}, options);

        ModelDecoratorDiagramDesignerWidget.apply(this, [opts]);

        this.logger.debug('FSMDecorator ctor');



        this.dropDown = new DropDownMenu({
            size:'micro',
            sort: true
        });

        this.dropDown.setTitle('Next Action:');
    };

    FSMDecorator.prototype = Object.create(ModelDecoratorDiagramDesignerWidget.prototype);
    FSMDecorator.prototype.constructor = FSMDecorator;
    FSMDecorator.prototype.DECORATORID = DECORATOR_ID;

    FSMDecorator.prototype.on_addTo = function () {
        var self = this,
            client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]),
            META = {};

        client.getAllMetaNodes()
            .forEach(function (metaObj) {
               META[metaObj.getAttribute('name')] = metaObj.getId()
            });

        this.logger.debug('This node was added to the canvas', nodeObj);

        // Call the base-class method..
        ModelDecoratorDiagramDesignerWidget.prototype.on_addTo.apply(this, arguments);

        // this.$resultIndicator = $('<button>', {
        //     text:'<<interface>>'
        // });
        //
        // this.$resultIndicator.click(function () {
        //     nodeObj.getParentId();
        //     client.startTransaction();
        //     var newNodeId = client.createNode({
        //       parentId: nodeObj.getParentId(),
        //       baseId: "/7" // hard-code single typ
        //      });
        //      client.setPointer(connectionId, 'src', nodeObjId);
        //      // client.setPointer(connectionId, 'dst', newTargetId);
        //      client.completeTransaction();
        // });
        //this.$el.append(this.$resultIndicator);

        this.dropDown.onItemClicked = function (value) {
            client.startTransaction();

            var newCommandId = client.createNode({
                parentId: nodeObj.getParentId(),
                baseId: value
            });

            client.setRegistry(newCommandId, 'position', {
                x: nodeObj.getRegistry('position').x + 200,
                y: nodeObj.getRegistry('position').y
            });

            var newConnectionId = client.createNode({
                parentId: nodeObj.getParentId(),
                baseId: META.Transition
            });

            client.setPointer(newConnectionId, 'src', nodeObj.getId());
            client.setPointer(newConnectionId, 'dst', newCommandId);

            client.completeTransaction();
        };

        if (META.hasOwnProperty('Transition') === true) {

            this.$el.append(this.dropDown.getEl());
            COMMAND_META_TYPES.forEach(function (commandTypeName) {
                if (META.hasOwnProperty(commandTypeName)) {
                    self.dropDown.addItem({
                        value: META[commandTypeName],
                        text: commandTypeName
                    });
                } else {
                    self.logger.error(commandTypeName + ' not among META!');
                }
            });
        } else {
            self.logger.error('Transition not among META!');
        }
    };

    FSMDecorator.prototype.destroy = function () {
        ModelDecoratorDiagramDesignerWidget.prototype.destroy.apply(this, arguments);
    };

    FSMDecorator.prototype.update = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        this.logger.debug('This node is on the canvas and received an update event', nodeObj);

        ModelDecoratorDiagramDesignerWidget.prototype.update.apply(this, arguments);
    };

    return FSMDecorator;
});