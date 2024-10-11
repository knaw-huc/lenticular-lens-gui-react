#!/bin/sh

for file in /usr/share/nginx/html/assets/index*.js; do
  if [ ! -f $file.tmpl.js ]; then
    cp $file $file.tmpl.js
  fi

  envsubst '$VITE_LENTICULAR_LENS_API' <$file.tmpl.js >$file
done

nginx -g 'daemon off;'