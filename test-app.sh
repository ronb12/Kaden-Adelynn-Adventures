#!/bin/bash

SIM_UUID="63967656-A497-4BE7-8F59-A9102399AB11"
APP_ID="com.kaden-adelynn.adventures"

echo "Launching app..."
xcrun simctl launch "$SIM_UUID" "$APP_ID" 2>&1

echo ""
echo "Waiting 3 seconds for app to load..."
sleep 3

echo ""
echo "Checking logs for Metal errors..."
xcrun simctl spawn "$SIM_UUID" log show --predicate "process == \"KadenAdelynnAdventures\"" --style compact --last 10s 2>&1 | grep -i "metal\|vertex\|error\|fatal\|shader" || echo "No Metal errors found"

echo ""
echo "Last app logs:"
xcrun simctl spawn "$SIM_UUID" log show --predicate "process == \"KadenAdelynnAdventures\"" --style compact --last 10s 2>&1 | tail -20
