#!/bin/bash
BACKUP_DIR=$HOME"/backups"
# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR
#save date in YYYY-MM-DD_HH-MM-SS format
# This is the format used by mysqldump for the backup file name
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
# Database Name
DB_NAME="mediaserverdb"
#dump the database to a file
# The -u option specifies the MySQL user, -p specifies the password, and the database name is provided at the end
mysqldump --defaults-extra-file=$HOME"/.secret.cnf" $DB_NAME > "$BACKUP_DIR/$DB_NAME_$DATE.sql"
# Clean up backups older than 30 days (optional)
find $BACKUP_DIR -type f -name "*.sql" -mtime +7 -exec rm -f {} \;
