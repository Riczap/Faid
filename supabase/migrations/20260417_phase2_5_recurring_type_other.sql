DO $$
DECLARE
    row record;
BEGIN
    FOR row IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.recurring_charges'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) LIKE '%type%'
    LOOP
        EXECUTE 'ALTER TABLE public.recurring_charges DROP CONSTRAINT ' || quote_ident(row.conname);
    END LOOP;
END;
$$;

ALTER TABLE public.recurring_charges ADD CONSTRAINT recurring_charges_type_check 
CHECK (type IN ('subscription', 'service', 'expense', 'other'));
