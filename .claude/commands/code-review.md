---
allowed-tools: Bash, Read, Grep, Glob
description: Review uncommitted changes following WordPress PHP, React, and CSS best practices
argument-hint: "[--staged]"
author: Daniel Mejta
---

# Code Review Command

Performs comprehensive code review of uncommitted changes following best practices for WordPress PHP development, React components, and CSS styles. Outputs actionable recommendations with severity ratings and an overall quality score.

## Usage

Review all uncommitted changes:
```
/code-review
```

Review only staged changes:
```
/code-review --staged
```

## Review Criteria

### WordPress PHP Best Practices
- **WordPress Coding Standards (WPCS)**: Spacing, indentation, naming conventions
- **Security**: Proper data escaping (esc_html, esc_attr, esc_url, wp_kses), nonce verification, capability checks
- **Performance**: Efficient database queries, proper caching, avoiding n+1 queries
- **Hooks**: Proper use of actions and filters, appropriate priorities
- **Internationalization**: Proper use of translation functions with correct text domain
- **Error Handling**: Proper exception handling, WP_Error usage
- **Documentation**: PHPDoc blocks for classes, methods, and complex functions
- **Namespace**: Proper PSR-4 autoloading and namespace usage
- **Sanitization**: Proper input sanitization and validation

### React Best Practices
- **Component Structure**: Proper component composition, single responsibility
- **Hooks**: Correct use of useState, useEffect, useCallback, useMemo
- **Props**: Clear prop types, proper destructuring, avoiding prop drilling
- **Performance**: Unnecessary re-renders, missing dependency arrays, key props
- **Accessibility**: ARIA attributes, semantic HTML, keyboard navigation
- **State Management**: Appropriate state location, avoiding derived state
- **Error Boundaries**: Proper error handling in components
- **Code Organization**: Clear naming, consistent patterns, DRY principles

### CSS Best Practices
- **Naming**: BEM methodology or consistent naming convention
- **Specificity**: Avoiding overly specific selectors, !important usage
- **Organization**: Logical grouping, consistent ordering of properties
- **Responsiveness**: Mobile-first approach, appropriate breakpoints
- **Accessibility**: Focus states, color contrast, screen reader compatibility
- **Performance**: Efficient selectors, avoiding layout thrashing
- **Modern CSS**: Using CSS custom properties, grid, flexbox appropriately
- **Browser Compatibility**: Considering vendor prefixes and fallbacks

## Instructions

Follow these steps to perform the code review:

### 1. Identify Changed Files

Use Bash to get the list of uncommitted changes:
```bash
# For all changes (default)
git status --short

# For staged changes only
git diff --cached --name-only
```

If no changes are found, inform the user and exit.

### 2. Get File Contents and Changes

For each changed file:
- Use `git diff` (or `git diff --cached` for staged) to see the actual changes
- Use Read tool to get full file context if needed
- Focus review on the changed lines and their surrounding context

### 3. Analyze by File Type

**For PHP files** (*.php):
- Check WordPress Coding Standards compliance
- Look for security vulnerabilities (unescaped output, SQL injection, XSS)
- Verify proper sanitization and validation
- Check for proper internationalization
- Review hook usage and priorities
- Verify PHPDoc documentation
- Check namespace and class structure

**For JavaScript/JSX files** (*.js, *.jsx):
- Review React component structure and patterns
- Check hooks usage and dependencies
- Look for performance issues
- Verify accessibility attributes
- Check for proper error handling
- Review state management patterns
- Verify consistent code style

**For CSS/SCSS files** (*.css, *.scss):
- Review naming conventions
- Check selector specificity
- Verify responsive design approach
- Check accessibility (focus states, contrast)
- Review property organization
- Look for performance anti-patterns
- Check for modern CSS usage

### 4. Categorize Issues by Severity

**CRITICAL** (Score impact: -3 points each)
- Security vulnerabilities (XSS, SQL injection, CSRF)
- Data loss potential
- Breaking changes without fallbacks
- Accessibility violations preventing usage

