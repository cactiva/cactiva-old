#!/bin/bash
cd ../
yarn build
cd server
rm -rf res
mkdir res
mv ../build res/public

rm -rf .git
git init .
git add .
git commit -am "fix"
caprover deploy --default

rm -rf .git