# Requirements Document

## Introduction

The Assets screen currently displays placeholder investment cards (like "Muthoot Finance" and "Cohance Lifesciences") with a specific design and layout, but when users add their own assets, these are displayed using a different component (`UnifiedAssetCard`) that has different styling, layout, and visual appearance. This creates an inconsistent user experience where placeholder cards look polished and professional, while user assets look different and less refined.

## Requirements

### Requirement 1

**User Story:** As a user viewing my assets, I want all asset cards (both placeholder and my actual assets) to have the exact same visual design, layout, and styling, so that the interface looks consistent and professional.

#### Acceptance Criteria

1. WHEN I view the Assets screen THEN all asset cards SHALL use identical layout structure with header, chart section, and stats section
2. WHEN I view the Assets screen THEN all asset cards SHALL use identical color schemes, typography, spacing, and visual elements
3. WHEN I view the Assets screen THEN all asset cards SHALL have the same card dimensions, border radius, shadows, and background colors
4. WHEN I view the Assets screen THEN all asset cards SHALL display company icons, names, prices, and change percentages in identical positions and styles

### Requirement 2

**User Story:** As a user, I want my actual assets to display the same detailed information layout as the placeholder cards, so that I can easily compare and analyze all my investments consistently.

#### Acceptance Criteria

1. WHEN I view my actual assets THEN they SHALL display the same chart layout with Y-axis labels positioned identically to placeholder cards
2. WHEN I view my actual assets THEN they SHALL show the same stats section layout with identical spacing and typography
3. WHEN I view my actual assets THEN they SHALL display the same insight text section at the bottom with identical styling
4. WHEN I view my actual assets THEN they SHALL use the same price formatting, change indicators, and color coding as placeholder cards

### Requirement 3

**User Story:** As a user, I want the transition between placeholder cards and my actual assets to be seamless, so that the interface feels cohesive and well-designed.

#### Acceptance Criteria

1. WHEN placeholder cards and actual asset cards are displayed together THEN they SHALL be visually indistinguishable in terms of layout and styling
2. WHEN I scroll through the assets list THEN all cards SHALL maintain consistent visual rhythm and spacing
3. WHEN I interact with any asset card THEN they SHALL have identical touch feedback and interaction states
4. WHEN asset data is loading or unavailable THEN fallback displays SHALL maintain the same visual structure as complete cards