

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


describe('CreateBroadcastResponseSuccessEntity', async () => {

  // Per-test live pacing. Delay is read from sdk-test-control.json's
  // `test.live.delayMs`; only sleeps when RESEND_TEST_LIVE=TRUE.
  afterEach(liveDelay('RESEND_TEST_LIVE'))

  test('instance', async () => {
    const testsdk = ResendSDK.test()
    const ent = testsdk.CreateBroadcastResponseSuccess()
    assert(null != ent)
  })


  test('validate', async (t) => {
    if (null == (config as any).feature?.validate) {
      t.skip('feature not present in this SDK: validate')
      return
    }
    const client = ResendSDK.test(undefined, { feature: { validate: { active: true } } })
    await assert.rejects(client.CreateBroadcastResponseSuccess().create({"audience_id":1,"from":"x","segment_id":"x","subject":"x"} as any),
      (err: any) => 'validate_failed' === err.code)
  })



  test('basic', async (t) => {

    const live = 'TRUE' === process.env.RESEND_TEST_LIVE
    for (const op of ['create']) {
      if (!live && maybeSkipControl(t, 'entityOp', 'create_broadcast_response_success.' + op, live)) return
    }

    
    const setup = basicSetup()
    if (setup.live) {
      return runLiveEntity(setup, {"active":true,"alias":{"field":{}},"fields":{"audience_id":{"a":true,"de":true,"h":"Audience Id","n":"audience_id","r":false,"sh":"Use `segment_id` instead.","t":"`$STRING`","key$":"audience_id","index$":0},"from":{"a":true,"h":"From","n":"from","r":true,"sh":"The email address of the sender.","t":"`$STRING`","key$":"from","index$":1},"html":{"a":true,"h":"Html","n":"html","r":false,"sh":"The HTML version of the message.","t":"`$STRING`","key$":"html","index$":2},"name":{"a":true,"h":"Name","n":"name","r":false,"sh":"Name of the broadcast.","t":"`$STRING`","key$":"name","index$":3},"preview_text":{"a":true,"h":"Preview Text","n":"preview_text","r":false,"sh":"The preview text of the email.","t":"`$STRING`","key$":"preview_text","index$":4},"reply_to":{"a":true,"h":"Reply To","n":"reply_to","r":false,"sh":"The email addresses to which replies should be sent.","t":"`$ARRAY`","key$":"reply_to","index$":5},"scheduled_at":{"a":true,"h":"Scheduled At","n":"scheduled_at","r":false,"sh":"Schedule time to send the broadcast.","t":"`$STRING`","key$":"scheduled_at","index$":6},"segment_id":{"a":true,"h":"Segment Id","n":"segment_id","r":true,"sh":"Unique identifier of the segment this broadcast will be sent to.","t":"`$STRING`","key$":"segment_id","index$":7},"send":{"a":true,"h":"Send","n":"send","r":false,"sh":"Whether to send the broadcast immediately or keep it as a draft.","t":"`$BOOLEAN`","key$":"send","index$":8},"subject":{"a":true,"h":"Subject","n":"subject","r":true,"sh":"The subject line of the email.","t":"`$STRING`","key$":"subject","index$":9},"text":{"a":true,"h":"Text","n":"text","r":false,"sh":"The plain text version of the message.","t":"`$STRING`","key$":"text","index$":10},"topic_id":{"a":true,"h":"Topic Id","n":"topic_id","r":false,"sh":"The topic ID that the broadcast will be scoped to.","t":"`$STRING`","key$":"topic_id","index$":11}},"name":"create_broadcast_response_success","op":{"create":{"input":"data","name":"create","points":[{"a":true,"co":{"id":"POST /broadcasts","source":"openapi3","version":2},"g":{},"k":"http","m":"POST","o":"/broadcasts","q":{},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"broadcasts"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":0}],"key$":"create"}},"relations":{"ancestors":[]},"key$":"create_broadcast_response_success","name__orig":"create_broadcast_response_success","Name":"CreateBroadcastResponseSuccess","name_":"create_broadcast_response_success","name-":"create-broadcast-response-success","NAME":"CREATE_BROADCAST_RESPONSE_SUCCESS","index$":15}, {"active":true,"entity":"create_broadcast_response_success","key$":"BasicCreateBroadcastResponseSuccessFlow","kind":"basic","name":"BasicCreateBroadcastResponseSuccessFlow","param":{},"step":[{"a":true,"d":{},"i":{"ref":"create_broadcast_response_success_ref01"},"m":{},"o":"create","s":[],"v":[],"index$":0}]}, 'CreateBroadcastResponseSuccess', {"POST /broadcasts":{"protocol":"http","requestBody":{"content":{"application/json":{"schema":{"type":"object","required":["from","subject","segment_id"],"properties":{"name":{"type":"string","description":"Name of the broadcast.","key$":"name"},"segment_id":{"type":"string","description":"Unique identifier of the segment this broadcast will be sent to.","key$":"segment_id"},"audience_id":{"type":"string","description":"Use `segment_id` instead. Unique identifier of the segment this broadcast will be sent to.","deprecated":true,"key$":"audience_id"},"from":{"type":"string","description":"The email address of the sender.","key$":"from"},"subject":{"type":"string","description":"The subject line of the email.","key$":"subject"},"reply_to":{"type":"array","items":{"type":"string"},"description":"The email addresses to which replies should be sent.","key$":"reply_to"},"preview_text":{"type":"string","description":"The preview text of the email.","example":"Here are our announcements","key$":"preview_text"},"html":{"type":"string","description":"The HTML version of the message.","key$":"html"},"text":{"type":"string","description":"The plain text version of the message.","key$":"text"},"topic_id":{"type":"string","description":"The topic ID that the broadcast will be scoped to.","key$":"topic_id"},"send":{"type":"boolean","description":"Whether to send the broadcast immediately or keep it as a draft.\n","key$":"send"},"scheduled_at":{"type":"string","description":"Schedule time to send the broadcast. Can only be used if `send` is true.\n","key$":"scheduled_at"}},"x-ref":"#/components/schemas/CreateBroadcastOptions","index$":1}}}},"parameters":[]}}, { strict: LIVE_STRICT, t })
    }
    const client = setup.client
    const struct = setup.struct

    const isempty = struct.isempty
    const select = struct.select


    // CREATE
    const create_broadcast_response_success_ref01_ent = client.CreateBroadcastResponseSuccess()
    let create_broadcast_response_success_ref01_data = setup.data.new.create_broadcast_response_success['create_broadcast_response_success_ref01']

    create_broadcast_response_success_ref01_data = (await create_broadcast_response_success_ref01_ent.create(create_broadcast_response_success_ref01_data)).data()
    assert(null != create_broadcast_response_success_ref01_data)


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
      '../../../../.sdk/test/entity/create_broadcast_response_success/CreateBroadcastResponseSuccessTestData.json')

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
    ['create_broadcast_response_success01','create_broadcast_response_success02','create_broadcast_response_success03'],
    {
      '`$PACK`': ['', {
        '`$KEY`': '`$COPY`',
        '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
      }]
    })

  const env = envOverride({
    'RESEND_TEST_CREATE_BROADCAST_RESPONSE_SUCCESS_ENTID': idmap,
    'RESEND_TEST_LIVE': 'FALSE',
    'RESEND_TEST_EXPLAIN': 'FALSE',
    'RESEND_APIKEY': '',
  })

  idmap = env['RESEND_TEST_CREATE_BROADCAST_RESPONSE_SUCCESS_ENTID']

  const live = 'TRUE' === env.RESEND_TEST_LIVE

  const transport = createLiveTransport()
  if (live) {
    const rawIds = process.env['RESEND_TEST_CREATE_BROADCAST_RESPONSE_SUCCESS_ENTID']
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
  
