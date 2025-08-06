#!/bin/bash

rsync -avu --delete /mnt/1TBSSD /mnt/18TBHDD/
rsync -avu --delete /mnt/2TBSSD /mnt/18TBHDD/
rsync -avu --delete /mnt/5TBHDD/R18 /mnt/18TBHDD/5TBHDD
rsync -avu --delete /mnt/5TBHDD/R18-2 /mnt/18TBHDD/5TBHDD
rsync -avu --delete /mnt/5TBHDD/Completed /mnt/18TBHDD/5TBHDD
rsync -avu --delete /mnt/5TBHDD/Movies\ And\ Ovas /mnt/18TBHDD/5TBHDD