-- DayBoard Database Schema
-- SQL Server Database Setup

-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'dayboard')
BEGIN
    CREATE DATABASE dayboard;
END
GO

USE dayboard;
GO

-- Create Users table for authentication
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        email NVARCHAR(255) NOT NULL UNIQUE,
        username NVARCHAR(100) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        first_name NVARCHAR(100),
        last_name NVARCHAR(100),
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE()
    );
    
    CREATE INDEX IX_users_email ON users(email);
    CREATE INDEX IX_users_username ON users(username);
END
GO

-- Create Categories table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='categories' AND xtype='U')
BEGIN
    CREATE TABLE categories (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(100) NOT NULL,
        type NVARCHAR(50) NOT NULL, -- 'grocery', 'finance', etc.
        icon NVARCHAR(10),
        description NVARCHAR(500),
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE()
    );
    
    CREATE INDEX IX_categories_type ON categories(type);
END
GO

-- Create Grocery Items table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='grocery_items' AND xtype='U')
BEGIN
    CREATE TABLE grocery_items (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(255) NOT NULL,
        category_id UNIQUEIDENTIFIER,
        quantity DECIMAL(10,2),
        unit NVARCHAR(50),
        expiry_date DATE,
        is_purchased BIT DEFAULT 0,
        purchased_at DATETIME2,
        priority NVARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
        notes NVARCHAR(1000),
        created_by UNIQUEIDENTIFIER,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE(),
        
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
    );
    
    CREATE INDEX IX_grocery_items_category ON grocery_items(category_id);
    CREATE INDEX IX_grocery_items_created_by ON grocery_items(created_by);
END
GO

-- Create Finance Entries table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='finance_entries' AND xtype='U')
BEGIN
    CREATE TABLE finance_entries (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        description NVARCHAR(255) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        type NVARCHAR(20) NOT NULL, -- 'income', 'expense', 'transfer'
        category_id UNIQUEIDENTIFIER,
        transaction_date DATE NOT NULL,
        tags NVARCHAR(500), -- JSON array of tags
        receipt_url NVARCHAR(500),
        notes NVARCHAR(1000),
        created_by UNIQUEIDENTIFIER,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE(),
        
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
    );
    
    CREATE INDEX IX_finance_entries_type ON finance_entries(type);
    CREATE INDEX IX_finance_entries_date ON finance_entries(transaction_date);
    CREATE INDEX IX_finance_entries_created_by ON finance_entries(created_by);
END
GO

-- Create Reminders table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='reminders' AND xtype='U')
BEGIN
    CREATE TABLE reminders (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(1000),
        due_date DATETIME2 NOT NULL,
        priority NVARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
        is_completed BIT DEFAULT 0,
        completed_at DATETIME2,
        reminder_type NVARCHAR(50) DEFAULT 'general', -- 'general', 'recurring'
        recurrence_pattern NVARCHAR(100), -- JSON for recurring reminders
        created_by UNIQUEIDENTIFIER,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE(),
        
        FOREIGN KEY (created_by) REFERENCES users(id)
    );
    
    CREATE INDEX IX_reminders_due_date ON reminders(due_date);
    CREATE INDEX IX_reminders_created_by ON reminders(created_by);
END
GO

-- Create Tasks table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tasks' AND xtype='U')
BEGIN
    CREATE TABLE tasks (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(1000),
        status NVARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
        priority NVARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
        due_date DATETIME2,
        completed_at DATETIME2,
        estimated_duration INT, -- in minutes
        actual_duration INT, -- in minutes
        tags NVARCHAR(500), -- JSON array of tags
        created_by UNIQUEIDENTIFIER,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE(),
        
        FOREIGN KEY (created_by) REFERENCES users(id)
    );
    
    CREATE INDEX IX_tasks_status ON tasks(status);
    CREATE INDEX IX_tasks_due_date ON tasks(due_date);
    CREATE INDEX IX_tasks_created_by ON tasks(created_by);
END
GO

-- Create Audit Log table for tracking changes
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='audit_log' AND xtype='U')
BEGIN
    CREATE TABLE audit_log (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        table_name NVARCHAR(100) NOT NULL,
        record_id UNIQUEIDENTIFIER NOT NULL,
        action NVARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
        old_values NVARCHAR(MAX), -- JSON
        new_values NVARCHAR(MAX), -- JSON
        changed_by UNIQUEIDENTIFIER,
        changed_at DATETIME2 DEFAULT GETUTCDATE(),
        
        FOREIGN KEY (changed_by) REFERENCES users(id)
    );
    
    CREATE INDEX IX_audit_log_table_record ON audit_log(table_name, record_id);
    CREATE INDEX IX_audit_log_changed_at ON audit_log(changed_at);
END
GO

-- Insert default categories
IF NOT EXISTS (SELECT * FROM categories WHERE type = 'grocery')
BEGIN
    INSERT INTO categories (name, type, icon, description) VALUES
    ('Fruits', 'grocery', '🍎', 'Fresh and dried fruits'),
    ('Vegetables', 'grocery', '🥕', 'Fresh vegetables and greens'),
    ('Dairy Products', 'grocery', '🥛', 'Milk, cheese, yogurt and dairy items'),
    ('Meat & Poultry', 'grocery', '🥩', 'Fresh and frozen meat products'),
    ('Grains & Cereals', 'grocery', '🌾', 'Rice, wheat, oats and grain products'),
    ('Snacks', 'grocery', '🍿', 'Chips, crackers and snack foods'),
    ('Beverages', 'grocery', '🥤', 'Drinks, juices and beverages'),
    ('Condiments & Spices', 'grocery', '🧂', 'Sauces, spices and seasonings'),
    ('Frozen Foods', 'grocery', '🧊', 'Frozen meals and frozen items'),
    ('Household Items', 'grocery', '🧽', 'Cleaning supplies and household goods'),
    ('Other', 'grocery', '📦', 'Miscellaneous grocery items');
END
GO

IF NOT EXISTS (SELECT * FROM categories WHERE type = 'finance')
BEGIN
    INSERT INTO categories (name, type, icon, description) VALUES
    ('Food & Dining', 'finance', '🍽️', 'Restaurant meals and food delivery'),
    ('Transportation', 'finance', '🚗', 'Gas, public transport, rideshare'),
    ('Utilities', 'finance', '💡', 'Electricity, water, internet, phone'),
    ('Entertainment', 'finance', '🎬', 'Movies, games, subscriptions'),
    ('Healthcare', 'finance', '🏥', 'Medical expenses and insurance'),
    ('Shopping', 'finance', '🛍️', 'Clothing, electronics, general shopping'),
    ('Education', 'finance', '📚', 'Books, courses, training'),
    ('Salary', 'finance', '💰', 'Primary income from employment'),
    ('Freelance', 'finance', '💼', 'Freelance and contract work'),
    ('Investment', 'finance', '📈', 'Investment returns and dividends'),
    ('Other Income', 'finance', '💵', 'Other sources of income'),
    ('Other Expense', 'finance', '💸', 'Miscellaneous expenses');
END
GO

PRINT 'Database schema created successfully!';