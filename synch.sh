#!/bin/bash
yarn run build
rsync -rvIz --rsh=ssh --delete --exclude=.git ./web/ newweb:/var/www/static/demo/qfx
