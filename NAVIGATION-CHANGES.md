# Navigation & IA Changes - March 2, 2026

## Summary

Implemented new 5-tab navigation structure based on Apple Health research and IA spec.

## Changes Made

### 1. Tab Bar (`app/(tabs)/_layout.tsx`)
- **Reordered tabs**: Home → InGauge → Circle → Explore → Me
- **Renamed "Talk" to "InGauge"** in tab bar
- **Renamed "Manual" to "Explore"** in tab bar
- Added unique accent colors per tab:
  - Home: Green (#4ADE80)
  - InGauge: Purple (#7C4DFF)
  - Circle: Pink (#EC4899)
  - Explore: Blue (#3B82F6)
  - Me: Amber (#F59E0B)
- Added subtle highlight background on active tab icons

### 2. InGauge Tab (`app/(tabs)/talk.tsx`)
- Renamed header from "Talk to Gauge" to "InGauge"
- Added Quick Actions bar:
  - 🎯 Prompts → opens Prompt Generator
  - 🔧 Tools → goes to Explore tab
  - 🎙️ Voice → switches to voice input
- Added Context Bar showing current gauge values (Body, State, Emotion)
- Context bar is tappable → goes to Home

### 3. Circle Tab (`app/(tabs)/circle.tsx`)
- Added Heart Mail integration
- New Heart Mail banner at top:
  - Shows unread count badge
  - Tappable → opens inbox
- Added "Heart Mail" button in member expand section
- Added pink accent styling for Heart Mail elements

### 4. Heart Mail Modals (NEW)
- `app/(modals)/heart-inbox.tsx` - View received messages
  - Tabs: Inbox / Sent / Drafts
  - Unread badge indicators
  - Pull to refresh
  
- `app/(modals)/heart-compose.tsx` - Write new Heart Mail
  - Recipient picker from Circle
  - Note type selection (General, Gratitude, Encouragement, etc.)
  - Send type options:
    - Open (they see who sent it)
    - Anonymous (from "someone in your Circle")
    - Soft Share (accept before seeing)
  - Save as draft option
  
- `app/(modals)/heart-view.tsx` - View single message
  - Full message display
  - Response capability

### 5. Me Tab (`app/(tabs)/me.tsx`)
- Added new "Sharing" section with:
  - Therapist Share (prominent placement)
  - Personology Profile

## New Files Created
- `app/(modals)/heart-inbox.tsx`
- `app/(modals)/heart-compose.tsx`
- `app/(modals)/heart-view.tsx`
- `ingauge-NAVIGATION-IA-SPEC.md` (full IA documentation)
- `NAVIGATION-CHANGES.md` (this file)

## Mental Model

The new navigation follows this mental model:
- **Home** = Present moment (status, check-in)
- **InGauge** = AI companion (talk, process)
- **Circle** = Relationships (connect, share)
- **Explore** = Tools & learning (discover, grow)
- **Me** = Personal data (understand, history)

## Next Steps
1. Test all navigation flows
2. Ensure Heart Mail store integration works with Supabase
3. Consider adding search to Explore tab
4. Add notification badges for Circle/Heart Mail
