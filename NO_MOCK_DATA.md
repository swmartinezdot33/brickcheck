# No Mock Data Policy

## ✅ All Mock Data Removed

This application **NO LONGER uses any mock data**. All data must come from real APIs.

## Required API Configuration

### Catalog Provider (Set Metadata)
You must configure **at least one** of:
- `BRICKECONOMY_API_KEY` (preferred - provides both catalog and pricing)
- `BRICKSET_API_KEY` (alternative - requires userHash for full functionality)

### Price Provider (Pricing Data)
You must configure **at least one** of:
- `BRICKECONOMY_API_KEY` (preferred - provides both catalog and pricing)
- All BrickLink credentials:
  - `BRICKLINK_CONSUMER_KEY`
  - `BRICKLINK_CONSUMER_SECRET`
  - `BRICKLINK_TOKEN`
  - `BRICKLINK_TOKEN_SECRET`

## What Happens If APIs Aren't Configured?

- **Search**: Returns error message "Catalog API not available"
- **Barcode Scan**: Returns error message "Catalog API not available"
- **Price Refresh**: Returns error message "Price API not configured"
- **No Mock Data**: The app will NOT fall back to mock data

## Error Messages

Users will see clear error messages like:
- "No catalog API configured. Please configure BRICKECONOMY_API_KEY or BRICKSET_API_KEY."
- "No price API configured. Please configure BRICKECONOMY_API_KEY or BrickLink credentials."

## Benefits

✅ **Real Data Only**: All data comes from authoritative sources
✅ **Accurate Information**: No fake or outdated mock data
✅ **Production Ready**: App behaves the same in development and production
✅ **Clear Errors**: Users know exactly what needs to be configured

## Migration Notes

If you were previously using mock data:
1. Configure at least one catalog API (BrickEconomy or Brickset)
2. Configure at least one price API (BrickEconomy or BrickLink)
3. Restart your dev server
4. The app will now use real APIs only





