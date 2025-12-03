# GenerateBlocks v2.x Styles Object Reference

## Overview

All styling in GenerateBlocks v2.x is done through the `styles` object attribute. This replaces individual style attributes with a unified, CSS-like structure.

## Basic Structure

```json
{
  "styles": {
    "property": "value",
    "anotherProperty": "value"
  }
}
```

## CSS Properties

Use camelCase property names (CSS kebab-case converted to camelCase):

### Layout

| Property | CSS | Example |
|----------|-----|---------|
| `display` | display | `"flex"`, `"grid"`, `"block"`, `"inline-block"` |
| `flexDirection` | flex-direction | `"row"`, `"column"` |
| `flexWrap` | flex-wrap | `"wrap"`, `"nowrap"` |
| `alignItems` | align-items | `"center"`, `"flex-start"`, `"stretch"` |
| `justifyContent` | justify-content | `"center"`, `"space-between"`, `"flex-start"` |
| `gap` | gap | `"1em"`, `"20px"` |
| `columnGap` | column-gap | `"2em"` |
| `rowGap` | row-gap | `"1em"` |

### Grid

| Property | CSS | Example |
|----------|-----|---------|
| `gridTemplateColumns` | grid-template-columns | `"repeat(3, 1fr)"`, `"1fr 2fr"` |
| `gridTemplateRows` | grid-template-rows | `"auto 1fr auto"` |
| `gridColumn` | grid-column | `"span 2"`, `"1 / 3"` |
| `gridRow` | grid-row | `"span 2"` |

### Sizing

| Property | CSS | Example |
|----------|-----|---------|
| `width` | width | `"100%"`, `"300px"`, `"auto"` |
| `height` | height | `"auto"`, `"400px"` |
| `minWidth` | min-width | `"200px"` |
| `minHeight` | min-height | `"100px"` |
| `maxWidth` | max-width | `"1200px"`, `"100%"` |
| `maxHeight` | max-height | `"500px"` |

### Spacing

| Property | CSS | Example |
|----------|-----|---------|
| `padding` | padding | `"20px"`, `"10px 20px"` |
| `paddingTop` | padding-top | `"20px"` |
| `paddingRight` | padding-right | `"15px"` |
| `paddingBottom` | padding-bottom | `"20px"` |
| `paddingLeft` | padding-left | `"15px"` |
| `margin` | margin | `"0 auto"`, `"20px"` |
| `marginTop` | margin-top | `"30px"` |
| `marginRight` | margin-right | `"auto"` |
| `marginBottom` | margin-bottom | `"30px"` |
| `marginLeft` | margin-left | `"auto"` |

### Colors

| Property | CSS | Example |
|----------|-----|---------|
| `backgroundColor` | background-color | `"#ffffff"`, `"rgba(0,0,0,0.5)"` |
| `color` | color | `"#333333"`, `"inherit"` |
| `fill` | fill | `"currentColor"` (for SVGs) |
| `stroke` | stroke | `"#000000"` (for SVGs) |

### Typography

| Property | CSS | Example |
|----------|-----|---------|
| `fontSize` | font-size | `"16px"`, `"1.2em"`, `"clamp(16px, 2vw, 24px)"` |
| `fontWeight` | font-weight | `"400"`, `"700"`, `"bold"` |
| `fontFamily` | font-family | `"Arial, sans-serif"` |
| `lineHeight` | line-height | `"1.6"`, `"24px"` |
| `letterSpacing` | letter-spacing | `"0.5px"`, `"0.02em"` |
| `textAlign` | text-align | `"left"`, `"center"`, `"right"` |
| `textTransform` | text-transform | `"uppercase"`, `"capitalize"` |
| `textDecoration` | text-decoration | `"none"`, `"underline"` |

### Borders

| Property | CSS | Example |
|----------|-----|---------|
| `border` | border | `"1px solid #ddd"` |
| `borderTop` | border-top | `"2px solid #000"` |
| `borderRight` | border-right | `"1px solid #ccc"` |
| `borderBottom` | border-bottom | `"2px solid #000"` |
| `borderLeft` | border-left | `"1px solid #ccc"` |
| `borderColor` | border-color | `"#dddddd"` |
| `borderWidth` | border-width | `"1px"` |
| `borderStyle` | border-style | `"solid"`, `"dashed"` |
| `borderRadius` | border-radius | `"4px"`, `"50%"`, `"8px 8px 0 0"` |
| `borderTopLeftRadius` | border-top-left-radius | `"8px"` |
| `borderTopRightRadius` | border-top-right-radius | `"8px"` |
| `borderBottomRightRadius` | border-bottom-right-radius | `"0"` |
| `borderBottomLeftRadius` | border-bottom-left-radius | `"0"` |

