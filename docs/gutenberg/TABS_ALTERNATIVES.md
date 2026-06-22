# Alternatives to DIVI Tabs in Gutenberg

## Overview

**CRITICAL GAP:** Gutenberg has NO native tabs block. The `et_pb_tabs` shortcode is a core DIVI feature with **no direct WordPress Gutenberg equivalent**. This document provides practical solutions.

**Site Impact:** 12 DIVI tab modules used (primarily for event listings)

## Problem Statement

### DIVI Tabs Module
```
[et_pb_tabs]
  [et_pb_tab title="Tab 1"]Content 1[/et_pb_tab]
  [et_pb_tab title="Tab 2"]Content 2[/et_pb_tab]
  [et_pb_tab title="Tab 3"]Content 3[/et_pb_tab]
[/et_pb_tabs]
```

### Why Gutenberg Doesn't Have Tabs

- **Philosophy Difference** - Gutenberg blocks are simpler, single-purpose
- **JavaScript Heavy** - Tabs require complex JavaScript for tab switching
- **Accessibility Complexity** - Proper tab implementation requires specific ARIA attributes
- **Multiple Solutions** - No "one right way" to do tabs; plugins offer different approaches

---

## Solution Options (Ranked by Recommendation)

### Option 1: Premium Block Plugin (RECOMMENDED)

Use a third-party block plugin that includes tabs. Best for:
- Extensive tab usage
- Need for professional support
- Want built-in styling options
- Future-proof solution

#### Best Tab Plugins

**1. Kadence Blocks (RECOMMENDED)**
- **Cost:** Free + Premium ($49+/year)
- **Tab Features:** Full-featured tabs block
- **Pros:**
  - Excellent documentation
  - Active development
  - Free version is solid
  - Great performance
  - Responsive design
  - Accessibility-focused
- **Cons:**
  - Premium features cost money
  - Adds plugin dependency
- **Setup:** Install via WordPress.org
- **When to Use:** Best overall choice for this site

**2. Advanced Blocks**
- **Cost:** Free ($79+/year for premium)
- **Tab Features:** Advanced tabs with animations
- **Pros:**
  - Many block options
  - Good documentation
  - Active support
- **Cons:**
  - Steeper learning curve
  - Premium locked features
- **Setup:** Install via WordPress.org
- **When to Use:** If you want advanced animations

**3. GenerateBlocks**
- **Cost:** Free ($99+/year for premium)
- **Tab Features:** Simple, clean tabs
- **Pros:**
  - Lightweight
  - Great for custom styling
  - Good community
- **Cons:**
  - Fewer features than Kadence
  - Premium locked features
- **Setup:** Install via WordPress.org
- **When to Use:** Simple tabs, minimal overhead

**4. CoBlocks**
- **Cost:** Free ($99+/year for premium)
- **Tab Features:** Basic tabs functionality
- **Pros:**
  - Good block set
  - Community-friendly
  - Open source friendly
- **Cons:**
  - Basic feature set
  - Less actively maintained
- **Setup:** Install via WordPress.org
- **When to Use:** Simple needs, open source preference

---

### Option 2: Free Lightweight Plugin

If budget is tight or minimal additional plugins needed:

#### Simple Custom Tabs Plugin (Free)

**Plugin:** "Tabs" by Webnumbr (or similar)
- **Cost:** Free
- **Cons:** Limited features, minimal support
- **When to Use:** Very simple tab needs only
- **Setup:**
  1. Go to WordPress.org plugin directory
  2. Search "tabs block"
  3. Find simple, lightweight option
  4. Install and activate

---

### Option 3: Custom Block Development

For maximum control and minimal dependencies:

**Pros:**
- Complete customization
- No plugin dependencies
- Exactly what you need
- Future-proof

**Cons:**
- Requires development knowledge
- More time and cost
- Maintenance responsibility
- Testing complexity

**Estimated Effort:**
- Simple tabs block: 4-6 hours developer time
- Advanced features: 8-12 hours
- Testing and refinement: 2-4 hours

**Decision:** Only recommend if:
1. You have developer resources
2. Need very specific functionality
3. Want long-term control
4. Plan to use extensively (justifies investment)

---

### Option 4: Manual Workarounds

Simple solutions using existing Gutenberg blocks:

