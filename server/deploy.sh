#!/bin/bash

cd ../
echo "export const mode = 'production';" > "./src/env.js"                         
yarn build
cd server
rm -rf res
mkdir res
cp -r ../build res/public

rm -rf .git
git init .
git add .
git commit -am "fix"
caprover deploy --default

rm -rf .git
cd ../
echo "export const mode = 'development';" > "./src/env.js"    