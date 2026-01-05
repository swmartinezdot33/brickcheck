# Debugging Search Issues

## Current Problem
Searches are not returning real data from APIs.

## Debugging Steps

### 1. Check Server Logs
When you search, check your server console (where `npm run dev` is running) for:
- `[searchSets] Searching for: "..."`
- `[searchSets] Calling API providers...`
- `[BrickEconomyProvider]` or `[BricksetProvider]` logs
- Any error messages

### 2. Check API Configuration
Verify environment variables are set:
```bash
# Check local
echo $BRICKECONOMY_API_KEY
echo $BRICKSET_API_KEY

# Check Vercel (production)
npx vercel env ls | grep -i brick
```

### 3. Test APIs Directly
Run the test script:
```bash
npx tsx test-apis.ts
```

This will test each API individually and show what's working.

### 4. Check Browser Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Search for a set
4. Look for `/api/searchSets?q=...` request
5. Check the response - does it have results or errors?

### 5. Common Issues

#### Issue: API returns empty results
- **BrickEconomy**: Check if API key is valid and not rate-limited
- **Brickset**: May need userHash (username/password) for full functionality
- **Response format**: APIs might return data in different structure than expected

#### Issue: API errors silently
- Check server logs for detailed error messages
- APIs might be failing but errors are caught and ignored

#### Issue: Rate limiting
- BrickEconomy: 4 req/min, 100/day
- If quota exceeded, requests will fail

## Next Steps

1. Check server logs when searching
2. Share the error messages you see
3. Test with a known set number (e.g., "75192")
4. Verify API keys are set correctly