#### Workaround A: Accordion Block
```html
<!-- wp:heading {"level":3} -->
<h3 onclick="toggle(this)">Tab 1 (Click to expand)</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<div id="tab1" style="display:none;">Content 1</div>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 onclick="toggle(this)">Tab 2 (Click to expand)</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<div id="tab2" style="display:none;">Content 2</div>
<!-- /wp:paragraph -->
```

**Pros:**
- No plugin needed
- Simple implementation
- Works with existing blocks
- Mobile-friendly by default

**Cons:**
- Less polished UI
- Requires custom JavaScript
- Not true tabbed interface
- More clicks needed

#### Workaround B: Separate Pages
- Create separate pages for each "tab" content
- Link to them with button blocks
- Better for SEO
- Less ideal UX

---

## Comparison Table

| Solution | Cost | Setup | Ease | Features | Support | Maintenance |
|---|---|---|---|---|---|---|
| Kadence (Premium) | $49/yr | Easy | Very Easy | Excellent | Excellent | Automatic |
| Advanced Blocks (Free) | Free | Easy | Easy | Good | Good | Automatic |
| GenerateBlocks (Free) | Free | Easy | Easy | Good | Good | Automatic |
| CoBlocks (Free) | Free | Easy | Easy | Basic | Fair | Automatic |
| Custom Block | $$ | Complex | Hard | Custom | Self | Manual |
| Accordion Workaround | Free | Medium | Medium | Limited | Self | Manual |

---

## Implementation Guide: Installing Kadence Blocks

### Step 1: Install Plugin
1. In WordPress admin, go to **Plugins > Add New**
2. Search for "Kadence Blocks"
3. Click "Install Now"
4. Click "Activate"

### Step 2: Create Tabs Block
In Gutenberg editor:
1. Click "+" to add block
2. Search for "Tabs" (should see "Kadence - Tabs")
3. Insert the block

### Step 3: Configure Tabs
1. Click on tabs block
2. In right sidebar, click "+" to add tab
3. Enter tab title (e.g., "Všechny akce")
4. Click inside content area
5. Add your content (text, custom shortcodes, etc.)
6. Repeat for each tab

### Step 4: Style (Optional)
In right sidebar settings:
- Tab padding
- Tab colors
- Font sizes
- Border radius
- Backgrounds

### Step 5: Publish
Test tabs work on desktop and mobile before publishing.

---

## Migration Strategy for Current Site

### Current Tab Usage
Your site uses 12 tab modules, primarily for event listings:

```
[et_pb_tabs active_tab_background_color="#f0d118"]
  [et_pb_tab title="Všechny akce"]
    [akce category="" pocet="5"]
  [/et_pb_tab]

  [et_pb_tab title="AKCE ŠKOLKY"]
    [akce cat="4" pocet="3"]
  [/et_pb_tab]

  [et_pb_tab title="AKCE ŠKOLY"]
    [akce cat="3" pocet="3"]
  [/et_pb_tab]

  [et_pb_tab title="AKCE LYCEA"]
    [akce cat="5" pocet="3"]
  [/et_pb_tab]
[/et_pb_tabs]
```

### Conversion Plan

#### Phase 1: Install Plugin
1. Install Kadence Blocks (or chosen plugin)
2. Test on staging environment
3. Verify custom shortcodes work inside tabs

#### Phase 2: Convert Tabs One by One
For each tab on each page:
1. Replace `[et_pb_tabs]` with Kadence Tabs block
2. Create matching tabs with same titles
3. Move `[akce]` shortcode content inside
4. Test on desktop and mobile
5. Verify styling

#### Phase 3: Styling
If original tabs had specific styling:
1. Note original colors, sizes
2. In Kadence settings, replicate styling
3. Use custom CSS if needed for exact match

#### Phase 4: Testing
- [ ] Tabs display on desktop
- [ ] Tabs work on mobile
- [ ] Custom `[akce]` shortcode renders correctly
- [ ] Tab switching works
- [ ] Styling matches original (or acceptable alternative)

### Estimated Effort
- **Install plugin:** 5 minutes
- **Per tab set:** 10-15 minutes
- **Testing:** 30 minutes
- **Total:** 2-3 hours for all 12 tabs

---

## CSS Customization for Tabs

If using a plugin, you might want custom styling. Add to theme CSS:

