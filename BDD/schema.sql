-- =========================
-- Schema: MyBudget (PostgreSQL)

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    label VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    amount NUMERIC(10,2) NOT NULL,
    label VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    category_id INT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT check_type CHECK (type IN ('income', 'expense')),
    CONSTRAINT check_amount_positive CHECK (amount > 0),

    CONSTRAINT fk_transaction_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE SET NULL
);

CREATE TABLE budgets (
    budget_id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    allocated_amount NUMERIC(10,2) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT check_allocated_positive CHECK (allocated_amount > 0),
    CONSTRAINT check_period_valid CHECK (period_end > period_start),

    CONSTRAINT fk_budget_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_budget_period
        UNIQUE (category_id, period_start, period_end)
);

CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_budgets_period ON budgets(period_start, period_end);
CREATE INDEX idx_budgets_category ON budgets(category_id);

-- Trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- View: budget status
CREATE OR REPLACE VIEW budget_status AS
SELECT
    b.budget_id,
    c.label AS category,
    b.allocated_amount,
    b.period_start,
    b.period_end,
    COALESCE(SUM(t.amount), 0) AS spent_amount,
    b.allocated_amount - COALESCE(SUM(t.amount), 0) AS remaining_amount,
    ROUND((COALESCE(SUM(t.amount), 0) * 100.0) / b.allocated_amount, 2) AS percent_used,
    CASE
        WHEN COALESCE(SUM(t.amount), 0) > b.allocated_amount THEN 'OVER_BUDGET'
        WHEN COALESCE(SUM(t.amount), 0) > b.allocated_amount * 0.8 THEN 'WARNING'
        ELSE 'OK'
    END AS status
FROM budgets b
JOIN categories c ON b.category_id = c.category_id
LEFT JOIN transactions t
    ON t.category_id = b.category_id
    AND t.type = 'expense'
    AND t.transaction_date >= b.period_start
    AND t.transaction_date < (b.period_end + 1)
WHERE b.period_end >= CURRENT_DATE
GROUP BY b.budget_id, c.label, b.allocated_amount, b.period_start, b.period_end
ORDER BY b.period_start DESC;

-- Sample data
INSERT INTO categories (label, type) VALUES
    ('Loisirs'),
    ('Transports'),
    ('Maison'),
    ('Alimentation'),
    ('Salaire');

INSERT INTO transactions (amount, label, type, category_id) VALUES
    (2500.00, 'Salaire Janvier26', 'income', 5),
    (150.50, 'Courses', 'expense', 4),
    (45.00, 'Essence', 'expense', 2);

INSERT INTO budgets (category_id, allocated_amount, period_start, period_end) VALUES
    (4, 400.00, '2026-01-01', '2026-01-31'),
    (2, 150.00, '2026-01-01', '2026-01-31'),
    (5, 10000.00, '2026-01-01', '2026-01-31');
