var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./process_instance"], function (require, exports, process_instance_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ProcessEngineClientApi {
        constructor(messageBusService) {
            this._messageBusService = undefined;
            this.config = undefined;
            this._messageBusService = messageBusService;
        }
        get messageBusService() {
            return this._messageBusService;
        }
        startProcess(processKey, processable, context, token) {
            return __awaiter(this, void 0, void 0, function* () {
                const processInstance = new process_instance_1.ProcessInstance(processKey, this.messageBusService, processable);
                yield processInstance.start(context, token);
                return processInstance;
            });
        }
    }
    exports.ProcessEngineClientApi = ProcessEngineClientApi;
});

//# sourceMappingURL=process_engine_client_api.js.map
