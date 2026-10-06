# RemoveSegmentResponseSuccess entity test

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


class _FailHook(ResendBaseFeature):
    def __init__(self):
        super().__init__()
        self.name = "failhook"
        self.unexpected = 0

    def init(self, ctx, options):
        pass

    def PreSpec(self, ctx):
        raise RuntimeError("remove_segment_response_success hook failed")

    def PreUnexpected(self, ctx):
        self.unexpected += 1



# main.kit.test.live.strict is true (the default is true): a live
# request that fails, or a live test missing an input it needs,
# fails the test.
# An account with no record for a test to read skips it either way.
LIVE_STRICT = True


class TestRemoveSegmentResponseSuccessEntity:

    def test_should_create_instance(self):
        testsdk = ResendSDK.test(None, None)
        ent = testsdk.RemoveSegmentResponseSuccess(None)
        assert ent is not None

    def test_should_stream(self):
        # Feature #4: the entity stream(action, ...) method runs the op
        # pipeline and yields result items. With the streaming feature active
        # it yields the feature's incremental output; otherwise it falls back
        # to the materialised list so stream always yields.
        seed = {
            "entity": {
                "remove_segment_response_success": {
                    "s1": {"id": "s1"},
                    "s2": {"id": "s2"},
                    "s3": {"id": "s3"},
                }
            }
        }

        # Fallback: streaming inactive -> yields the materialised list items.
        base = ResendSDK.test(seed, None)
        seen = list(base.RemoveSegmentResponseSuccess(None).stream("list", None, None))
        assert len(seen) == 3

        # Inbound: streaming active -> yields each item from the feature.
        from resend_sdk.config import shared_config
        cfg = shared_config()
        if isinstance(cfg.get("feature"), dict) and "streaming" in cfg["feature"]:
            sdk = ResendSDK.test(
                seed, {"feature": {"streaming": {"active": True}}})
            got = []
            for item in sdk.RemoveSegmentResponseSuccess(None).stream("list", None, None):
                if isinstance(item, list):
                    got.extend(item)
                else:
                    got.append(item)
            assert len(got) == 3

    def test_should_report_a_failed_stream(self):
        offline = {"net": {"offline": True}}
        with pytest.raises(Exception, match="offline"):
            list(ResendSDK.test(offline, None).RemoveSegmentResponseSuccess(None).stream("list", None, None))

        quiet = {"ctrl": {"throw": False}}
        list(ResendSDK.test(offline, None).RemoveSegmentResponseSuccess(None).stream("list", None, quiet))

        if "rbac" in (shared_config().get("feature") or {}):
            denied = ResendSDK.test(
                None, {"feature": {"rbac": {"active": True, "deny": True}}})
            with pytest.raises(Exception) as err:
                list(denied.RemoveSegmentResponseSuccess(None).stream("list", None, None))
            assert "rbac_denied" == getattr(err.value, "code", None)

    def test_should_leave_the_callers_ctrl(self):
        explain = {}
        ctrl = {"explain": explain}
        list(ResendSDK.test(None, None).RemoveSegmentResponseSuccess(None).stream("list", None, {"ctrl": ctrl}))
        assert ["explain"] == list(ctrl.keys())
        assert explain is ctrl["explain"] and 0 < len(explain)

    def test_should_fire_pre_unexpected(self):
        hook = _FailHook()
        client = ResendSDK({"feature": {"test": {"active": True}}, "extend": [hook]})
        with pytest.raises(Exception, match="hook failed"):
            client.RemoveSegmentResponseSuccess(None).list(None, None)
        assert 0 < hook.unexpected

        fired = hook.unexpected
        assert client.RemoveSegmentResponseSuccess(None).list(None, {"throw": False}) is None
        assert fired < hook.unexpected

    def test_should_refuse_an_invalid_request(self):
        if "validate" not in (shared_config().get("feature") or {}):
            pytest.skip("feature not present in this SDK: validate")
        client = ResendSDK.test(
            None, {"feature": {"validate": {"active": True}}})
        with pytest.raises(Exception) as err:
            client.RemoveSegmentResponseSuccess(None).list({"after": 1}, None)
        assert "validate_failed" == getattr(err.value, "code", None)

    def test_should_run_basic_flow(self):
        setup = _remove_segment_response_success_basic_setup(None)
        # Per-op sdk-test-control.json skip — basic test exercises a flow with
        # multiple ops; skipping any one skips the whole flow (steps depend
        # on each other).
        _live = setup.get("live", False)
        for _op in ["create", "list", "remove"]:
            _skip, _reason = runner.is_control_skipped("entityOp", "remove_segment_response_success." + _op, "live" if _live else "unit")
            if _skip:
                pytest.skip(_reason or "skipped via sdk-test-control.json")
                return
        client = setup["client"]

        # CREATE
        remove_segment_response_success_ref01_ent = client.RemoveSegmentResponseSuccess(None)
        remove_segment_response_success_ref01_data = helpers.to_map(vs.getprop(
            vs.getpath(setup["data"], "new.remove_segment_response_success"), "remove_segment_response_success_ref01"))

        remove_segment_response_success_ref01_data = helpers.to_map(runner.entity_data(remove_segment_response_success_ref01_ent.create(remove_segment_response_success_ref01_data, None)))
        assert remove_segment_response_success_ref01_data is not None
        assert remove_segment_response_success_ref01_data["id"] is not None

        # LIST
        remove_segment_response_success_ref01_match = {}

        remove_segment_response_success_ref01_list_result = remove_segment_response_success_ref01_ent.list(remove_segment_response_success_ref01_match, None)
        assert isinstance(remove_segment_response_success_ref01_list_result, list)

        found_item = vs.select(
            runner.entity_list_to_data(remove_segment_response_success_ref01_list_result),
            {"id": remove_segment_response_success_ref01_data["id"]})
        assert not vs.isempty(found_item)

        # REMOVE
        remove_segment_response_success_ref01_match_rm0 = {
            "id": remove_segment_response_success_ref01_data["id"],
        }
        remove_segment_response_success_ref01_ent.remove(remove_segment_response_success_ref01_match_rm0, None)

        # LIST
        remove_segment_response_success_ref01_match_rt0 = {}

        remove_segment_response_success_ref01_list_rt0_result = remove_segment_response_success_ref01_ent.list(remove_segment_response_success_ref01_match_rt0, None)
        assert isinstance(remove_segment_response_success_ref01_list_rt0_result, list)

        not_found_item = vs.select(
            runner.entity_list_to_data(remove_segment_response_success_ref01_list_rt0_result),
            {"id": remove_segment_response_success_ref01_data["id"]})
        assert vs.isempty(not_found_item)



