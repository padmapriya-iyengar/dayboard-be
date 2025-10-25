-- SQL script to add Description column to Person_Installments table
-- Run this in your SQL Server Management Studio or database client

-- Check if the Description column already exists
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Person_Installments' 
    AND COLUMN_NAME = 'Description'
)
BEGIN
    -- Add the Description column
    ALTER TABLE [dbo].[Person_Installments]
    ADD [Description] [nvarchar](500) NULL;
    
    PRINT 'Description column added successfully to Person_Installments table';
END
ELSE
BEGIN
    PRINT 'Description column already exists in Person_Installments table';
END

-- Optional: Update existing records with default descriptions based on patterns
-- Uncomment the following if you want to add default descriptions to existing records

/*
-- Update existing records with sample descriptions
UPDATE [dbo].[Person_Installments] 
SET [Description] = 'Personal Loan EMI'
WHERE [Description] IS NULL AND [isDebit] = 1 AND [Amount] > 5000;

UPDATE [dbo].[Person_Installments] 
SET [Description] = 'Monthly Salary'
WHERE [Description] IS NULL AND [isDebit] = 0 AND [Amount] > 20000;

UPDATE [dbo].[Person_Installments] 
SET [Description] = 'Credit Card EMI'
WHERE [Description] IS NULL AND [isDebit] = 1 AND [Amount] < 5000;

UPDATE [dbo].[Person_Installments] 
SET [Description] = 'Installment Payment'
WHERE [Description] IS NULL;
*/

-- Verify the column was added
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Person_Installments'
ORDER BY ORDINAL_POSITION;