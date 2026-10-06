import { ResendEntityBase } from '../ResendEntityBase';
import type { ResendSDK } from '../ResendSDK';
import type { Control } from '../types';
import type { CreateBroadcastResponseSuccess, CreateBroadcastResponseSuccessCreateData } from '../ResendTypes';
declare class CreateBroadcastResponseSuccessEntity extends ResendEntityBase<CreateBroadcastResponseSuccess> {
    constructor(client: ResendSDK, entopts: any);
    make(this: CreateBroadcastResponseSuccessEntity): CreateBroadcastResponseSuccessEntity;
    create(this: any, reqdata?: CreateBroadcastResponseSuccessCreateData, ctrl?: Control): Promise<CreateBroadcastResponseSuccessEntity>;
}
export { CreateBroadcastResponseSuccessEntity };
