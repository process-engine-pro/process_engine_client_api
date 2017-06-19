"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProcessInstance {
    constructor(processKey, messageBusService, processable) {
        this._messageBusService = undefined;
        this._processKey = undefined;
        this._processable = undefined;
        this._participantSubscription = undefined;
        this._messageBusService = messageBusService;
        this._processKey = processKey;
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
    async start(context) {
        const msg = this.messageBusService.createDataMessage({
            action: 'start',
            key: this.processKey
        }, context);
        this.messageBusService.publish('/processengine', msg);
        const participantChannelName = '/participant/' + msg.metadata.applicationId;
        this._participantSubscription = await this.messageBusService.subscribe(participantChannelName, async (message) => {
            if (message && message.data && message.data.action) {
                switch (message.data.action) {
                    case 'userTask':
                        this.processable.handleUserTask(message);
                        break;
                    case 'manualTask':
                        this.processable.handleManualTask(message);
                        break;
                    case 'endEvent':
                        this._participantSubscription.cancel();
                        await this.processable.handleEndEvent(message);
                        break;
                }
            }
        });
        return this;
    }
    async stop() {
        await this._participantSubscription.cancel();
        return true;
    }
    async restart(context) {
        await this.stop();
        await this.start(context);
        return true;
    }
}
exports.ProcessInstance = ProcessInstance;

//# sourceMappingURL=process_instance.js.map
