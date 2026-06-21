# #!/bin/bash


# if [ -d "/mnt/8TBHDD2/Temp/Games/JoiPlay" ]; then
#     rsync -avu --progress /mnt/Downloads/HGames/JoiPlay/* /mnt/8TBHDD2/Temp/Games/JoiPlay 
#     rm -rf /mnt/Downloads/HGames/JoiPlay/*
# fi   

# if [ -d "/mnt/8TBHDD2/Temp/Games/VN" ]; then
#     rsync -avu --progress /mnt/Downloads/HGames/VN/* /mnt/8TBHDD2/Temp/Games/VN
#     rm -rf /mnt/Downloads/HGames/VN/*
# fi

# if [ -d "/mnt/8TBHDD2/Temp/Games/Winlator" ]; then
#     rsync -avu --progress /mnt/Downloads/HGames/Winlator/* /mnt/8TBHDD2/Temp/Games/Winlator
#     rm -rf /mnt/Downloads/HGames/Winlator/*
# fi

# rsync -avu --progress /mnt/18TBHDD/Temp/Games/JoiPlay/* /mnt/MSI-8TBHDD/Games/JoiPlay/

#!/bin/bash
#!/bin/bash
for d in /mnt/8TBHDD/H/JoiPlay/*/ ; do
    folder=$(basename "$d")
    echo "Compressing $folder..."
    7z a "${folder}.zip" "$d"
done