### Background

| Property | CSS | Example |
|----------|-----|---------|
| `backgroundImage` | background-image | `"url(/path/to/image.jpg)"` |
| `backgroundSize` | background-size | `"cover"`, `"contain"`, `"100% auto"` |
| `backgroundPosition` | background-position | `"center"`, `"top left"` |
| `backgroundRepeat` | background-repeat | `"no-repeat"`, `"repeat-x"` |
| `backgroundAttachment` | background-attachment | `"fixed"`, `"scroll"` |

### Position

| Property | CSS | Example |
|----------|-----|---------|
| `position` | position | `"relative"`, `"absolute"`, `"fixed"` |
| `top` | top | `"0"`, `"20px"` |
| `right` | right | `"0"`, `"auto"` |
| `bottom` | bottom | `"0"` |
| `left` | left | `"0"` |
| `zIndex` | z-index | `"10"`, `"100"` |

### Effects

| Property | CSS | Example |
|----------|-----|---------|
| `opacity` | opacity | `"0.8"`, `"1"` |
| `boxShadow` | box-shadow | `"0 4px 6px rgba(0,0,0,0.1)"` |
| `textShadow` | text-shadow | `"2px 2px 4px rgba(0,0,0,0.3)"` |
| `filter` | filter | `"blur(5px)"`, `"grayscale(100%)"` |
| `transform` | transform | `"translateY(-10px)"`, `"scale(1.1)"` |
| `transition` | transition | `"all 0.3s ease"` |
| `overflow` | overflow | `"hidden"`, `"auto"` |
| `cursor` | cursor | `"pointer"`, `"default"` |

### Image/Object

| Property | CSS | Example |
|----------|-----|---------|
| `objectFit` | object-fit | `"cover"`, `"contain"` |
| `objectPosition` | object-position | `"center"`, `"top"` |

## Responsive Styles

Use media query strings as object keys:

```json
{
  "styles": {
    "fontSize": "24px",
    "padding": "40px",

    "@media (max-width:1024px)": {
      "fontSize": "20px",
      "padding": "30px"
    },

    "@media (max-width:767px)": {
      "fontSize": "18px",
      "padding": "20px"
    }
  }
}
```

### Standard Breakpoints

| At-Rule | Breakpoint | Device |
|---------|------------|--------|
| (default) | All | Desktop |
| `@media (max-width:1024px)` | ≤1024px | Tablet |
| `@media (max-width:767px)` | ≤767px | Mobile |

### Custom Breakpoints

Any valid CSS media query works:

```json
{
  "styles": {
    "@media (min-width:1400px)": {
      "maxWidth": "1400px"
    },
    "@media (max-width:480px)": {
      "fontSize": "14px"
    }
  }
}
```

## Pseudo-Selectors

Use `&` to reference the current element:

### Hover State

```json
{
  "styles": {
    "backgroundColor": "#0066cc",
    "transition": "background-color 0.3s ease",

    "&:hover": {
      "backgroundColor": "#0052a3"
    }
  }
}
```

### Focus State

```json
{
  "styles": {
    "outline": "none",

    "&:focus": {
      "boxShadow": "0 0 0 3px rgba(0,102,204,0.3)"
    }
  }
}
```

### Combined States

```json
{
  "styles": {
    "&:is(:hover, :focus)": {
      "backgroundColor": "#f0f0f0"
    }
  }
}
```

### Pseudo-Elements

```json
{
  "styles": {
    "position": "relative",

    "&:before": {
      "content": "\"\"",
      "position": "absolute",
      "top": "0",
      "left": "0",
      "width": "100%",
      "height": "4px",
      "backgroundColor": "#0066cc"
    },

    "&:after": {
      "content": "\"→\"",
      "marginLeft": "8px"
    }
  }
}
```

