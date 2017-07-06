"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process_instance_1 = require("./process_instance");
class ProcessEngineClientApi {
    constructor(messageBusService) {
        this._messageBusService = undefined;
        this.config = undefined;
        this._messageBusService = messageBusService;
    }
    get messageBusService() {
        return this._messageBusService;
    }
    async startProcess(processKey, processable, token, context) {
        const processInstance = new process_instance_1.ProcessInstance(processKey, this.messageBusService, processable);
        await processInstance.start(token, context);
        return processInstance;
    }
}
exports.ProcessEngineClientApi = ProcessEngineClientApi;

//# sourceMappingURL=process_engine_client_api.js.map
