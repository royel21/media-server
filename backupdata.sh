#!/bin/bash

rsync -avu /mnt/2TBSSD2/Games /mnt/18TBHDD/2TBSSD2
rsync -avu --delete ~/images /mnt/18TBHDD
rsync -avu --delete /mnt/1TBSSD /mnt/18TBHDD/
rsync -avu --delete /mnt/2TBSSD /mnt/18TBHDD/
rsync -avu --delete /mnt/5TBHDD/Completed /mnt/18TBHDD/5TBHDD
rsync -avu --delete /mnt/5TBHDD/R18 /mnt/18TBHDD/5TBHDD
rsync -avu --delete /mnt/5TBHDD/Movies\ And\ Ovas /mnt/18TBHDD/5TBHDD
rsync -avu --delete /mnt/2TBSSD2/R18 /mnt/18TBHDD/2TBSSD2