### Kadence Tabs Custom Styling
```css
.wp-block-kadence-tabs {
  margin: 20px 0;
}

.wp-block-kadence-tabs .kt-tabs-title-list {
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 0;
}

.wp-block-kadence-tabs .kt-tab-title {
  padding: 15px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.wp-block-kadence-tabs .kt-tab-title.kt-active {
  border-bottom-color: #f0d118;
  background-color: #fffef0;
}

.wp-block-kadence-tabs .kt-tab-title:hover:not(.kt-active) {
  background-color: #f9f9f9;
}

.wp-block-kadence-tabs .kt-tabs-content {
  padding: 20px 0;
}
```

---

## Troubleshooting

### Q: Tabs block not appearing
**A:** Ensure plugin is installed and activated. Clear browser cache.

### Q: Custom shortcodes not working in tabs
**A:** Some plugins don't support custom shortcodes. Test thoroughly. May need plugin update.

### Q: Styling doesn't match original DIVI
**A:** Plugin styling differs from DIVI. Use CSS customization to approximate. May not be pixel-perfect match.

### Q: Mobile experience poor
**A:** Test on mobile. Adjust tab padding and font sizes for smaller screens via plugin settings or CSS.

### Q: Tabs slow down page
**A:** If many tabs or complex content, performance may suffer. Consider splitting into multiple sections or reducing content per tab.

---

## Best Practices

### For Tab Content

1. **Keep Content Concise** - Long content in tabs is hard to navigate
2. **Clear Tab Labels** - Labels should clearly describe content
3. **Consistent Format** - All tabs should have similar structure
4. **Test Custom Shortcodes** - Verify `[akce]` and other shortcodes work

### For Accessibility

1. **Keyboard Navigation** - Users should navigate with Tab key
2. **ARIA Labels** - Proper screen reader support (plugin handles this)
3. **Color Contrast** - Ensure readable text on backgrounds
4. **Focus Indicators** - Users know which tab is active

### For Mobile

1. **Stack Vertically** - Tabs should stack on mobile
2. **Large Touch Targets** - Tab buttons should be easy to tap
3. **Readable Text** - Font sizes shouldn't be too small
4. **Test Thoroughly** - Use real devices, not just browser emulation

---

## Recommendation for Site

### For Example Site

**RECOMMEND:** Kadence Blocks (Free Version)

**Reasoning:**
1. **Simple Need** - Only 12 tabs, relatively simple use case
2. **Cost** - Free version sufficient for basic tabs
3. **Reliability** - Well-maintained, good community support
4. **Custom Shortcodes** - Supports `[akce]` shortcode
5. **Styling** - Good flexibility for matching original look
6. **Mobile** - Responsive design works well

### Implementation Timeline

1. **Setup (Day 1):** Install and test Kadence Blocks
2. **Conversion (Days 2-3):** Convert 12 tab sets
3. **Styling (Day 4):** Fine-tune CSS if needed
4. **Testing (Day 5):** Full QA and verification
5. **Deployment:** Push to production

**Total Time:** 1 week

---

## Future Considerations

### WordPress Direction

- **Native Tabs Likely Eventually** - Long-term, Gutenberg will likely add tabs
- **Migration Path** - When/if WordPress adds native tabs, plugins will provide migration tools
- **Plugin Stability** - Kadence Blocks maintained and stable; low risk

### If Using Custom Block

- **Maintenance Burden** - You'll need to maintain and update
- **Future Compatibility** - Must update when WordPress changes
- **Long-term Cost** - Ongoing development required

---

## Additional Resources

### Plugin Documentation
- [Kadence Blocks Docs](https://www.kadenceblocks.com/documentation/)
- [Advanced Blocks Docs](https://www.advancedblocks.com/documentation/)
- [GenerateBlocks Docs](https://www.generateblocks.com/docs/)

### WordPress Resources
- [WordPress Plugin Directory - Tabs](https://wordpress.org/plugins/search/tabs+block/)
- [Gutenberg Handbook - Creating Blocks](https://developer.wordpress.org/block-editor/)
- [Web Accessibility - Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)

---

**Last Updated:** November 20, 2025
**Status:** Comprehensive gap analysis and solution guide
**Recommendation:** Kadence Blocks (Free)
**Site Impact:** 12 DIVI tabs → Kadence Tabs implementation
**Estimated Effort:** 1 week for complete migration
