#!/bin/sh
# chmod +x build.sh && ./build.sh

pkg index.js --out-path ../build
cp -R ./node_modules/puppeteer/.local-chromium ../build/puppeteer
