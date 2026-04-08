# Pseudocode: Share Card Generation

## Algorithm: generateShareCard

```
INPUT: analysis: Analysis, user: User
OUTPUT: ShareCard

STEPS:
1. SELECT roast text from analysis
2. PREPARE category display:
   - FOR EACH top-3 category:
     - Replace amount with emoji bar (█ per 10% of total)
     - Keep category name + icon visible
3. BUILD share card data:
   - Header: cleo-rf logo
   - Body: roast text (100-300 chars)
   - Categories: name + emoji bars (no amounts)
   - Footer: referral CTA
4. GENERATE referral_link: "cleorf.app/r/{user.referralCode}"
5. BUILD share URLs:
   - VK: "https://vk.com/share.php?url={referralLink}"
   - Telegram: "https://t.me/share/url?url={referralLink}&text={roastText}"
   - Copy: referralLink
6. CREATE ShareCard record in DB
7. RETURN ShareCard with URLs
```

## Data Flow

```
POST /api/share { analysis_id }
  → Verify user owns analysis
  → Load analysis (roast text + categories)
  → Load user (referral code)
  → Build blurred category display
  → Generate share URLs
  → Save ShareCard to DB
  → Return { image_url, referral_link, share_urls }
```

## Emoji Bar Generation

```
INPUT: amount: number, totalExpense: number
OUTPUT: string (emoji bar)

percentage = abs(amount) / abs(totalExpense) * 100
barLength = Math.round(percentage / 10)
bar = '█'.repeat(barLength) + '░'.repeat(10 - barLength)
RETURN bar
```
