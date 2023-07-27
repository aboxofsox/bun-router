#!/bin/bash

PARAMS_TEST=(
    "http://localhost:3000/pets/dogs"
    "http://localhost:3000/grocery/strawberry"
)

echo "Starting test server"
bun run ./examples/params.ts &

SERVER_PID=$!

function stop_server {
    echo "Stopping the server $SERVER_PID"
    kill $SERVER_PID
}

trap stop_server EXIT

sleep .1

expected='["Joey","Benny","Max"]'
response=$(curl -sS "${PARAMS_TEST[0]}")
response_trimmed=$(echo "$response" | xargs -0)
expected_trimmed=$(echo "$expected" | xargs -0)

if [ "$response_trimmed" = "$expected_trimmed" ]; then
    echo "Passed."
else
    echo "$response_trimmed"
    echo "$expected_trimmed"
    echo "Failed."
fi

expected="🍓"
response=$(curl -s "${PARAMS_TEST[1]}")
if [ "$response" = "$expected" ]; then
    echo "Failed: ${PARAMS_TEST[1]}"
else
    echo "Passed."
fi

