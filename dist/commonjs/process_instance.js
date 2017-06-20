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
        this._context = undefined;
        this._messageBusService = messageBusService;
        this._processKey = processKey;
        this._processable = processable;
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
    async start(context) {
        this._context = context;
        const msg = this.messageBusService.createDataMessage({
            action: 'start',
            key: this.processKey
        }, this._context);
        this.messageBusService.publish('/processengine', msg);
        const participantChannelName = '/participant/' + msg.metadata.applicationId;
        this._participantSubscription = await this.messageBusService.subscribe(participantChannelName, async (message) => {
            if (!this.processable) {
                throw new Error('no processable defined to handle activities!');
            }
            else if (message && message.data && message.data.action) {
                this.nextTaskDef = message.data.data.nodeDef;
                this.nextTaskEntity = message.data.data;
                this.taskChannelName = '/processengine/node/' + this.nextTaskEntity.id;
                switch (message.data.action) {
                    case 'userTask':
                        this.processable.handleUserTask(message);
                        break;
                    case 'manualTask':
                        this.processable.handleManualTask(message);
                        break;
                    case 'endEvent':
                        await this.processable.handleEndEvent(message);
                        await this.stop();
                        break;
                }
            }
        });
        return this;
    }
    async stop() {
        await this._participantSubscription.cancel();
        return;
    }
    async restart(context) {
        await this.stop();
        await this.start(context);
        return;
    }
    async doCancel() {
        const msg = this.messageBusService.createDataMessage({
            action: 'cancel'
        }, this._context);
        await this.messageBusService.publish(this.taskChannelName, msg);
        return;
    }
    async doProceed(tokenData) {
        const msg = this.messageBusService.createDataMessage({
            action: 'proceed',
            token: tokenData
        }, this._context);
        await this.messageBusService.publish(this.taskChannelName, msg);
        return;
    }
}
exports.ProcessInstance = ProcessInstance;

//# sourceMappingURL=process_instance.js.map
