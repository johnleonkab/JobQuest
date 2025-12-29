-- Migration script to add company_website column to job_offers table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_offers' AND column_name = 'company_website') THEN
        ALTER TABLE job_offers
        ADD COLUMN company_website TEXT;
        RAISE NOTICE 'Column company_website added to job_offers table.';
    ELSE
        RAISE NOTICE 'Column company_website already exists in job_offers table.';
    END IF;
END
$$;

