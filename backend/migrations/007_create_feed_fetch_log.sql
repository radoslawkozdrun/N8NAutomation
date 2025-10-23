-- Create feed_fetch_log table for tracking RSS feed fetch operations
-- Migration: 007_create_feed_fetch_log.sql

CREATE TABLE IF NOT EXISTS feed_fetch_log (
    id SERIAL PRIMARY KEY,
    fetching_number INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    total_feeds INTEGER DEFAULT 0,
    valid_feeds INTEGER DEFAULT 0,
    invalid_feeds INTEGER DEFAULT 0,
    error_message TEXT,
    request_data JSONB, -- Store request details (selected feeds, user, etc.)
    response_data JSONB, -- Store response details from N8N webhook
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feed_fetch_log_status ON feed_fetch_log(status);
CREATE INDEX IF NOT EXISTS idx_feed_fetch_log_started_at ON feed_fetch_log(started_at);
CREATE INDEX IF NOT EXISTS idx_feed_fetch_log_user_id ON feed_fetch_log(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_fetch_log_fetching_number ON feed_fetch_log(fetching_number);

-- Add updated_at trigger
CREATE TRIGGER update_feed_fetch_log_updated_at
    BEFORE UPDATE ON feed_fetch_log
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data for testing
INSERT INTO feed_fetch_log (
    fetching_number,
    started_at,
    completed_at,
    status,
    total_feeds,
    valid_feeds,
    invalid_feeds,
    request_data,
    response_data
) VALUES
(1001, '2023-01-15 10:00:00', '2023-01-15 10:05:00', 'completed', 100, 95, 5,
 '{"fetchType": "ALL", "user": "admin"}',
 '{"message": "Fetch completed successfully", "processed": 100}'
),
(1002, '2023-01-15 11:00:00', '2023-01-15 11:05:00', 'completed', 100, 98, 2,
 '{"fetchType": "SELECTED", "ids": [1,2,3], "user": "admin"}',
 '{"message": "Fetch completed successfully", "processed": 100}'
),
(1003, '2023-01-15 12:00:00', '2023-01-15 12:05:00', 'failed', 100, 0, 100,
 '{"fetchType": "ALL", "user": "admin"}',
 '{"error": "Network timeout", "processed": 0}'
),
(1004, '2023-01-15 13:00:00', '2023-01-15 13:05:00', 'completed', 100, 97, 3,
 '{"fetchType": "ALL", "user": "admin"}',
 '{"message": "Fetch completed successfully", "processed": 100}'
),
(1005, '2023-01-15 14:00:00', '2023-01-15 14:05:00', 'completed', 100, 99, 1,
 '{"fetchType": "SELECTED", "ids": [1,2], "user": "admin"}',
 '{"message": "Fetch completed successfully", "processed": 100}'
),
(1006, '2023-01-15 15:00:00', '2023-01-15 15:05:00', 'completed', 100, 96, 4,
 '{"fetchType": "ALL", "user": "admin"}',
 '{"message": "Fetch completed successfully", "processed": 100}'
);

-- Add comment to document the table purpose
COMMENT ON TABLE feed_fetch_log IS 'Tracks RSS feed fetch operations including timing, status, and results';
COMMENT ON COLUMN feed_fetch_log.fetching_number IS 'Unique incremental number for each fetch operation';
COMMENT ON COLUMN feed_fetch_log.status IS 'Current status of the fetch operation: pending, completed, failed';
COMMENT ON COLUMN feed_fetch_log.request_data IS 'JSON data about the fetch request (user, selected feeds, etc.)';
COMMENT ON COLUMN feed_fetch_log.response_data IS 'JSON data about the fetch response from N8N or error details';