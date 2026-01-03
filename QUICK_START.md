# Quick Start Guide

## ✅ Setup Complete!

Your database has been seeded with sample LEGO sets. Here's how to use everything:

## 🔍 How to Search and Add Sets

### Method 1: Search by Name or Set Number

1. **Go to Collection page**: http://localhost:3000/collection
2. **Click on "Search & Add" tab** (if not already selected)
3. **Type in the search box**:
   - Try: `75192` (Millennium Falcon)
   - Try: `Millennium` (searches by name)
   - Try: `Titanic` (searches by name)
   - Try: `Disney` (searches by theme)
4. **Click on a result** - The "Add to Collection" modal will open
5. **Fill in the form**:
   - Select condition (Sealed or Used)
   - Enter quantity
   - (Optional) Add acquisition cost, date, notes
6. **Click "Add to Collection"**

### Method 2: Scan Barcode

1. **Go to Scan page**: http://localhost:3000/scan
2. **Click "Start Scanning"**
3. **Allow camera access** when prompted
4. **Point camera at a barcode**
5. **When detected**, you'll see the set details
6. **Click "Add to Collection"** button

**Note**: For testing, you can use these sample GTINs:
- `57020161175192` (Millennium Falcon)
- `57020161171040` (Disney Castle)
- `57020161110294` (Titanic)

## 📊 Available Sample Sets

The database now has these sets you can search for:

1. **75192** - Millennium Falcon (Star Wars, 2017)
2. **71040** - Disney Castle (Disney, 2016) - Retired
3. **10294** - Titanic (Icons, 2021)
4. **21327** - Typewriter (Ideas, 2021) - Retired
5. **10279** - Volkswagen T2 Camper Van (Icons, 2021)

## 🎯 Testing Checklist

- [ ] Search for "75192" - should show Millennium Falcon
- [ ] Click on result - modal should open
- [ ] Add set to collection - should work
- [ ] Go to "My Collection" tab - should see your added set
- [ ] Try scanning (if camera works) - should detect barcode
- [ ] View dashboard - should show collection stats

## 🐛 Troubleshooting

### Search not showing results?
- Make sure you're logged in
- Check browser console (F12) for errors
- Try searching for exact set numbers: `75192`, `71040`, `10294`

### Camera not working?
- Make sure you're on HTTPS (production) or localhost
- Check browser permissions (Settings → Site Settings → Camera)
- Try a different browser (Chrome/Firefox work best)

### Can't add to collection?
- Make sure you're logged in
- Check that the set has an ID (should be automatic)
- Check browser console for API errors

## 🔗 Quick Links

- **Collection**: http://localhost:3000/collection
- **Scan**: http://localhost:3000/scan
- **Dashboard**: http://localhost:3000/dashboard
- **Settings**: http://localhost:3000/settings

## 💡 Tips

- Search works with partial matches (e.g., "mill" finds "Millennium")
- You can add the same set multiple times with different conditions
- The dashboard shows your total collection value (once you add sets)

