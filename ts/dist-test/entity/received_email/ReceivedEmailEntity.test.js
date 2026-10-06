"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const Fs = __importStar(require("node:fs"));
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const live_runner_1 = require("../../live-runner");
const live_entity_1 = require("../../live-entity");
const __1 = require("../../..");
const utility_1 = require("../../utility");
(0, utility_1.loadEnvLocal)(__dirname + '/../../../.env.local');
(0, node_test_1.describe)('ReceivedEmailEntity', async () => {
    // Per-test live pacing. Delay is read from sdk-test-control.json's
    // `test.live.delayMs`; only sleeps when RESEND_TEST_LIVE=TRUE.
    (0, node_test_1.afterEach)((0, utility_1.liveDelay)('RESEND_TEST_LIVE'));
    (0, node_test_1.test)('instance', async () => {
        const testsdk = __1.ResendSDK.test();
        const ent = testsdk.ReceivedEmail();
        (0, node_assert_1.default)(null != ent);
    });
    class FailHook extends __1.BaseFeature {
        name = 'failhook';
        version = '0.0.1';
        active = true;
        unexpected = 0;
        init() { }
        PreSpec() { throw new Error('received_email hook failed'); }
        PreUnexpected() { this.unexpected++; }
    }
    (0, node_test_1.test)('stream-error', async () => {
        const offline = { net: { offline: true } };
        await node_assert_1.default.rejects(async () => {
            for await (const _item of __1.ResendSDK.test(offline).ReceivedEmail().stream('list')) { }
        }, /offline/);
        for await (const _item of __1.ResendSDK.test(offline).ReceivedEmail()
            .stream('list', undefined, { ctrl: { throw: false } })) { }
        if (null != __1.config.feature?.rbac) {
            const denied = __1.ResendSDK.test(undefined, { feature: { rbac: { active: true, deny: true } } });
            await node_assert_1.default.rejects(async () => {
                for await (const _item of denied.ReceivedEmail().stream('list')) { }
            }, (err) => 'rbac_denied' === err.code);
        }
    });
    (0, node_test_1.test)('stream-ctrl', async () => {
        const explain = {};
        const ctrl = { explain };
        for await (const _item of __1.ResendSDK.test().ReceivedEmail().stream('list', undefined, { ctrl })) { }
        node_assert_1.default.deepStrictEqual(Object.keys(ctrl), ['explain']);
        (0, node_assert_1.default)(explain === ctrl.explain && 0 < Object.keys(explain).length);
    });
    (0, node_test_1.test)('unexpected', async () => {
        const hook = new FailHook();
        const client = new __1.ResendSDK({ feature: { test: { active: true } }, extend: [hook] });
        await node_assert_1.default.rejects(client.ReceivedEmail().list(), /hook failed/);
        (0, node_assert_1.default)(0 < hook.unexpected);
        const fired = hook.unexpected;
        node_assert_1.default.strictEqual(await client.ReceivedEmail().list(undefined, { throw: false }), undefined);
        (0, node_assert_1.default)(fired < hook.unexpected);
    });
    (0, node_test_1.test)('validate', async (t) => {
        if (null == __1.config.feature?.validate) {
            t.skip('feature not present in this SDK: validate');
            return;
        }
        const client = __1.ResendSDK.test(undefined, { feature: { validate: { active: true } } });
        await node_assert_1.default.rejects(client.ReceivedEmail().list({ "after": 1 }), (err) => 'validate_failed' === err.code);
    });
    (0, node_test_1.test)('basic', async (t) => {
        const live = 'TRUE' === process.env.RESEND_TEST_LIVE;
        for (const op of ['list']) {
            if (!live && (0, utility_1.maybeSkipControl)(t, 'entityOp', 'received_email.' + op, live))
                return;
        }
        const setup = basicSetup();
        if (setup.live) {
            return (0, live_entity_1.runLiveEntity)(setup, { "active": true, "alias": { "field": {} }, "fields": { "attachments": { "a": true, "h": "Attachments", "n": "attachments", "r": false, "sh": "Array of attachments.", "t": "`$ARRAY`", "key$": "attachments", "index$": 0 }, "bcc": { "a": true, "h": "Bcc", "n": "bcc", "r": false, "sh": "The BCC recipients.", "t": ["`$ONE`", ["`$ARRAY`", "`$NULL`"]], "key$": "bcc", "index$": 1 }, "cc": { "a": true, "h": "Cc", "n": "cc", "r": false, "sh": "The CC recipients.", "t": ["`$ONE`", ["`$ARRAY`", "`$NULL`"]], "key$": "cc", "index$": 2 }, "created_at": { "a": true, "fo": "date-time", "h": "Created At", "n": "created_at", "r": false, "sh": "Timestamp when the email was received.", "t": "`$STRING`", "key$": "created_at", "index$": 3 }, "from": { "a": true, "h": "From", "n": "from", "r": false, "sh": "The sender email address.", "t": "`$STRING`", "key$": "from", "index$": 4 }, "headers": { "a": true, "h": "Headers", "n": "headers", "r": false, "sh": "The email headers.", "t": ["`$ONE`", ["`$OBJECT`", "`$NULL`"]], "key$": "headers", "index$": 5 }, "html": { "a": true, "h": "Html", "n": "html", "r": false, "sh": "The HTML content of the email.", "t": ["`$ONE`", ["`$STRING`", "`$NULL`"]], "key$": "html", "index$": 6 }, "id": { "a": true, "fo": "uuid", "h": "Id", "n": "id", "r": false, "sh": "The ID of the received email.", "t": "`$STRING`", "key$": "id", "index$": 7 }, "message_id": { "a": true, "h": "Message Id", "n": "message_id", "r": false, "sh": "The unique message ID from the email headers.", "t": "`$STRING`", "key$": "message_id", "index$": 8 }, "object": { "a": true, "h": "Object", "n": "object", "r": false, "sh": "The type of object.", "t": "`$STRING`", "key$": "object", "index$": 9 }, "received_for": { "a": true, "h": "Received For", "n": "received_for", "r": false, "sh": "The recipient addresses the email was forwarded for, taken from the `for` clause of the message's `Received` headers.", "t": "`$ARRAY`", "key$": "received_for", "index$": 10 }, "reply_to": { "a": true, "h": "Reply To", "n": "reply_to", "r": false, "sh": "The reply-to addresses.", "t": ["`$ONE`", ["`$ARRAY`", "`$NULL`"]], "key$": "reply_to", "index$": 11 }, "subject": { "a": true, "h": "Subject", "n": "subject", "r": false, "sh": "The email subject.", "t": "`$STRING`", "key$": "subject", "index$": 12 }, "text": { "a": true, "h": "Text", "n": "text", "r": false, "sh": "The plain text content of the email.", "t": ["`$ONE`", ["`$STRING`", "`$NULL`"]], "key$": "text", "index$": 13 }, "to": { "a": true, "h": "To", "n": "to", "r": false, "sh": "The recipient email addresses.", "t": "`$ARRAY`", "key$": "to", "index$": 14 } }, "id": { "field": "id", "name": "id" }, "name": "received_email", "op": { "list": { "input": "data", "name": "list", "points": [{ "a": true, "co": { "id": "GET /emails/receiving", "source": "openapi3", "version": 2 }, "g": { "query": [{ "a": true, "k": "query", "n": "after", "or": "after", "r": false, "t": "`$STRING`", "index$": 0 }, { "a": true, "k": "query", "n": "before", "or": "before", "r": false, "t": "`$STRING`", "index$": 1 }, { "a": true, "k": "query", "n": "limit", "or": "limit", "r": false, "t": "`$INTEGER`", "index$": 2 }] }, "k": "http", "m": "GET", "o": "/emails/receiving", "q": {}, "r": {}, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "emails" }, { "lit": "receiving" }], "t": { "req": "`reqdata`", "res": "`body.data`" }, "index$": 0 }], "key$": "list" }, "load": { "input": "data", "name": "load", "points": [{ "a": true, "co": { "id": "GET /emails/receiving/{email_id}", "source": "openapi3", "version": 2 }, "g": { "params": [{ "a": true, "k": "param", "n": "email_id", "or": "email_id", "r": true, "t": "`$STRING`", "index$": 0 }] }, "k": "http", "m": "GET", "o": "/emails/receiving/{email_id}", "q": { "exist": ["email_id"] }, "r": {}, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "emails" }, { "lit": "receiving" }, { "var": "email_id" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }], "key$": "load" } }, "relations": { "ancestors": [] }, "key$": "received_email", "name__orig": "received_email", "Name": "ReceivedEmail", "name_": "received_email", "name-": "received-email", "NAME": "RECEIVED_EMAIL", "index$": 30 }, { "active": true, "entity": "received_email", "key$": "BasicReceivedEmailFlow", "kind": "basic", "name": "BasicReceivedEmailFlow", "param": {}, "step": [{ "a": true, "d": {}, "i": {}, "m": {}, "o": "list", "s": [], "v": [{ "apply": "ItemExists", "def": { "ref": "received_email_ref01" } }], "index$": 0 }, { "a": false, "d": {}, "i": { "ref": "received_email_ref01", "srcdatavar": "received_email_ref01_data", "suffix": "_dt0" }, "m": { "id": "received_email01" }, "o": "load", "s": [], "v": [{ "apply": "TextFieldMark", "def": { "mark": "Mark01-received_email_ref01" } }], "unreachable": true }] }, 'ReceivedEmail', { "GET /emails/receiving": { "protocol": "http", "parameters": [{ "name": "limit", "in": "query", "required": false, "schema": { "type": "integer" }, "description": "Maximum number of received emails to return.", "index$": 0 }, { "name": "after", "in": "query", "required": false, "schema": { "type": "string", "format": "uuid" }, "description": "Pagination cursor to fetch results after this email ID. Cannot be used with 'before'.", "index$": 1 }, { "name": "before", "in": "query", "required": false, "schema": { "type": "string", "format": "uuid" }, "description": "Pagination cursor to fetch results before this email ID. Cannot be used with 'after'.", "index$": 2 }] }, "GET /emails/receiving/{email_id}": { "protocol": "http", "parameters": [{ "name": "email_id", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" }, "description": "The ID of the received email.", "index$": 0 }] } }, { strict: LIVE_STRICT, t });
        }
        const client = setup.client;
        const struct = setup.struct;
        const isempty = struct.isempty;
        const select = struct.select;
        let received_email_ref01_data = Object.values(setup.data.existing.received_email)[0];
        // LIST
        const received_email_ref01_ent = client.ReceivedEmail();
        const received_email_ref01_match = {};
        const received_email_ref01_list = (await received_email_ref01_ent.list(received_email_ref01_match)).map((e) => e.data());
    });
});
// main.kit.test.live.strict is true (the default is true): a live
// request that fails, or a live test missing an input it needs,
// fails the test.
// An account with no record for a test to read skips it either way.
const LIVE_STRICT = true;
function basicSetup(extra) {
    // TODO: fix test def options
    const options = {}; // null
    // TODO: needs test utility to resolve path
    const entityDataFile = node_path_1.default.resolve(__dirname, '../../../../.sdk/test/entity/received_email/ReceivedEmailTestData.json');
    // TODO: file ready util needed?
    const entityDataSource = Fs.readFileSync(entityDataFile).toString('utf8');
    // TODO: need a xlang JSON parse utility in voxgig/struct with better error msgs
    const entityData = JSON.parse(entityDataSource);
    options.entity = entityData.existing;
    let client = __1.ResendSDK.test(options, extra);
    const struct = client.utility().struct;
    const merge = struct.merge;
    const transform = struct.transform;
    let idmap = transform(['received_email01', 'received_email02', 'received_email03'], {
        '`$PACK`': ['', {
                '`$KEY`': '`$COPY`',
                '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
            }]
    });
    const env = (0, utility_1.envOverride)({
        'RESEND_TEST_RECEIVED_EMAIL_ENTID': idmap,
        'RESEND_TEST_LIVE': 'FALSE',
        'RESEND_TEST_EXPLAIN': 'FALSE',
        'RESEND_APIKEY': '',
    });
    idmap = env['RESEND_TEST_RECEIVED_EMAIL_ENTID'];
    const live = 'TRUE' === env.RESEND_TEST_LIVE;
    const transport = (0, live_runner_1.createLiveTransport)();
    if (live) {
        const rawIds = process.env['RESEND_TEST_RECEIVED_EMAIL_ENTID'];
        idmap = rawIds && rawIds.trim() ? JSON.parse(rawIds) : {};
        if (!idmap || Array.isArray(idmap) || typeof idmap !== 'object') {
            throw new Error('Live ENTID must be a JSON object');
        }
        client = new __1.ResendSDK(merge([
            // FIRST, so the generated fields below win: sdk-test-control.json's
            // test.client.options adds to the live client, it does not redirect it.
            (0, utility_1.liveClientOptions)(),
            {
                apikey: env.RESEND_APIKEY,
            },
            // 'extra || {}', not a bare 'extra': struct.merge returns UNDEFINED when the
            // last entry is undefined, and basicSetup is normally called with no
            // argument at all - so a bare 'extra' silently discarded the apikey
            // and server values above and handed the SDK undefined. Harmless
            // while there was nothing in that object; not harmless now.
            extra || {},
            { system: { fetch: transport.fetch } }
        ]));
    }
    const setup = {
        idmap,
        env,
        options,
        client,
        struct,
        data: entityData,
        explain: 'TRUE' === env.RESEND_TEST_EXPLAIN,
        live,
        transport,
        now: Date.now(),
    };
    return setup;
}
//# sourceMappingURL=ReceivedEmailEntity.test.js.map