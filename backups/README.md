# WordPress Database Backups

This directory is for storing WordPress database backups.

## Supported Formats
- SQL files (.sql)
- Compressed SQL files (.sql.gz, .sql.zip)

Place your database backups in this directory, and the AI agent will help you import them into your local development environment.

## Usage

When setting up your WordPress project, the AI agent will:

1. Check this directory for existing backups
2. Help you validate the backup files
3. Guide you through importing the backup into your local database

## Backup Naming Convention

For better organization, consider naming your backups with a date prefix:
```
YYYY-MM-DD-sitename-backup.sql
```

Example: `2025-03-12-mywordpress-backup.sql`

## Creating New Backups

If you need to create a backup from your local development environment, you can use:

```bash
# Export database to SQL file
docker-compose exec db mysqldump -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} > backups/$(date +%Y-%m-%d)-local-backup.sql
```

This will create a new backup file with today's date in the filename.