## Child Selectors

Target child elements using CSS selectors:

```json
{
  "styles": {
    "display": "flex",
    "gap": "1em",

    ".gb-text": {
      "color": "#333"
    },

    "a": {
      "color": "#0066cc",
      "textDecoration": "none"
    },

    "a:hover": {
      "textDecoration": "underline"
    },

    "> .gb-element": {
      "flexBasis": "50%"
    },

    ".gb-shape svg": {
      "width": "24px",
      "height": "24px",
      "fill": "currentColor"
    }
  }
}
```

## Complete Examples

### Card Component

```json
{
  "styles": {
    "backgroundColor": "#ffffff",
    "borderRadius": "8px",
    "boxShadow": "0 2px 8px rgba(0,0,0,0.1)",
    "padding": "24px",
    "transition": "box-shadow 0.3s ease, transform 0.3s ease",

    "&:hover": {
      "boxShadow": "0 4px 16px rgba(0,0,0,0.15)",
      "transform": "translateY(-2px)"
    },

    "@media (max-width:767px)": {
      "padding": "16px"
    }
  }
}
```

### Button Styles

```json
{
  "styles": {
    "display": "inline-block",
    "backgroundColor": "#0066cc",
    "color": "#ffffff",
    "padding": "12px 24px",
    "borderRadius": "4px",
    "fontWeight": "600",
    "textDecoration": "none",
    "border": "none",
    "cursor": "pointer",
    "transition": "background-color 0.2s ease",

    "&:hover": {
      "backgroundColor": "#0052a3"
    },

    "&:focus": {
      "outline": "none",
      "boxShadow": "0 0 0 3px rgba(0,102,204,0.4)"
    },

    "@media (max-width:767px)": {
      "padding": "10px 20px",
      "fontSize": "14px"
    }
  }
}
```

### Hero Section

```json
{
  "styles": {
    "backgroundColor": "#1a1a1a",
    "color": "#ffffff",
    "padding": "80px 40px",
    "textAlign": "center",
    "backgroundImage": "url(/path/to/bg.jpg)",
    "backgroundSize": "cover",
    "backgroundPosition": "center",
    "position": "relative",

    "&:before": {
      "content": "\"\"",
      "position": "absolute",
      "top": "0",
      "left": "0",
      "right": "0",
      "bottom": "0",
      "backgroundColor": "rgba(0,0,0,0.5)"
    },

    "@media (max-width:1024px)": {
      "padding": "60px 30px"
    },

    "@media (max-width:767px)": {
      "padding": "40px 20px"
    }
  }
}
```

### Responsive Grid

```json
{
  "styles": {
    "display": "grid",
    "gridTemplateColumns": "repeat(4, 1fr)",
    "gap": "2em",

    "@media (max-width:1024px)": {
      "gridTemplateColumns": "repeat(2, 1fr)",
      "gap": "1.5em"
    },

    "@media (max-width:767px)": {
      "gridTemplateColumns": "1fr",
      "gap": "1em"
    }
  }
}
```

### Navigation Link

```json
{
  "styles": {
    "color": "#333333",
    "textDecoration": "none",
    "padding": "8px 16px",
    "borderRadius": "4px",
    "transition": "background-color 0.2s ease",

    "&:hover": {
      "backgroundColor": "#f5f5f5"
    },

    "&:focus": {
      "outline": "2px solid #0066cc",
      "outlineOffset": "2px"
    }
  }
}
```

## JSON Escaping Notes

When writing styles in block comments, remember JSON rules:

1. **Double quotes only** - Use `"` not `'`
2. **Escape quotes in content** - `"content": "\"text\""`
3. **No trailing commas**
4. **Property names must be quoted**

### Correct

```json
{"styles":{"backgroundColor":"#fff","padding":"20px"}}
```

### Incorrect

```json
{'styles':{'backgroundColor':'#fff','padding':'20px',}}
```

## CSS Custom Properties

You can use CSS variables:

```json
{
  "styles": {
    "color": "var(--wp--preset--color--primary)",
    "fontSize": "var(--wp--preset--font-size--medium)",
    "padding": "var(--wp--custom--spacing--large)"
  }
}
```

---

**GenerateBlocks:** 2.1.2
**Updated:** December 2025
