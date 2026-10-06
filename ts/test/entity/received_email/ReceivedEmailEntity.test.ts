

import Path from 'node:path'
import * as Fs from 'node:fs'

import { test, describe, afterEach } from 'node:test'
import assert from 'node:assert'
import { createLiveTransport } from '../../live-runner'
import { runLiveEntity } from '../../live-entity'


import { ResendSDK, BaseFeature, config, stdutil } from '../../..'

import {
  envOverride,
  liveClientOptions,
  liveDelay,
  loadEnvLocal,
  makeCtrl,
  makeMatch,
  makeReqdata,
  makeStepData,
  makeValid,
  maybeSkipControl,
} from '../../utility'


loadEnvLocal(__dirname + '/../../../.env.local')


describe('ReceivedEmailEntity', async () => {

  // Per-test live pacing. Delay is read from sdk-test-control.json's
  // `test.live.delayMs`; only sleeps when RESEND_TEST_LIVE=TRUE.
  afterEach(liveDelay('RESEND_TEST_LIVE'))

  test('instance', async () => {
    const testsdk = ResendSDK.test()
    const ent = testsdk.ReceivedEmail()
    assert(null != ent)
  })


  class FailHook extends BaseFeature {
    name = 'failhook'
    version = '0.0.1'
    active = true
    unexpected = 0
    init() { }
    PreSpec() { throw new Error('received_email hook failed') }
    PreUnexpected() { this.unexpected++ }
  }

  test('stream-error', async () => {
    const offline = { net: { offline: true } }
    await assert.rejects(async () => {
      for await (const _item of ResendSDK.test(offline).ReceivedEmail().stream('list')) { }
    }, /offline/)

    for await (const _item of ResendSDK.test(offline).ReceivedEmail()
      .stream('list', undefined, { ctrl: { throw: false } })) { }

    if (null != (config as any).feature?.rbac) {
      const denied = ResendSDK.test(undefined, { feature: { rbac: { active: true, deny: true } } })
      await assert.rejects(async () => {
        for await (const _item of denied.ReceivedEmail().stream('list')) { }
      }, (err: any) => 'rbac_denied' === err.code)
    }
  })

  test('stream-ctrl', async () => {
    const explain: any = {}
    const ctrl: any = { explain }
    for await (const _item of ResendSDK.test().ReceivedEmail().stream('list', undefined, { ctrl })) { }
    assert.deepStrictEqual(Object.keys(ctrl), ['explain'])
    assert(explain === ctrl.explain && 0 < Object.keys(explain).length)
  })

  test('unexpected', async () => {
    const hook = new FailHook()
    const client = new ResendSDK({ feature: { test: { active: true } }, extend: [hook] })
    await assert.rejects(client.ReceivedEmail().list(), /hook failed/)
    assert(0 < hook.unexpected)

    const fired = hook.unexpected
    assert.strictEqual(await client.ReceivedEmail().list(undefined, { throw: false }), undefined)
    assert(fired < hook.unexpected)
  })

  test('validate', async (t) => {
    if (null == (config as any).feature?.validate) {
      t.skip('feature not present in this SDK: validate')
      return
    }
    const client = ResendSDK.test(undefined, { feature: { validate: { active: true } } })
    await assert.rejects(client.ReceivedEmail().list({"after":1} as any),
      (err: any) => 'validate_failed' === err.code)
  })



  test('basic', async (t) => {

    const live = 'TRUE' === process.env.RESEND_TEST_LIVE
    for (const op of ['list']) {
      if (!live && maybeSkipControl(t, 'entityOp', 'received_email.' + op, live)) return
    }

    
    const setup = basicSetup()
    if (setup.live) {
      return runLiveEntity(setup, {"active":true,"alias":{"field":{}},"fields":{"attachments":{"a":true,"h":"Attachments","n":"attachments","r":false,"sh":"Array of attachments.","t":"`$ARRAY`","key$":"attachments","index$":0},"bcc":{"a":true,"h":"Bcc","n":"bcc","r":false,"sh":"The BCC recipients.","t":["`$ONE`",["`$ARRAY`","`$NULL`"]],"key$":"bcc","index$":1},"cc":{"a":true,"h":"Cc","n":"cc","r":false,"sh":"The CC recipients.","t":["`$ONE`",["`$ARRAY`","`$NULL`"]],"key$":"cc","index$":2},"created_at":{"a":true,"fo":"date-time","h":"Created At","n":"created_at","r":false,"sh":"Timestamp when the email was received.","t":"`$STRING`","key$":"created_at","index$":3},"from":{"a":true,"h":"From","n":"from","r":false,"sh":"The sender email address.","t":"`$STRING`","key$":"from","index$":4},"headers":{"a":true,"h":"Headers","n":"headers","r":false,"sh":"The email headers.","t":["`$ONE`",["`$OBJECT`","`$NULL`"]],"key$":"headers","index$":5},"html":{"a":true,"h":"Html","n":"html","r":false,"sh":"The HTML content of the email.","t":["`$ONE`",["`$STRING`","`$NULL`"]],"key$":"html","index$":6},"id":{"a":true,"fo":"uuid","h":"Id","n":"id","r":false,"sh":"The ID of the received email.","t":"`$STRING`","key$":"id","index$":7},"message_id":{"a":true,"h":"Message Id","n":"message_id","r":false,"sh":"The unique message ID from the email headers.","t":"`$STRING`","key$":"message_id","index$":8},"object":{"a":true,"h":"Object","n":"object","r":false,"sh":"The type of object.","t":"`$STRING`","key$":"object","index$":9},"received_for":{"a":true,"h":"Received For","n":"received_for","r":false,"sh":"The recipient addresses the email was forwarded for, taken from the `for` clause of the message's `Received` headers.","t":"`$ARRAY`","key$":"received_for","index$":10},"reply_to":{"a":true,"h":"Reply To","n":"reply_to","r":false,"sh":"The reply-to addresses.","t":["`$ONE`",["`$ARRAY`","`$NULL`"]],"key$":"reply_to","index$":11},"subject":{"a":true,"h":"Subject","n":"subject","r":false,"sh":"The email subject.","t":"`$STRING`","key$":"subject","index$":12},"text":{"a":true,"h":"Text","n":"text","r":false,"sh":"The plain text content of the email.","t":["`$ONE`",["`$STRING`","`$NULL`"]],"key$":"text","index$":13},"to":{"a":true,"h":"To","n":"to","r":false,"sh":"The recipient email addresses.","t":"`$ARRAY`","key$":"to","index$":14}},"id":{"field":"id","name":"id"},"name":"received_email","op":{"list":{"input":"data","name":"list","points":[{"a":true,"co":{"id":"GET /emails/receiving","source":"openapi3","version":2},"g":{"query":[{"a":true,"k":"query","n":"after","or":"after","r":false,"t":"`$STRING`","index$":0},{"a":true,"k":"query","n":"before","or":"before","r":false,"t":"`$STRING`","index$":1},{"a":true,"k":"query","n":"limit","or":"limit","r":false,"t":"`$INTEGER`","index$":2}]},"k":"http","m":"GET","o":"/emails/receiving","q":{},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"emails"},{"lit":"receiving"}],"t":{"req":"`reqdata`","res":"`body.data`"},"index$":0}],"key$":"list"},"load":{"input":"data","name":"load","points":[{"a":true,"co":{"id":"GET /emails/receiving/{email_id}","source":"openapi3","version":2},"g":{"params":[{"a":true,"k":"param","n":"email_id","or":"email_id","r":true,"t":"`$STRING`","index$":0}]},"k":"http","m":"GET","o":"/emails/receiving/{email_id}","q":{"exist":["email_id"]},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"emails"},{"lit":"receiving"},{"var":"email_id"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":0}],"key$":"load"}},"relations":{"ancestors":[]},"key$":"received_email","name__orig":"received_email","Name":"ReceivedEmail","name_":"received_email","name-":"received-email","NAME":"RECEIVED_EMAIL","index$":30}, {"active":true,"entity":"received_email","key$":"BasicReceivedEmailFlow","kind":"basic","name":"BasicReceivedEmailFlow","param":{},"step":[{"a":true,"d":{},"i":{},"m":{},"o":"list","s":[],"v":[{"apply":"ItemExists","def":{"ref":"received_email_ref01"}}],"index$":0},{"a":false,"d":{},"i":{"ref":"received_email_ref01","srcdatavar":"received_email_ref01_data","suffix":"_dt0"},"m":{"id":"received_email01"},"o":"load","s":[],"v":[{"apply":"TextFieldMark","def":{"mark":"Mark01-received_email_ref01"}}],"unreachable":true}]}, 'ReceivedEmail', {"GET /emails/receiving":{"protocol":"http","parameters":[{"name":"limit","in":"query","required":false,"schema":{"type":"integer"},"description":"Maximum number of received emails to return.","index$":0},{"name":"after","in":"query","required":false,"schema":{"type":"string","format":"uuid"},"description":"Pagination cursor to fetch results after this email ID. Cannot be used with 'before'.","index$":1},{"name":"before","in":"query","required":false,"schema":{"type":"string","format":"uuid"},"description":"Pagination cursor to fetch results before this email ID. Cannot be used with 'after'.","index$":2}]},"GET /emails/receiving/{email_id}":{"protocol":"http","parameters":[{"name":"email_id","in":"path","required":true,"schema":{"type":"string","format":"uuid"},"description":"The ID of the received email.","index$":0}]}}, { strict: LIVE_STRICT, t })
    }
    const client = setup.client
    const struct = setup.struct

    const isempty = struct.isempty
    const select = struct.select

    let received_email_ref01_data = Object.values(setup.data.existing.received_email)[0] as any

    // LIST
    const received_email_ref01_ent = client.ReceivedEmail()
    const received_email_ref01_match: any = {}

    const received_email_ref01_list = (await received_email_ref01_ent.list(received_email_ref01_match)).map((e: any) => e.data())


  })
})



// main.kit.test.live.strict is true (the default is true): a live
// request that fails, or a live test missing an input it needs,
// fails the test.
// An account with no record for a test to read skips it either way.
const LIVE_STRICT = true

function basicSetup(extra?: any) {
  // TODO: fix test def options
  const options: any = {} // null

  // TODO: needs test utility to resolve path
  const entityDataFile =
    Path.resolve(__dirname, 
      '../../../../.sdk/test/entity/received_email/ReceivedEmailTestData.json')

  // TODO: file ready util needed?
  const entityDataSource = Fs.readFileSync(entityDataFile).toString('utf8')

  // TODO: need a xlang JSON parse utility in voxgig/struct with better error msgs
  const entityData = JSON.parse(entityDataSource)

  options.entity = entityData.existing

  let client = ResendSDK.test(options, extra)
  const struct = client.utility().struct
  const merge = struct.merge
  const transform = struct.transform

  let idmap = transform(
    ['received_email01','received_email02','received_email03'],
    {
      '`$PACK`': ['', {
        '`$KEY`': '`$COPY`',
        '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
      }]
    })

  const env = envOverride({
    'RESEND_TEST_RECEIVED_EMAIL_ENTID': idmap,
    'RESEND_TEST_LIVE': 'FALSE',
    'RESEND_TEST_EXPLAIN': 'FALSE',
    'RESEND_APIKEY': '',
  })

  idmap = env['RESEND_TEST_RECEIVED_EMAIL_ENTID']

  const live = 'TRUE' === env.RESEND_TEST_LIVE

  const transport = createLiveTransport()
  if (live) {
    const rawIds = process.env['RESEND_TEST_RECEIVED_EMAIL_ENTID']
    idmap = rawIds && rawIds.trim() ? JSON.parse(rawIds) : {}
    if (!idmap || Array.isArray(idmap) || typeof idmap !== 'object') {
      throw new Error('Live ENTID must be a JSON object')
    }
    client = new ResendSDK(merge([
      // FIRST, so the generated fields below win: sdk-test-control.json's
      // test.client.options adds to the live client, it does not redirect it.
      liveClientOptions(),
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
    ]))
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
  }

  return setup
}
  
