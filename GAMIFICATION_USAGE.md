# Gamification System Usage Guide

## 📚 Configuration Files

The gamification system is completely based on configuration files that can be updated without changing code:

### 1. Events (`src/config/gamification/events.ts`)

Defines all possible events and their XP reward:

```typescript
export const GAME_EVENTS: Record<string, GameEvent> = {
  'cv.section_added': {
    id: 'cv.section_added',
    name: 'Section Added',
    description: 'You added a new section to your CV',
    xpReward: 25,
    category: 'cv',
  },
  // ... more events
};
```

**To add a new event:**
1. Add the entry in `GAME_EVENTS`
2. The system will automatically recognize it

### 2. Levels (`src/config/gamification/levels.ts`)

Defines all available levels:

```typescript
export const LEVELS: Level[] = [
  {
    id: 'novice',
    name: 'Novice',
    description: 'Complete your profile to start your journey.',
    icon: 'check_circle',
    requiredXp: 0,
    order: 1,
    color: '#1e8e3e',
  },
  // ... more levels
];
```

**To add a new level:**
1. Add the entry in `LEVELS` with the correct `order`
2. The system will automatically calculate the user's level

### 3. Badges (`src/config/gamification/badges.ts`)

Defines all badges and their requirements:

```typescript
export const BADGES: Badge[] = [
  {
    id: 'profile_complete',
    name: 'Profile Complete',
    description: 'You completed all sections...',
    icon: 'shield',
    iconColor: '#db2777',
    requirements: [
      { eventId: 'profile.completed', count: 1 },
    ],
  },
  // ... more badges
];
```

**To add a new badge:**
1. Add the entry in `BADGES`
2. Define the requirements as an array of `{ eventId, count }`
3. The system will automatically verify if it is met

## 🎮 Usage in Code

### Record an Event

When a user completes an action, record the event:

```typescript
import { useGamification } from '@/hooks/useGamification';

function MyComponent() {
  const { recordEvent } = useGamification();

  const handleAddSection = async () => {
    // Your logic here...
    
    // Record the event
    await recordEvent('cv.section_added');
    
    // The system automatically:
    // - Grants XP to the user
    // - Checks if they leveled up
    // - Checks if they earned any badge
  };
}
```

### Get User Progress

```typescript
const response = await fetch('/api/gamification/progress');
const progress = await response.json();

// progress contains:
// - xp: total number of XP
// - level: current level
// - nextLevel: next level
// - progress: percentage towards next level
// - earnedBadges: array of earned badge IDs
// - badgeProgress: object with progress of each badge
// - eventCounts: count of each event type
```

## 📊 Database Structure

### Table `user_events`
Records each event that occurs:
- `user_id`: User ID
- `event_id`: Event ID
- `xp_earned`: XP granted
- `created_at`: Date of event

### Table `user_badges`
Records earned badges:
- `user_id`: User ID
- `badge_id`: Badge ID
- `earned_at`: Date earned

### Table `profiles` (updated)
- `xp`: Total user XP (calculated automatically)
- `level`: Current level (calculated automatically)

## 🔄 Automatic Flow

1. **User performs action** → `recordEvent('event.id')` is called
2. **System records event** → Inserted into `user_events`
3. **Trigger updates XP** → `profiles.xp` and `profiles.level` are updated
4. **System verifies badges** → Requirements are compared with events
5. **If badge earned** → Inserted into `user_badges`
6. **If level up** → Returns `levelUp: true` (for animation)

## 🎨 Customization

### Add a New Event

1. Edit `src/config/gamification/events.ts`
2. Add the event with its XP:
```typescript
'new.event.id': {
  id: 'new.event.id',
  name: 'Event Name',
  description: 'Description',
  xpReward: 50,
  category: 'cv',
},
```

### Add a New Level

1. Edit `src/config/gamification/levels.ts`
2. Add the level with its required XP:
```typescript
{
  id: 'new_level',
  name: 'New Level',
  description: 'Description',
  icon: 'icon_name',
  requiredXp: 10000,
  order: 9, // Next number
  color: '#color',
},
```

### Add a New Badge

1. Edit `src/config/gamification/badges.ts`
2. Add the badge with its requirements:
```typescript
{
  id: 'new_badge',
  name: 'New Badge',
  description: 'Description',
  icon: 'icon_name',
  iconColor: '#color',
  requirements: [
    { eventId: 'event.id', count: 5 },
    { eventId: 'other.event', count: 3 },
  ],
},
```

## 🚀 Next Steps

Animations (CVP-22, CVP-23) will be implemented later to show:
- Toast when XP is earned
- Animation when leveling up
- Animation when a badge is earned
