-- SQL Commands to set up the dayboard user and database
-- Run these commands in SQL Server Management Studio (SSMS) as an administrator

-- 1. Create the database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'dayboard')
BEGIN
    CREATE DATABASE dayboard;
    PRINT 'Database "dayboard" created successfully';
END
ELSE
BEGIN
    PRINT 'Database "dayboard" already exists';
END
GO

-- 2. Create login for dayboard user (at server level)
USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'dayboard')
BEGIN
    CREATE LOGIN dayboard WITH PASSWORD = 'dayboard';
    PRINT 'Login "dayboard" created successfully';
END
ELSE
BEGIN
    PRINT 'Login "dayboard" already exists';
END
GO

-- 3. Create user in dayboard database and grant permissions
USE dayboard;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'dayboard')
BEGIN
    CREATE USER dayboard FOR LOGIN dayboard;
    PRINT 'User "dayboard" created successfully';
END
ELSE
BEGIN
    PRINT 'User "dayboard" already exists';
END
GO

-- 4. Grant necessary permissions
ALTER ROLE db_owner ADD MEMBER dayboard;
PRINT 'Granted db_owner role to dayboard user';

-- 5. Test the setup
SELECT 
    'Database: ' + DB_NAME() as current_database,
    'User: ' + USER_NAME() as current_user,
    'Login: ' + SYSTEM_USER as current_login;

PRINT 'Setup completed! You can now use dayboard/dayboard to connect to the database.';