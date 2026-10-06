

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


describe('UpdateDomainResponseSuccessEntity', async () => {

  // Per-test live pacing. Delay is read from sdk-test-control.json's
  // `test.live.delayMs`; only sleeps when RESEND_TEST_LIVE=TRUE.
  afterEach(liveDelay('RESEND_TEST_LIVE'))

  test('instance', async () => {
    const testsdk = ResendSDK.test()
    const ent = testsdk.UpdateDomainResponseSuccess()
    assert(null != ent)
  })


  test('validate', async (t) => {
    if (null == (config as any).feature?.validate) {
      t.skip('feature not present in this SDK: validate')
      return
    }
    const client = ResendSDK.test(undefined, { feature: { validate: { active: true } } })
    await assert.rejects(client.UpdateDomainResponseSuccess().update({"domain_id":1} as any),
      (err: any) => 'validate_failed' === err.code)
  })



  test('basic', async (t) => {

    const live = 'TRUE' === process.env.RESEND_TEST_LIVE
    for (const op of []) {
      if (!live && maybeSkipControl(t, 'entityOp', 'update_domain_response_success.' + op, live)) return
    }

    
    const setup = basicSetup()
    if (setup.live) {
      return runLiveEntity(setup, {"active":true,"alias":{"field":{}},"fields":{"capabilities":{"a":true,"h":"Capabilities","n":"capabilities","r":false,"sh":"Configure the domain capabilities for sending and receiving emails.","t":"`$OBJECT`","key$":"capabilities","index$":0},"click_tracking":{"a":true,"h":"Click Tracking","n":"click_tracking","r":false,"sh":"Track clicks within the body of each HTML email.","t":"`$BOOLEAN`","key$":"click_tracking","index$":1},"id":{"a":true,"h":"Id","n":"id","r":false,"sh":"The ID of the updated domain.","t":"`$STRING`","key$":"id","index$":2},"object":{"a":true,"h":"Object","n":"object","r":false,"sh":"The object type representing the updated domain.","t":"`$STRING`","key$":"object","index$":3},"open_tracking":{"a":true,"h":"Open Tracking","n":"open_tracking","r":false,"sh":"Track the open rate of each email.","t":"`$BOOLEAN`","key$":"open_tracking","index$":4},"tls":{"a":true,"h":"Tls","n":"tls","r":false,"sh":"enforced | opportunistic.","t":"`$STRING`","key$":"tls","index$":5},"tracking_subdomain":{"a":true,"h":"Tracking Subdomain","n":"tracking_subdomain","r":false,"sh":"The subdomain to use for click and open tracking.","t":"`$STRING`","key$":"tracking_subdomain","index$":6}},"id":{"field":"id","name":"id"},"name":"update_domain_response_success","op":{"update":{"input":"data","name":"update","points":[{"a":true,"co":{"id":"PATCH /domains/{domain_id}","source":"openapi3","version":2},"g":{"params":[{"a":true,"k":"param","n":"domain_id","or":"domain_id","r":true,"t":"`$STRING`","index$":0}]},"k":"http","m":"PATCH","o":"/domains/{domain_id}","q":{"exist":["domain_id"]},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"domains"},{"var":"domain_id"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":0}],"key$":"update"}},"relations":{"ancestors":[["$.main.kit.entity.domain"]]},"key$":"update_domain_response_success","name__orig":"update_domain_response_success","Name":"UpdateDomainResponseSuccess","name_":"update_domain_response_success","name-":"update-domain-response-success","NAME":"UPDATE_DOMAIN_RESPONSE_SUCCESS","index$":53}, {"active":true,"entity":"update_domain_response_success","key$":"BasicUpdateDomainResponseSuccessFlow","kind":"basic","name":"BasicUpdateDomainResponseSuccessFlow","param":{},"step":[{"a":false,"d":{},"i":{"ref":"update_domain_response_success_ref01","srcdatavar":"update_domain_response_success_ref01_data","suffix":"_up0","textfield":"object"},"m":{},"o":"update","s":[{"apply":"TextFieldMark","def":{"mark":"Mark01-update_domain_response_success_ref01"}}],"v":[],"unreachable":true}]}, 'UpdateDomainResponseSuccess', {"PATCH /domains/{domain_id}":{"protocol":"http","requestBody":{"content":{"application/json":{"schema":{"type":"object","properties":{"open_tracking":{"type":"boolean","description":"Track the open rate of each email.","key$":"open_tracking"},"click_tracking":{"type":"boolean","description":"Track clicks within the body of each HTML email.","key$":"click_tracking"},"tls":{"type":"string","enum":["opportunistic","enforced"],"description":"enforced | opportunistic.","default":"opportunistic","key$":"tls"},"capabilities":{"type":"object","description":"Configure the domain capabilities for sending and receiving emails. At least one capability must be enabled.","properties":{"sending":{"description":"Enable or disable sending emails from this domain.","enum":["enabled","disabled"],"type":"string"},"receiving":{"description":"Enable or disable receiving emails to this domain.","enum":["enabled","disabled"],"type":"string"}},"x-ref":"#/components/schemas/DomainCapabilities","key$":"capabilities"},"tracking_subdomain":{"type":"string","description":"The subdomain to use for click and open tracking.","key$":"tracking_subdomain"}},"x-ref":"#/components/schemas/UpdateDomainOptions","index$":1}}}},"parameters":[{"name":"domain_id","in":"path","required":true,"schema":{"type":"string"},"description":"The ID of the domain.","index$":0}]}}, { strict: LIVE_STRICT, t })
    }
    const client = setup.client
    const struct = setup.struct

    const isempty = struct.isempty
    const select = struct.select

    let update_domain_response_success_ref01_data = Object.values(setup.data.existing.update_domain_response_success)[0] as any

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
      '../../../../.sdk/test/entity/update_domain_response_success/UpdateDomainResponseSuccessTestData.json')

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
    ['update_domain_response_success01','update_domain_response_success02','update_domain_response_success03','domain01','domain02','domain03'],
    {
      '`$PACK`': ['', {
        '`$KEY`': '`$COPY`',
        '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
      }]
    })

  const env = envOverride({
    'RESEND_TEST_UPDATE_DOMAIN_RESPONSE_SUCCESS_ENTID': idmap,
    'RESEND_TEST_LIVE': 'FALSE',
    'RESEND_TEST_EXPLAIN': 'FALSE',
    'RESEND_APIKEY': '',
  })

  idmap = env['RESEND_TEST_UPDATE_DOMAIN_RESPONSE_SUCCESS_ENTID']

  const live = 'TRUE' === env.RESEND_TEST_LIVE

  const transport = createLiveTransport()
  if (live) {
    const rawIds = process.env['RESEND_TEST_UPDATE_DOMAIN_RESPONSE_SUCCESS_ENTID']
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
  
