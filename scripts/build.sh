#!/bin/bash

SCRIPT_DIR=`dirname $0`
BUILD_DIR="$SCRIPT_DIR/../build"
APP_DIR="$SCRIPT_DIR/../app"
SRC_DIR="$APP_DIR/js"

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

# compile minified js file
java -jar "$SCRIPT_DIR/lib/closure/compiler.jar" --js $BUILD_FILE --js_output_file $MINIFIED_FILE

# copy app.css, index.html, angular.js
cp "$APP_DIR/css/app.css" "$BUILD_DIR/helpdesk.css" 
cp "$APP_DIR/index.html" $BUILD_DIR
cp "$APP_DIR/lib/angular/angular.min.js" $BUILD_DIR

# change the index.html
sed -Ei "s|css/app.css|helpdesk.css|" "$BUILD_DIR/index.html"
sed -Ei "s|lib/angular/angular.js|angular.min.js|" "$BUILD_DIR/index.html"
sed -Ei "s|js/utils.js|helpdesk.js|" "$BUILD_DIR/index.html"
sed -Ei "/script src=\"js/d" "$BUILD_DIR/index.html"

