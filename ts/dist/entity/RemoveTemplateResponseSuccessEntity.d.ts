import { ResendEntityBase } from '../ResendEntityBase';
import type { ResendSDK } from '../ResendSDK';
import type { Control } from '../types';
import type { RemoveTemplateResponseSuccess, RemoveTemplateResponseSuccessCreateData, RemoveTemplateResponseSuccessRemoveMatch } from '../ResendTypes';
declare class RemoveTemplateResponseSuccessEntity extends ResendEntityBase<RemoveTemplateResponseSuccess> {
    constructor(client: ResendSDK, entopts: any);
    make(this: RemoveTemplateResponseSuccessEntity): RemoveTemplateResponseSuccessEntity;
    create(this: any, reqdata?: RemoveTemplateResponseSuccessCreateData, ctrl?: Control): Promise<RemoveTemplateResponseSuccessEntity>;
    remove(this: any, reqmatch?: RemoveTemplateResponseSuccessRemoveMatch, ctrl?: Control): Promise<RemoveTemplateResponseSuccessEntity>;
}
export { RemoveTemplateResponseSuccessEntity };
