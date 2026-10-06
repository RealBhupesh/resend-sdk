# UpdateTemplateResponseSuccess entity test

import json
import os
import time

import pytest

from resend_sdk.utility.voxgig_struct import voxgig_struct as vs
from resend_sdk import ResendSDK
from resend_sdk.core import helpers
from resend_sdk.config import shared_config
from resend_sdk.feature.base_feature import ResendBaseFeature

_TEST_DIR = os.path.dirname(os.path.abspath(__file__))
from test import runner



# main.kit.test.live.strict is true (the default is true): a live
# request that fails, or a live test missing an input it needs,
# fails the test.
# An account with no record for a test to read skips it either way.
LIVE_STRICT = True


class TestUpdateTemplateResponseSuccessEntity:

    def test_should_create_instance(self):
        testsdk = ResendSDK.test(None, None)
        ent = testsdk.UpdateTemplateResponseSuccess(None)
        assert ent is not None

    def test_should_refuse_an_invalid_request(self):
        if "validate" not in (shared_config().get("feature") or {}):
            pytest.skip("feature not present in this SDK: validate")
        client = ResendSDK.test(
            None, {"feature": {"validate": {"active": True}}})
        with pytest.raises(Exception) as err:
            client.UpdateTemplateResponseSuccess(None).update({"id": 1}, None)
        assert "validate_failed" == getattr(err.value, "code", None)

    def test_should_run_basic_flow(self):
        setup = _update_template_response_success_basic_setup(None)
        # Per-op sdk-test-control.json skip — basic test exercises a flow with
        # multiple ops; skipping any one skips the whole flow (steps depend
        # on each other).
        _live = setup.get("live", False)
        for _op in ["update"]:
            _skip, _reason = runner.is_control_skipped("entityOp", "update_template_response_success." + _op, "live" if _live else "unit")
            if _skip:
                pytest.skip(_reason or "skipped via sdk-test-control.json")
                return
        if setup["live"]:
            runner.live_miss(LIVE_STRICT, "Live entity test blocked: " + "the flow updates a update_template_response_success record it did not create")
        client = setup["client"]

        # Bootstrap entity data from existing test data.
        update_template_response_success_ref01_data_raw = vs.items(helpers.to_map(
            vs.getpath(setup["data"], "existing.update_template_response_success")))
        update_template_response_success_ref01_data = None
        if len(update_template_response_success_ref01_data_raw) > 0:
            update_template_response_success_ref01_data = helpers.to_map(update_template_response_success_ref01_data_raw[0][1])

        # UPDATE
        update_template_response_success_ref01_ent = client.UpdateTemplateResponseSuccess(None)
        update_template_response_success_ref01_data_up0_up = {
            "id": update_template_response_success_ref01_data["id"],
        }

        update_template_response_success_ref01_markdef_up0_name = "alias"
        update_template_response_success_ref01_markdef_up0_value = "Mark01-update_template_response_success_ref01_" + str(setup["now"])
        update_template_response_success_ref01_data_up0_up[update_template_response_success_ref01_markdef_up0_name] = update_template_response_success_ref01_markdef_up0_value

        update_template_response_success_ref01_resdata_up0 = helpers.to_map(runner.entity_data(update_template_response_success_ref01_ent.update(update_template_response_success_ref01_data_up0_up, None)))
        assert update_template_response_success_ref01_resdata_up0 is not None
        assert update_template_response_success_ref01_resdata_up0["id"] == update_template_response_success_ref01_data_up0_up["id"]
        assert update_template_response_success_ref01_resdata_up0[update_template_response_success_ref01_markdef_up0_name] == update_template_response_success_ref01_markdef_up0_value



def _update_template_response_success_basic_setup(extra):
    runner.load_env_local()

    entity_data_file = os.path.join(_TEST_DIR, "../../.sdk/test/entity/update_template_response_success/UpdateTemplateResponseSuccessTestData.json")
    with open(entity_data_file, "r", encoding="utf-8") as f:
        entity_data_source = f.read()

    entity_data = json.loads(entity_data_source)

    options = {}
    options["entity"] = entity_data.get("existing")

    client = ResendSDK.test(options, extra)

    # Generate idmap via transform.
    idmap = vs.transform(
        ["update_template_response_success01", "update_template_response_success02", "update_template_response_success03"],
        {
            "`$PACK`": ["", {
                "`$KEY`": "`$COPY`",
                "`$VAL`": ["`$FORMAT`", "upper", "`$COPY`"],
            }],
        }
    )

    # Whether *_ENTID supplied the idmap, read before env_override consumes
    # it: without it, the ids a live flow binds are the fixture's synthetic ones.
    _entid_env_raw = os.environ.get(
        "RESEND_TEST_UPDATE_TEMPLATE_RESPONSE_SUCCESS_ENTID")
    _idmap_overridden = _entid_env_raw is not None and _entid_env_raw.strip().startswith("{")

    env = runner.env_override({
        "RESEND_TEST_UPDATE_TEMPLATE_RESPONSE_SUCCESS_ENTID": idmap,
        "RESEND_TEST_LIVE": "FALSE",
        "RESEND_TEST_EXPLAIN": "FALSE",
        "RESEND_APIKEY": "",
    })

    idmap_resolved = helpers.to_map(
        env.get("RESEND_TEST_UPDATE_TEMPLATE_RESPONSE_SUCCESS_ENTID"))
    if idmap_resolved is None:
        idmap_resolved = helpers.to_map(idmap)

    if env.get("RESEND_TEST_LIVE") == "TRUE":
        merged_opts = vs.merge([
            # FIRST, so the generated fields below win: sdk-test-control.json's
            # test.client.options adds to the live client, it does not
            # redirect it.
            runner.live_client_options(),
            {
                "apikey": env.get("RESEND_APIKEY"),
            },
            extra or {},
        ])
        client = ResendSDK(helpers.to_map(merged_opts))

    _live = env.get("RESEND_TEST_LIVE") == "TRUE"
    return {
        "client": client,
        "data": entity_data,
        "idmap": idmap_resolved,
        "env": env,
        "explain": env.get("RESEND_TEST_EXPLAIN") == "TRUE",
        "live": _live,
        "synthetic_only": _live and not _idmap_overridden,
        "now": int(time.time() * 1000),
    }