def _remove_segment_response_success_basic_setup(extra):
    runner.load_env_local()

    entity_data_file = os.path.join(_TEST_DIR, "../../.sdk/test/entity/remove_segment_response_success/RemoveSegmentResponseSuccessTestData.json")
    with open(entity_data_file, "r", encoding="utf-8") as f:
        entity_data_source = f.read()

    entity_data = json.loads(entity_data_source)

    options = {}
    options["entity"] = entity_data.get("existing")

    client = ResendSDK.test(options, extra)

    # Generate idmap via transform.
    idmap = vs.transform(
        ["remove_segment_response_success01", "remove_segment_response_success02", "remove_segment_response_success03"],
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
        "RESEND_TEST_REMOVE_SEGMENT_RESPONSE_SUCCESS_ENTID")
    _idmap_overridden = _entid_env_raw is not None and _entid_env_raw.strip().startswith("{")

    env = runner.env_override({
        "RESEND_TEST_REMOVE_SEGMENT_RESPONSE_SUCCESS_ENTID": idmap,
        "RESEND_TEST_LIVE": "FALSE",
        "RESEND_TEST_EXPLAIN": "FALSE",
        "RESEND_APIKEY": "",
    })

    idmap_resolved = helpers.to_map(
        env.get("RESEND_TEST_REMOVE_SEGMENT_RESPONSE_SUCCESS_ENTID"))
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
