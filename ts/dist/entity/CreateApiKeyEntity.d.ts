import { ResendEntityBase } from '../ResendEntityBase';
import type { ResendSDK } from '../ResendSDK';
import type { Control } from '../types';
import type { CreateApiKey, CreateApiKeyCreateData } from '../ResendTypes';
declare class CreateApiKeyEntity extends ResendEntityBase<CreateApiKey> {
    constructor(client: ResendSDK, entopts: any);
    make(this: CreateApiKeyEntity): CreateApiKeyEntity;
    create(this: any, reqdata?: CreateApiKeyCreateData, ctrl?: Control): Promise<CreateApiKeyEntity>;
}
export { CreateApiKeyEntity };
