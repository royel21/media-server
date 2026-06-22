#!/bin/bash

if [ -d "$HOME/images" ]; then
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
    rsync -avu --delete /mnt/5TBHDD/R18 /mnt/18TBHDD/5TBHDD
    rsync -avu --delete /mnt/5TBHDD/Movies\ And\ Ovas /mnt/18TBHDD/5TBHDD
fi

if [ -d "/mnt/4TBHDD" ]; then
    rsync -avu --delete /mnt/4TBHDD/R18 /mnt/18TBHDD/4TBHDD
fi