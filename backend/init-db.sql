-- Work Redesign Platform Database Initialization
-- This script sets up the initial database configuration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create additional schemas if needed
-- CREATE SCHEMA IF NOT EXISTS analytics;
-- CREATE SCHEMA IF NOT EXISTS logs;

-- Set timezone
SET timezone = 'Asia/Seoul';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE work_redesign TO workredesign;

-- Log initialization
SELECT 'Work Redesign Platform Database Initialized Successfully' AS message;