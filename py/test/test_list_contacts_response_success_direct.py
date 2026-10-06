# ListContactsResponseSuccess direct test

import json
import pytest

from resend_sdk.utility.voxgig_struct import voxgig_struct as vs
from resend_sdk import ResendSDK
from resend_sdk.core import helpers
from test import runner


# main.kit.test.live.strict is true (the default is true): a live
# request that fails, or a live test missing an input it needs,
# fails the test.
# An account with no record for a test to read skips it either way.
LIVE_STRICT = True


def _live_ok(result):
    status = helpers.to_int(result.get("status"))
    return result.get("err") is None and bool(result.get("ok")) and 200 <= status < 300


class TestListContactsResponseSuccessDirect:

    def test_should_direct_list_list_contacts_response_success(self):
        setup = _list_contacts_response_success_direct_setup([
            {"id": "direct01"},
            {"id": "direct02"},
        ])
        _skip, _reason = runner.is_control_skipped("direct", "direct-list-list_contacts_response_success", "live" if setup["live"] else "unit")
        if _skip:
            pytest.skip(_reason or "skipped via sdk-test-control.json")
            return
        if setup["live"]:
            for _live_key in ["segment01"]:
                if setup["idmap"].get(_live_key) is None:
                    runner.live_miss(LIVE_STRICT, f"Live test blocked: needs {_live_key} via RESEND_TEST_LIST_CONTACTS_RESPONSE_SUCCESS_ENTID")

        client = setup["client"]

        params = {}
        if setup["live"]:
            params["segment_id"] = setup["idmap"].get("segment01")
        else:
            params["segment_id"] = "direct01"

        result = client.direct({
            "path": "segments/{segment_id}/contacts",
            "method": "GET",
            "params": params,
        })
        if setup["live"]:
            if not _live_ok(result):
                runner.live_miss(LIVE_STRICT, "Live list failed: " + runner.live_describe(result))
            if runner.live_list(result.get("data")) is None:
                runner.live_miss(LIVE_STRICT, "Live list returned no list: " + runner.live_describe(result))
        else:
            assert result["ok"] is True
            assert helpers.to_int(result["status"]) == 200
            assert isinstance(result["data"], list)
            assert len(result["data"]) == 2
            assert len(setup["calls"]) == 1



def _list_contacts_response_success_direct_setup(mockres):
    runner.load_env_local()

    calls = []

    env = runner.env_override({
        "RESEND_TEST_LIST_CONTACTS_RESPONSE_SUCCESS_ENTID": {},
        "RESEND_TEST_LIVE": "FALSE",
        "RESEND_APIKEY": "",
    })

    live = env.get("RESEND_TEST_LIVE") == "TRUE"

    if live:
        # sdk-test-control.json's test.client.options seeds the live
        # client; the generated fields below overwrite anything they name.
        merged_opts = dict(runner.live_client_options())
        merged_opts.update({
            "apikey": env.get("RESEND_APIKEY"),
        })
        client = ResendSDK(merged_opts)
        idmap = env.get("RESEND_TEST_LIST_CONTACTS_RESPONSE_SUCCESS_ENTID")
        return {
            "client": client,
            "calls": calls,
            "live": True,
            "idmap": idmap if isinstance(idmap, dict) else {},
        }

    def mock_fetch(url, init):
        calls.append({"url": url, "init": init})
        return {
            "status": 200,
            "statusText": "OK",
            "headers": {},
            "json": lambda: mockres if mockres is not None else {"id": "direct01"},
            "body": "mock",
        }, None

    client = ResendSDK({
        "base": "http://localhost:8080",
        "system": {
            "fetch": mock_fetch,
        },
    })

    return {
        "client": client,
        "calls": calls,
        "live": False,
        "idmap": {},
    }
