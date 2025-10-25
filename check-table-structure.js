const sql = require('mssql');

// Database configuration (update with your actual connection details)
const config = {
    user: 'your_username',
    password: 'your_password',
    server: 'your_server', 
    database: 'your_database',
    options: {
        encrypt: true, // Use this if you're on Windows Azure
        trustServerCertificate: true // Use this if you're using local SQL Server
    }
};

async function checkTableStructure() {
    try {
        console.log('🔍 Checking Person_Installments table structure...\n');
        
        // Connect to database
        await sql.connect(config);
        console.log('✅ Connected to database');
        
        // Check table structure
        const structureResult = await sql.query(`
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                CHARACTER_MAXIMUM_LENGTH,
                IS_NULLABLE,
                COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Person_Installments'
            ORDER BY ORDINAL_POSITION
        `);
        
        console.log('\n📊 Person_Installments Table Structure:');
        console.log('┌─────────────────────┬─────────────┬────────┬──────────┬─────────┐');
        console.log('│ Column Name         │ Data Type   │ Length │ Nullable │ Default │');
        console.log('├─────────────────────┼─────────────┼────────┼──────────┼─────────┤');
        
        structureResult.recordset.forEach(column => {
            const name = column.COLUMN_NAME.padEnd(19);
            const type = column.DATA_TYPE.padEnd(11);
            const length = (column.CHARACTER_MAXIMUM_LENGTH || 'N/A').toString().padEnd(6);
            const nullable = column.IS_NULLABLE.padEnd(8);
            const defaultVal = (column.COLUMN_DEFAULT || 'NULL').padEnd(7);
            
            console.log(`│ ${name} │ ${type} │ ${length} │ ${nullable} │ ${defaultVal} │`);
        });
        console.log('└─────────────────────┴─────────────┴────────┴──────────┴─────────┘');
        
        // Check if Description column exists
        const descriptionExists = structureResult.recordset.some(
            column => column.COLUMN_NAME === 'Description'
        );
        
        console.log(`\n🔍 Description column exists: ${descriptionExists ? '✅ YES' : '❌ NO'}`);
        
        if (!descriptionExists) {
            console.log('\n💡 SOLUTION: The Description column is missing from your database table.');
            console.log('Please run the SQL script: database/add-description-column.sql');
            console.log('Or manually execute this command in your SQL Server:');
            console.log('ALTER TABLE [dbo].[Person_Installments] ADD [Description] [nvarchar](500) NULL;');
        }
        
        // Check sample data
        const dataResult = await sql.query(`
            SELECT TOP 3 * FROM Person_Installments 
            ORDER BY Id
        `);
        
        console.log('\n📋 Sample Data:');
        if (dataResult.recordset.length > 0) {
            dataResult.recordset.forEach((row, index) => {
                console.log(`\nRecord ${index + 1}:`);
                Object.keys(row).forEach(key => {
                    console.log(`  ${key}: ${row[key]}`);
                });
            });
        } else {
            console.log('No data found in Person_Installments table');
        }
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        console.log('\n💡 Please check:');
        console.log('1. Database connection settings in this script');
        console.log('2. Database server is running');
        console.log('3. Database credentials are correct');
        console.log('4. Database name exists');
    } finally {
        await sql.close();
    }
}

// Run the check
checkTableStructure();