#!/bin/bash

rsync -avu --progress --delete /mnt/2TBSSD /mnt/18TBHDD/2TBSSD
rsync -avu --progress --delete /mnt/1TBSSD /mnt/18TBHDD/1TBSSD
rsync -avu --progress --delete /mnt/5TBHDD /mnt/18TBHDD/5TBHDD