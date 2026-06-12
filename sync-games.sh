#!/bin/bash


if [ -d "/mnt/18TBHDD/Temp/Games/JoiPlay" ]; then
    rsync -avu --progress /mnt/Downloads/HGames/JoiPlay/* /mnt/18TBHDD/Temp/Games/JoiPlay 
    rm -rf /mnt/Downloads/HGames/JoiPlay/*
fi   

if [ -d "/mnt/18TBHDD/Temp/Games/VN" ]; then
    rsync -avu --progress /mnt/Downloads/HGames/VN/* /mnt/18TBHDD/Temp/Games/VN
    rm -rf /mnt/Downloads/HGames/VN/*
fi

if [ -d "/mnt/18TBHDD/Temp/Games/Winlator" ]; then
    rsync -avu --progress /mnt/Downloads/HGames/Winlator/* /mnt/18TBHDD/Temp/Games/Winlator
    rm -rf /mnt/Downloads/HGames/Winlator/*
fi
