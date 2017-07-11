"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid");
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
        this._participantId = undefined;
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
    get participantId() {
        return this._participantId;
    }
    async start(token, context) {
        // Build message for starting a process
        const msg = this.messageBusService.createDataMessage({
            action: 'start',
            key: this.processKey,
            token
        }, context, {
            participantId: this.participantId
        });
        this.messageBusService.publish('/processengine', msg);
        const participantChannelName = '/participant/' + this.participantId;
        // const participantChannelName = '/participant/' + msg.metadata.applicationId;
        // subscribe to channel and forward to processable implementation in order to handle UserTasks/ManualTasks/EndEvents
        this._participantSubscription = await this.messageBusService.subscribe(participantChannelName, async (message) => {
            if (!this.processable) {
                throw new Error('no processable defined to handle activities!');
            }
            else if (message && message.data && message.data.action) {
                const setNewTask = (incomingTaskMessage) => {
                    this.nextTaskDef = incomingTaskMessage.data.data.nodeDef;
                    this.nextTaskEntity = incomingTaskMessage.data.data;
                    this.taskChannelName = '/processengine/node/' + this.nextTaskEntity.id;
                };
                switch (message.data.action) {
                    case 'userTask':
                        setNewTask(message);
                        this.processable.handleUserTask(this.processKey, message);
                        break;
                    case 'manualTask':
                        setNewTask(message);
                        this.processable.handleManualTask(this.processKey, message);
                        break;
                    case 'endEvent':
                        await this.processable.handleEndEvent(this.processKey, message);
                        await this.stop();
                        break;
                }
            }
        });
        return this;
    }
    async stop() {
        this.nextTaskDef = null;
        this.nextTaskEntity = null;
        this.taskChannelName = null;
        await this._participantSubscription.cancel();
        return;
    }
    async restart(context) {
        await this.stop();
        await this.start(context);
        return;
    }
    async doCancel(context) {
        const msg = this.messageBusService.createDataMessage({
            action: 'cancel'
        }, context, {
            participantId: this.participantId
        });
        await this.messageBusService.publish(this.taskChannelName, msg);
        return;
    }
    async doProceed(context, tokenData) {
        const msg = this.messageBusService.createDataMessage({
            action: 'proceed',
            token: tokenData
        }, context, {
            participantId: this.participantId
        });
        await this.messageBusService.publish(this.taskChannelName, msg);
        return;
    }
}
exports.ProcessInstance = ProcessInstance;

//# sourceMappingURL=process_instance.js.map
