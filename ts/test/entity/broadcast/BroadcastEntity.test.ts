

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


describe('BroadcastEntity', async () => {

  // Per-test live pacing. Delay is read from sdk-test-control.json's
  // `test.live.delayMs`; only sleeps when RESEND_TEST_LIVE=TRUE.
  afterEach(liveDelay('RESEND_TEST_LIVE'))

  test('instance', async () => {
    const testsdk = ResendSDK.test()
    const ent = testsdk.Broadcast()
    assert(null != ent)
  })


  class FailHook extends BaseFeature {
    name = 'failhook'
    version = '0.0.1'
    active = true
    unexpected = 0
    init() { }
    PreSpec() { throw new Error('broadcast hook failed') }
    PreUnexpected() { this.unexpected++ }
  }

  test('stream-error', async () => {
    const offline = { net: { offline: true } }
    await assert.rejects(async () => {
      for await (const _item of ResendSDK.test(offline).Broadcast().stream('list')) { }
    }, /offline/)

    for await (const _item of ResendSDK.test(offline).Broadcast()
      .stream('list', undefined, { ctrl: { throw: false } })) { }

    if (null != (config as any).feature?.rbac) {
      const denied = ResendSDK.test(undefined, { feature: { rbac: { active: true, deny: true } } })
      await assert.rejects(async () => {
        for await (const _item of denied.Broadcast().stream('list')) { }
      }, (err: any) => 'rbac_denied' === err.code)
    }
  })

  test('stream-ctrl', async () => {
    const explain: any = {}
    const ctrl: any = { explain }
    for await (const _item of ResendSDK.test().Broadcast().stream('list', undefined, { ctrl })) { }
    assert.deepStrictEqual(Object.keys(ctrl), ['explain'])
    assert(explain === ctrl.explain && 0 < Object.keys(explain).length)
  })

  test('unexpected', async () => {
    const hook = new FailHook()
    const client = new ResendSDK({ feature: { test: { active: true } }, extend: [hook] })
    await assert.rejects(client.Broadcast().list(), /hook failed/)
    assert(0 < hook.unexpected)

    const fired = hook.unexpected
    assert.strictEqual(await client.Broadcast().list(undefined, { throw: false }), undefined)
    assert(fired < hook.unexpected)
  })

  test('validate', async (t) => {
    if (null == (config as any).feature?.validate) {
      t.skip('feature not present in this SDK: validate')
      return
    }
    const client = ResendSDK.test(undefined, { feature: { validate: { active: true } } })
    await assert.rejects(client.Broadcast().list({"after":1} as any),
      (err: any) => 'validate_failed' === err.code)
  })



  test('basic', async (t) => {

    const live = 'TRUE' === process.env.RESEND_TEST_LIVE
    for (const op of ['list', 'load']) {
      if (!live && maybeSkipControl(t, 'entityOp', 'broadcast.' + op, live)) return
    }

    
    const setup = basicSetup()
    if (setup.live) {
      return runLiveEntity(setup, {"active":true,"alias":{"field":{}},"fields":{"audience_id":{"a":true,"de":true,"h":"Audience Id","n":"audience_id","r":false,"sh":"Deprecated: use `segment_id` instead.","t":["`$ONE`",["`$STRING`","`$NULL`"]],"key$":"audience_id","index$":0},"created_at":{"a":true,"h":"Created At","n":"created_at","r":false,"sh":"Timestamp indicating when the broadcast was created.","t":"`$STRING`","key$":"created_at","index$":1},"from":{"a":true,"h":"From","n":"from","r":false,"sh":"The email address of the sender.","t":"`$STRING`","key$":"from","index$":2},"html":{"a":true,"h":"Html","n":"html","r":false,"sh":"The HTML version of the broadcast content.","t":["`$ONE`",["`$STRING`","`$NULL`"]],"key$":"html","index$":3},"id":{"a":true,"h":"Id","n":"id","r":false,"sh":"Unique identifier for the broadcast.","t":"`$STRING`","key$":"id","index$":4},"name":{"a":true,"h":"Name","n":"name","r":false,"sh":"Name of the broadcast.","t":"`$STRING`","key$":"name","index$":5},"preview_text":{"a":true,"h":"Preview Text","n":"preview_text","r":false,"sh":"The preview text of the email.","t":"`$STRING`","key$":"preview_text","index$":6},"reply_to":{"a":true,"h":"Reply To","n":"reply_to","r":false,"sh":"The email addresses to which replies should be sent.","t":"`$ARRAY`","key$":"reply_to","index$":7},"scheduled_at":{"a":true,"h":"Scheduled At","n":"scheduled_at","r":false,"sh":"Timestamp indicating when the broadcast is scheduled to be sent.","t":"`$STRING`","key$":"scheduled_at","index$":8},"segment_id":{"a":true,"h":"Segment Id","n":"segment_id","r":false,"sh":"Unique identifier of the segment this broadcast will be sent to.","t":["`$ONE`",["`$STRING`","`$NULL`"]],"key$":"segment_id","index$":9},"sent_at":{"a":true,"h":"Sent At","n":"sent_at","r":false,"sh":"Timestamp indicating when the broadcast was sent.","t":"`$STRING`","key$":"sent_at","index$":10},"status":{"a":true,"h":"Status","n":"status","r":false,"sh":"The status of the broadcast.","t":"`$STRING`","key$":"status","index$":11},"subject":{"a":true,"h":"Subject","n":"subject","r":false,"sh":"The subject line of the email.","t":"`$STRING`","key$":"subject","index$":12},"text":{"a":true,"h":"Text","n":"text","r":false,"sh":"The plain text version of the broadcast content.","t":["`$ONE`",["`$STRING`","`$NULL`"]],"key$":"text","index$":13},"topic_id":{"a":true,"h":"Topic Id","n":"topic_id","r":false,"sh":"The topic ID that the broadcast is scoped to.","t":["`$ONE`",["`$STRING`","`$NULL`"]],"key$":"topic_id","index$":14}},"id":{"field":"id","name":"id"},"name":"broadcast","op":{"create":{"input":"data","name":"create","points":[{"a":true,"co":{"id":"POST /broadcasts/{id}/cancel","source":"openapi3","version":2},"g":{"params":[{"a":true,"k":"param","n":"id","or":"id","r":true,"t":"`$STRING`","index$":0}]},"k":"http","m":"POST","o":"/broadcasts/{id}/cancel","q":{"$action":"cancel","exist":["id"]},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"broadcasts"},{"var":"id"},{"lit":"cancel"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":0},{"a":true,"co":{"id":"POST /broadcasts/{id}/duplicate","source":"openapi3","version":2},"g":{"params":[{"a":true,"k":"param","n":"id","or":"id","r":true,"t":"`$STRING`","index$":0}]},"k":"http","m":"POST","o":"/broadcasts/{id}/duplicate","q":{"$action":"duplicate","exist":["id"]},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"broadcasts"},{"var":"id"},{"lit":"duplicate"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":1},{"a":true,"co":{"id":"POST /broadcasts/{id}/send","source":"openapi3","version":2},"g":{"params":[{"a":true,"k":"param","n":"id","or":"id","r":true,"t":"`$STRING`","index$":0}]},"k":"http","m":"POST","o":"/broadcasts/{id}/send","q":{"$action":"send","exist":["id"]},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"broadcasts"},{"var":"id"},{"lit":"send"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":2}],"key$":"create"},"list":{"input":"data","name":"list","points":[{"a":true,"co":{"id":"GET /broadcasts","source":"openapi3","version":2},"g":{"query":[{"a":true,"k":"query","n":"after","or":"after","r":false,"t":"`$STRING`","index$":0},{"a":true,"k":"query","n":"before","or":"before","r":false,"t":"`$STRING`","index$":1},{"a":true,"k":"query","n":"limit","or":"limit","r":false,"t":"`$INTEGER`","index$":2}]},"k":"http","m":"GET","o":"/broadcasts","q":{},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"broadcasts"}],"t":{"req":"`reqdata`","res":"`body.data`"},"index$":0}],"key$":"list"},"load":{"input":"data","name":"load","points":[{"a":true,"co":{"id":"GET /broadcasts/{id}","source":"openapi3","version":2},"g":{"params":[{"a":true,"k":"param","n":"id","or":"id","r":true,"t":"`$STRING`","index$":0}]},"k":"http","m":"GET","o":"/broadcasts/{id}","q":{"exist":["id"]},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"broadcasts"},{"var":"id"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":0}],"key$":"load"}},"relations":{"ancestors":[]},"key$":"broadcast","name__orig":"broadcast","Name":"Broadcast","name_":"broadcast","name-":"broadcast","NAME":"BROADCAST","index$":8}, {"active":true,"entity":"broadcast","key$":"BasicBroadcastFlow","kind":"basic","name":"BasicBroadcastFlow","param":{},"step":[{"a":false,"d":{},"i":{"ref":"broadcast_ref01"},"m":{},"o":"create","s":[],"v":[],"unreachable":true},{"a":true,"d":{},"i":{},"m":{},"o":"list","s":[],"v":[{"apply":"ItemExists","def":{"ref":"broadcast_ref01"}}],"index$":0},{"a":true,"d":{},"i":{"ref":"broadcast_ref01","srcdatavar":"broadcast_ref01_data","suffix":"_dt0"},"m":{"id":"broadcast01"},"o":"load","s":[],"v":[{"apply":"TextFieldMark","def":{"mark":"Mark01-broadcast_ref01"}}],"index$":1}]}, 'Broadcast', {"POST /broadcasts/{id}/cancel":{"protocol":"http","parameters":[{"name":"id","in":"path","required":true,"schema":{"type":"string","format":"uuid"},"description":"The Broadcast ID.","index$":0}]},"POST /broadcasts/{id}/duplicate":{"protocol":"http","parameters":[{"name":"id","in":"path","required":true,"schema":{"type":"string","format":"uuid"},"description":"The Broadcast ID.","index$":0}]},"POST /broadcasts/{id}/send":{"protocol":"http","requestBody":{"content":{"application/json":{"schema":{"type":"object","properties":{"scheduled_at":{"type":"string","description":"Schedule email to be sent later. The date should be in ISO 8601 format."}},"x-ref":"#/components/schemas/SendBroadcastOptions"}}}},"parameters":[{"name":"id","in":"path","required":true,"schema":{"type":"string"},"description":"The Broadcast ID.","index$":0}]},"GET /broadcasts":{"protocol":"http","parameters":[{"in":"query","name":"limit","required":false,"schema":{"type":"integer","minimum":1,"maximum":100},"description":"Number of items to return.","x-ref":"#/components/parameters/PaginationLimit","index$":0},{"in":"query","name":"after","required":false,"schema":{"type":"string"},"description":"Return items after this cursor.","x-ref":"#/components/parameters/PaginationAfter","index$":1},{"in":"query","name":"before","required":false,"schema":{"type":"string"},"description":"Return items before this cursor.","x-ref":"#/components/parameters/PaginationBefore","index$":2}]},"GET /broadcasts/{id}":{"protocol":"http","parameters":[{"name":"id","in":"path","required":true,"schema":{"type":"string"},"description":"The Broadcast ID.","index$":0}]}}, { strict: LIVE_STRICT, t })
    }
    const client = setup.client
    const struct = setup.struct

    const isempty = struct.isempty
    const select = struct.select

    let broadcast_ref01_data = Object.values(setup.data.existing.broadcast)[0] as any

    // LIST
    const broadcast_ref01_ent = client.Broadcast()
    const broadcast_ref01_match: any = {}

    const broadcast_ref01_list = (await broadcast_ref01_ent.list(broadcast_ref01_match)).map((e: any) => e.data())


    // LOAD
    const broadcast_ref01_match_dt0: any = {}
    broadcast_ref01_match_dt0.id = broadcast_ref01_data.id
    const broadcast_ref01_data_dt0 = (await broadcast_ref01_ent.load(broadcast_ref01_match_dt0)).data()
    assert(broadcast_ref01_data_dt0.id === broadcast_ref01_data.id)


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
      '../../../../.sdk/test/entity/broadcast/BroadcastTestData.json')

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
    ['broadcast01','broadcast02','broadcast03'],
    {
      '`$PACK`': ['', {
        '`$KEY`': '`$COPY`',
        '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
      }]
    })

  const env = envOverride({
    'RESEND_TEST_BROADCAST_ENTID': idmap,
    'RESEND_TEST_LIVE': 'FALSE',
    'RESEND_TEST_EXPLAIN': 'FALSE',
    'RESEND_APIKEY': '',
  })

  idmap = env['RESEND_TEST_BROADCAST_ENTID']

  const live = 'TRUE' === env.RESEND_TEST_LIVE

  const transport = createLiveTransport()
  if (live) {
    const rawIds = process.env['RESEND_TEST_BROADCAST_ENTID']
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
  
