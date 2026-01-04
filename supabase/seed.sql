-- Seed script for development
-- This will be populated with sample data in the seed.ts script

-- Sample sets (popular LEGO sets for testing)
INSERT INTO sets (set_number, name, theme, year, piece_count, msrp_cents, retired, image_url) VALUES
  ('75192', 'Millennium Falcon', 'Star Wars', 2017, 7541, 84999, false, NULL),
  ('71040', 'Disney Castle', 'Disney', 2016, 4080, 34999, true, NULL),
  ('10294', 'Titanic', 'Icons', 2021, 9090, 67999, false, NULL),
  ('21327', 'Typewriter', 'Ideas', 2021, 2079, 19999, true, NULL),
  ('10279', 'Volkswagen T2 Camper Van', 'Icons', 2021, 2207, 17999, false, NULL)
ON CONFLICT (set_number) DO NOTHING;

-- Sample set identifiers (GTINs)
-- Note: These are example GTINs - real ones would come from Brickset API
INSERT INTO set_identifiers (set_id, identifier_type, identifier_value, source)
SELECT s.id, 'GTIN', '570201611' || s.set_number, 'MANUAL'
FROM sets s
WHERE s.set_number IN ('75192', '71040', '10294', '21327', '10279')
ON CONFLICT (identifier_value) DO NOTHING;



