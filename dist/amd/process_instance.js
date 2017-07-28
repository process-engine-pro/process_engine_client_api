var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "uuid"], function (require, exports, uuid) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ProcessInstance {
        constructor(processKey, messageBusService, processable) {
            this._messageBusService = undefined;
            this._processKey = undefined;
            this._processable = undefined;
            this._participantSubscription = undefined;
            this._nextTaskDef = undefined;
            this._nextTaskEntity = undefined;
            this._taskChannelName = undefined;
            this._tokenData = undefined;
            this._participantId = undefined;
            this._eventSubscription = undefined;
            this._eventChannelName = undefined;
            this._messageBusService = messageBusService;
            this._processKey = processKey;
            this._processable = processable;
            this._participantId = uuid.v4();
        }
        get messageBusService() {
            return this._messageBusService;
        }
        get processable() {
            return this._processable;
        }
        get processKey() {
            return this._processKey;
        }
        get nextTaskDef() {
            return this._nextTaskDef;
        }
        set nextTaskDef(nextTaskDef) {
            this._nextTaskDef = nextTaskDef;
        }
        get nextTaskEntity() {
            return this._nextTaskEntity;
        }
        set nextTaskEntity(nextTaskEntity) {
            this._nextTaskEntity = nextTaskEntity;
        }
        get taskChannelName() {
            return this._taskChannelName;
        }
        set taskChannelName(taskChannelName) {
            this._taskChannelName = taskChannelName;
        }
        get eventChannelName() {
            return this._eventChannelName;
        }
        get participantId() {
            return this._participantId;
        }
        start(context, token) {
            return __awaiter(this, void 0, void 0, function* () {
                const msg = this.messageBusService.createDataMessage({
                    action: 'start',
                    key: this.processKey,
                    token
                }, context, {
                    participantId: this.participantId
                });
                this.messageBusService.publish('/processengine', msg);
                const participantChannelName = '/participant/' + this.participantId;
                this._participantSubscription = yield this.messageBusService.subscribe(participantChannelName, (message) => __awaiter(this, void 0, void 0, function* () {
                    if (!this.processable) {
                        throw new Error('no processable defined to handle activities!');
                    }
                    else if (message && message.data && message.data.action) {
                        const setNewTask = (taskMessageData) => __awaiter(this, void 0, void 0, function* () {
                            this.nextTaskDef = taskMessageData.userTaskEntity.nodeDef;
                            this.nextTaskEntity = taskMessageData.userTaskEntity;
                            this.taskChannelName = '/processengine/node/' + this.nextTaskEntity.id;
                            this._eventChannelName = '/processengine_api/event/' + this.nextTaskEntity.id;
                            this._eventSubscription = yield this.messageBusService.subscribe(this.eventChannelName, (message) => __awaiter(this, void 0, void 0, function* () {
                                switch (message.data.action) {
                                    case 'event':
                                        const eventType = message.data.eventType;
                                        const eventData = message.data.data || {};
                                        switch (eventType) {
                                            case 'cancel':
                                                yield this.stop();
                                                yield this.processable.handleCancel(this);
                                                break;
                                            default:
                                                yield this.processable.handleEvent(this, eventType, eventData);
                                                break;
                                        }
                                }
                            }));
                        });
                        switch (message.data.action) {
                            case 'userTask':
                                const userTaskMessageData = message.data.data;
                                setNewTask(userTaskMessageData);
                                const uiName = message.data.data.uiName;
                                const uiConfig = message.data.data.uiConfig;
                                this._tokenData = message.data.data.uiData || {};
                                this.processable.handleUserTask(this, uiName, uiConfig, this._tokenData);
                                break;
                            case 'manualTask':
                                const manualTaskMessageData = message.data.data;
                                setNewTask(manualTaskMessageData);
                                const taskName = message.data.data.uiName;
                                const taskConfig = message.data.data.uiConfig;
                                this._tokenData = message.data.data.uiData || {};
                                this.processable.handleManualTask(this, taskName, taskConfig, this._tokenData);
                                break;
                            case 'endEvent':
                                this._tokenData = message.data.data || {};
                                yield this.processable.handleEndEvent(this, this._tokenData);
                                yield this.stop();
                                break;
                        }
                    }
                }));
                return this;
            });
        }
        stop() {
            return __awaiter(this, void 0, void 0, function* () {
                this.nextTaskDef = null;
                this.nextTaskEntity = null;
                this.taskChannelName = null;
                this._tokenData = null;
                yield this._participantSubscription.cancel();
                return;
            });
        }
        restart(context, token) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.stop();
                yield this.start(context, token);
                return;
            });
        }
        doCancel(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const msg = this.messageBusService.createDataMessage({
                    action: 'event',
                    eventType: 'cancel',
                    data: this._tokenData
                }, context, {
                    participantId: this.participantId
                });
                yield this.messageBusService.publish(this.taskChannelName, msg);
                return;
            });
        }
        doEvent(context, eventData) {
            return __awaiter(this, void 0, void 0, function* () {
                const msg = this.messageBusService.createDataMessage({
                    action: 'event',
                    eventType: 'data',
                    data: eventData
                }, context, {
                    participantId: this.participantId
                });
                yield this.messageBusService.publish(this.taskChannelName, msg);
                return;
            });
        }
        doError(context, error) {
            return __awaiter(this, void 0, void 0, function* () {
                const msg = this.messageBusService.createDataMessage({
                    action: 'event',
                    eventType: 'error',
                    data: error
                }, context, {
                    participantId: this.participantId
                });
                yield this.messageBusService.publish(this.taskChannelName, msg);
                return;
            });
        }
        doProceed(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const msg = this.messageBusService.createDataMessage({
                    action: 'proceed',
                    token: this._tokenData
                }, context, {
                    participantId: this.participantId
                });
                yield this.messageBusService.publish(this.taskChannelName, msg);
                return;
            });
        }
    }
    exports.ProcessInstance = ProcessInstance;
});

//# sourceMappingURL=process_instance.js.map