**HIGH** (Score impact: -2 points each)
- Performance issues causing significant slowdowns
- Missing error handling in critical paths
- WordPress Coding Standards violations affecting functionality
- Improper hook priorities causing conflicts
- Missing or incorrect internationalization

**MEDIUM** (Score impact: -1 point each)
- Code style inconsistencies
- Missing documentation
- Non-optimal performance patterns
- Minor accessibility improvements
- Code organization issues

**LOW** (Score impact: -0.5 points each)
- Minor style suggestions
- Code readability improvements
- Non-critical refactoring opportunities
- Documentation enhancements

### 5. Calculate Overall Score

Start with a base score of 10:
- Subtract points based on severity (see above)
- Minimum score is 1
- Round to nearest 0.5

**Score Interpretation**:
- 9.0-10.0: Excellent - Production ready
- 7.0-8.5: Good - Minor improvements recommended
- 5.0-6.5: Fair - Several issues to address
- 3.0-4.5: Needs Work - Significant issues present
- 1.0-2.5: Critical - Major issues must be fixed

### 6. Format Output

Present the review in this structure:

```
# Code Review Results

## Overview
- Files reviewed: [count]
- Total issues: [count]
- Overall score: [X.X/10] - [interpretation]

## Issues by Severity

### CRITICAL (count)
1. [File:Line] - [Issue description]
   Recommendation: [Specific fix]

### HIGH (count)
...

### MEDIUM (count)
...

### LOW (count)
...

## Summary
[Brief summary of main concerns and positive aspects]

## Next Steps
[Prioritized action items]
```

## Error Handling

- If git is not available, inform the user
- If no changes detected, confirm with user that working tree is clean
- If a file cannot be read, note it and continue with other files
- If diff is too large, focus on changed sections rather than full file analysis
- If encountering binary files, skip with a note

## Performance Considerations

- For large diffs (>1000 lines), provide a warning and option to continue
- Focus on changed lines and immediate context (±5 lines)
- Use Grep for pattern matching rather than reading entire large files
- Process files in parallel when checking for common patterns

## Examples

### Example Output

```
# Code Review Results

## Overview
- Files reviewed: 5
- Total issues: 8
- Overall score: 7.5/10 - Good

## Issues by Severity

### CRITICAL (1)
1. src/Admin.php:45 - Unescaped output in admin interface
   Recommendation: Use esc_html() when outputting $user_name to prevent XSS

### HIGH (2)
1. assets/components/Field.js:23 - Missing dependency in useEffect
   Recommendation: Add 'value' to dependency array to prevent stale closures

2. src/Integration.php:78 - Direct database query without prepare()
   Recommendation: Use $wpdb->prepare() to prevent SQL injection

### MEDIUM (3)
1. assets/styles/field.scss:15 - Using px instead of rem for font-size
   Recommendation: Use rem units for better accessibility

2. src/Helper.php:102 - Missing PHPDoc block
   Recommendation: Add @param and @return documentation

3. assets/components/Label.js:10 - Prop types not defined
   Recommendation: Add PropTypes or use TypeScript

### LOW (2)
1. assets/styles/layout.scss:45 - Consider using CSS custom properties
   Recommendation: Replace hardcoded colors with CSS variables

2. src/Options.php:200 - Consider extracting method for better readability
   Recommendation: Extract validation logic into separate method

## Summary
The code is generally well-structured and follows most best practices. The critical XSS vulnerability should be addressed immediately. React hooks usage needs attention to prevent subtle bugs. CSS could benefit from more modern patterns.

## Next Steps
1. Fix XSS vulnerability in Admin.php (CRITICAL)
2. Add missing useEffect dependency (HIGH)
3. Refactor database query to use prepare() (HIGH)
4. Address remaining medium and low priority items in subsequent iterations
```

## Notes

- This command analyzes code quality but does not make changes
- For automatic fixes, consider using separate commands like /phpcbf for PHP
- Review is opinionated based on WordPress and React best practices
- Scores are relative to the codebase being reviewed, not absolute measures
- Consider running phpcs and npm lint commands for automated checks first
