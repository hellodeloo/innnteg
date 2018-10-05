#!/usr/bin/env sh

# abort on errors
set -e

# build
gulp build

# navigate into the build output directory
cd dist

git init
git add .
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:hellodeloo/innnteg.git master:gh-pages

cd -
