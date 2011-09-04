#!/bin/bash

# Simple script for building the project
# Compiles all js files into one (minified by closure)
# Updates the index.html template with given $domain (for multitenancy)
# Create gzipped archive

SCRIPT_DIR=$(dirname $0)
ROOT_DIR=$(dirname $SCRIPT_DIR)
BUILD_DIR="$ROOT_DIR/build"
APP_DIR="$ROOT_DIR/app"
SRC_DIR="$APP_DIR/js"

# prefix for all css, js, images as well as tpl partials loaded by js
ASSET_PREFIX="/client"
DOMAIN_NAME="\$domain.name"
DOMAIN_URL="\$domain.companySite"

BUILD_FILE="$BUILD_DIR/helpdesk.js"
MINIFIED_FILE="$BUILD_DIR/helpdesk.min.js"

# create build dir if not exist
if [ ! -d "$BUILD_DIR" ]; then
  mkdir $BUILD_DIR
fi

# concat all source files into one
echo "" > $BUILD_FILE
for FILE in $(ls $SRC_DIR/*.js)
do
  cat $FILE >> $BUILD_FILE
  echo "" >> $BUILD_FILE
done

# prefix tpl partials
sed -Ei "s|partials/|$ASSET_PREFIX/partials/|" "$BUILD_FILE"

# compile minified js file
java -jar "$SCRIPT_DIR/lib/closure/compiler.jar" --js $BUILD_FILE --js_output_file $MINIFIED_FILE

# copy app.css, index.html, angular.js, partials
cp "$APP_DIR/css/app.css" "$BUILD_DIR/helpdesk.css"
cp "$APP_DIR/index.html" $BUILD_DIR
cp "$APP_DIR/lib/angular/angular.min.js" $BUILD_DIR
cp -r "$APP_DIR/partials" "$BUILD_DIR/"
cp "$APP_DIR/favicon.ico" "$BUILD_DIR/"

# change the index.html
sed -Ei "s|css/app.css|$ASSET_PREFIX/helpdesk.css|" "$BUILD_DIR/index.html"
sed -Ei "s|lib/angular/angular.js|$ASSET_PREFIX/angular.min.js|" "$BUILD_DIR/index.html"
sed -Ei "s|js/utils.js|$ASSET_PREFIX/helpdesk.min.js|" "$BUILD_DIR/index.html"
sed -Ei "s|favicon.ico|$ASSET_PREFIX/favicon.ico|" "$BUILD_DIR/index.html"
sed -Ei "/script src=\"js/d" "$BUILD_DIR/index.html"

sed -Ei "s|DOMAIN_NAME|$DOMAIN_NAME|g" "$BUILD_DIR/index.html"
sed -Ei "s|DOMAIN_URL|$DOMAIN_URL|g" "$BUILD_DIR/index.html"

# create archive
tar -zcvf helpdesk-client.tar.gz "$BUILD_DIR"
