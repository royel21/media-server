#!/bin/bash

if [ -d "~/images" ]; then
    rsync -avu --delete ~/images /mnt/18TBHDD
fi
if [ -d "/mnt/1TBSSD" ]; then
    rsync -avu --delete /mnt/1TBSSD /mnt/18TBHDD/
fi
if [ -d "/mnt/2TBSSD" ]; then
    rsync -avu --delete /mnt/2TBSSD /mnt/18TBHDD/
fi
if [ -d "/mnt/5TBHDD" ]; then
    rsync -avu --delete /mnt/5TBHDD/Completed /mnt/18TBHDD/5TBHDD
fi
if [ -d "/mnt/5TBHDD" ]; then
    rsync -avu --delete /mnt/5TBHDD/R18 /mnt/18TBHDD/5TBHDD
fi
if [ -d "/mnt/5TBHDD" ]; then
    rsync -avu --delete /mnt/5TBHDD/Movies\ And\ Ovas /mnt/18TBHDD/5TBHDD
fi
if [ -d "/mnt/5TBHDD2" ]; then
    rsync -avu --delete /mnt/5TBHDD2 /mnt/18TBHDD
fi