#!/bin/bash

bun run ./examples/static.ts &
SERVER_PID=$!

function stop_server {
    kill $SERVER_PID
}

trap stop_server EXIT

sleep .1

index=$(<./examples/pages/index.html)
vader=$(md5sum ./examples/pages/vader.jpg | awk '{print $1}')
gopher=$(md5sum ./examples/pages/gopher.png | awk '{print $1}')

declare -A test_cases
test_cases["$index"]="http://localhost:3001/"
test_cases["$vader"]="http://localhost:3001/vader.jpg"
test_cases["$gopher"]="http://localhost:3001/gopher.png"

function does_exist() {
    if [ ! -f "$1" ]; then
        echo "Error: File '$1' not found."
        exit 1
    fi
}

function run_test() {
    local expected="$1"
    local url="$2"
    local actual=""

    if [[ "$url" == *".jpg"* ]] || [[ "$url" == *".png"* ]]; then
        name="${url//[^[:alnum:]. ]}"
        curl -sSo "$name" "$url"
        actual=$(md5sum "$name" | awk '{print $1}')
    else
        actual=$(curl -sS "$url")
    fi

    if [ "$actual" == "$expected" ]; then
        echo "Passed."
    else
        echo "Failed: $url returned $actual | expected: $expected"
    fi

    if does_exist "$name"; then
        rm "$name"
    fi

}

for expected in "${!test_cases[@]}"; do
    url="${test_cases[$expected]}"
    run_test "$expected" "$url"
done