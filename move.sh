#!/bin/sh
rm -rf ./server/public/admin
rm -rf ./server/public/user

mv -f ./server/public/static/user ./server/public/
mv -f ./server/public/static/admin ./server/public/