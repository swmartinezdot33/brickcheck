# Phase Roadmap

## MVP (Current Phase)

### Completed Features
- ✅ User authentication (Supabase Auth)
- ✅ Collection management (add, edit, delete items)
- ✅ Set search with autocomplete
- ✅ Barcode scanning (web camera)
- ✅ Price tracking structure
- ✅ Pricing engine algorithm
- ✅ Price history charts
- ✅ Alert system (CRUD + evaluation)
- ✅ Nightly price refresh cron job
- ✅ Dashboard with collection stats

### Current Implementation Status
- **Data Sources**: Using mock providers (Brickset and BrickLink structure ready)
- **Pricing**: Mock price data with realistic algorithms
- **Mobile**: Web-first, PWA-ready

### Next Steps for MVP Completion
1. Integrate real Brickset API for set metadata
2. Integrate real BrickLink API for pricing data
3. Test end-to-end flows
4. Deploy to production

---

## v1 Mobile

### Goals
- Native mobile app experience
- Improved camera scanning
- Push notifications for alerts
- Basic offline support

### Implementation Options

#### Option A: Capacitor (Fastest Path)
- **Pros**: Fastest to implement, reuses existing web code
- **Cons**: Limited native features, web wrapper feel
- **Timeline**: 1-2 weeks
- **Steps**:
  1. Install Capacitor
  2. Configure iOS/Android projects
  3. Add camera permissions
  4. Build and test

#### Option B: Expo (Best Long-term)
- **Pros**: Better native integration, easier push notifications, better offline support
- **Cons**: Requires more refactoring, larger bundle size
- **Timeline**: 3-4 weeks
- **Steps**:
  1. Set up Expo project
  2. Migrate components to Expo-compatible versions
  3. Implement native camera module
  4. Add push notification service
  5. Build and test

### Recommendation
Start with **Capacitor** for fastest path to mobile, then evaluate Expo if native features become critical.

---

## v2 Marketplace Integrations

### Additional Data Sources
1. **StockX** (if official API access)
   - High-end set pricing
   - Sneaker-style marketplace data
   - Requires API partnership

2. **eBay** (if official API)
   - Sold comps data
   - Broader market coverage
   - Requires API credentials

3. **BrickLink** (enhanced)
   - Already integrated structure
   - Add historical data access
   - Add more granular pricing tiers

### Advanced Features
- **Multi-source price blending**: Combine data from multiple sources with confidence weighting
- **Advanced analytics**: 
  - Price prediction models
  - Market trend analysis
  - Collection ROI tracking
- **Social features**:
  - Share collection
  - Compare with friends
  - Community price discussions

---

## Technical Debt & Improvements

### Short-term
- [ ] Add comprehensive error handling
- [ ] Implement rate limiting for API routes
- [ ] Add request caching layer
- [ ] Improve loading states and skeletons
- [ ] Add unit tests for pricing engine
- [ ] Add integration tests for API routes

### Medium-term
- [ ] Implement email notifications for alerts
- [ ] Add collection export/import
- [ ] Improve barcode mapping accuracy
- [ ] Add set image uploads
- [ ] Implement collection sharing

### Long-term
- [ ] Machine learning price predictions
- [ ] Advanced filtering and search
- [ ] Collection analytics dashboard
- [ ] Mobile app with offline sync
- [ ] API for third-party integrations

---

## Success Metrics

### MVP
- [ ] 100+ sets in database
- [ ] 10+ active users
- [ ] 90%+ uptime
- [ ] <2s page load times

### v1 Mobile
- [ ] 50+ mobile app downloads
- [ ] 70%+ retention rate
- [ ] <3s app launch time

### v2
- [ ] 1000+ sets tracked
- [ ] 100+ active users
- [ ] 95%+ price data accuracy
- [ ] Multiple data source integration

