#!/bin/bash

bun run ./examples/basic.ts &
SERVER_PID=$!

function stop_server {
    kill $SERVER_PID
}

trap stop_server EXIT

sleep .1

declare -A test_cases
test_cases['"ok"']="http://localhost:3000/"
test_cases['"baz"']="http://localhost:3000/user/baz"

function run_test() {
    local expected_response="$1"
    local url="$2"

    actual_response=$(curl -sS "$url")

    if [[ "$actual_response" == "$expected_response" ]]; then
        echo "Passed."
    else
        echo "Failed: $url returned $actual_response : $expected_response"
    fi
}

for expected in "${!test_cases[@]}"; do
    url="${test_cases[$expected]}"
    run_test "$expected" "$url"
done

