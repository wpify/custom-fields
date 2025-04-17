# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Test Commands
- Start dev server: `npm run start`
- Build for production: `npm run build`
- Analyze bundle: `npm run build:analyze`
- PHP code standards check: `composer run phpcs`
- PHP code beautifier: `composer run phpcbf`

## Code Style Guidelines
- PHP: WordPress Coding Standards (WPCS) with customizations in phpcs.xml
- PHP version: 8.1+
- WordPress version: 6.2+
- JS: Use WordPress scripts standards
- Prefix PHP globals with `wpifycf`
- Translation text domain: `wpify-custom-fields`
- React components use PascalCase
- JS helpers use camelCase
- Namespace: `Wpify\CustomFields`
- PHP class files match class name (PSR-4)
- Import paths: Use `@` alias for assets directory in JS
- Error handling: Use custom exceptions in `Exceptions` directory
- Documentation is in PHPDoc format and in docs folder in md format
- When generating PHP code, always use WordPress Coding Standards

## Extending Field Types
To create a custom field type, the following components are required:

1. **PHP Filters**:
   - `wpifycf_sanitize_{type}` - For sanitizing field values
   - `wpifycf_wp_type_{type}` - To specify WordPress data type (integer, number, boolean, object, array, string)
   - `wpifycf_default_value_{type}` - To define default values

2. **JavaScript Components**:
   - Create a React component for the field
   - Add validation method to the component (`YourComponent.checkValidity`)
   - Register the field via `addFilter('wpifycf_field_{type}', 'wpify_custom_fields', () => YourComponent)`

3. **Multi-field Types**:
   - Custom field types can have multi-versions by prefixing with `multi_`
   - Leverage the existing `MultiField` component for implementation
   - Use `checkValidityMultiFieldType` helper for validation

4. **Field Component Structure**:
   - Field components receive props like `id`, `htmlId`, `onChange`, `value`, etc.
   - CSS classes should follow pattern: `wpifycf-field-{type}`
   - Return JSX with appropriate HTML elements

## Documentation Standards
When writing or updating documentation:

### PHP Code Examples
- Use tabs for indentation, not spaces
- Follow WordPress Coding Standards for all PHP examples:
  - Add spaces inside parentheses for conditions: `if ( ! empty( $var ) )`
  - Add spaces after control structure keywords: `if (...) {`
  - Add spaces around logical operators: `$a && $b`, `! $condition`
  - Add spaces around string concatenation: `$a . ' ' . $b`
  - Add spaces for function parameters: `function_name( $param1, $param2 )`
  - Use proper array formatting with tabs for indentation:
    ```php
    array(
    	'key1' => 'value1',
    	'key2' => 'value2',
    )
    ```
  - Maintain consistent spacing around array arrow operators: `'key' => 'value'`
  - Use spaces in associative array access: `$array[ 'key' ]`

### Documentation Structure for Field Types
Field type documentation should follow this consistent structure:
1. **Title and Description** - Clear explanation of the field's purpose
2. **Field Type Definition** - Example code following WordPress coding standards
3. **Properties Section**:
   - Default field properties
   - Specific properties unique to the field type
4. **Stored Value** - Explanation of how data is stored in the database
5. **Example Usage** - Real-world examples with WordPress coding standards
6. **Notes** - Important details about the field's behavior and uses

### Documentation Structure for Integrations
Integration documentation should follow this consistent structure:
1. **Title and Overview** - Clear explanation of the integration's purpose
2. **Requirements** - Any specific plugins or dependencies required (if applicable)
3. **Usage Example** - PHP code example following WordPress coding standards
4. **Parameters Section**:
   - Required parameters with descriptions
   - Optional parameters with descriptions and default values
5. **Data Storage** - How and where the integration stores its data
6. **Retrieving Data** - How to access stored data programmatically
7. **Advanced Usage** - Examples of tabs, conditional display, etc. (as applicable)

### Security in Examples
- Always include proper data escaping in examples:
  - `esc_html()` for plain text output
  - `esc_attr()` for HTML attributes
  - `esc_url()` for URLs
  - `wp_kses()` for allowing specific HTML

### Consistency
- Maintain consistent terminology across all documentation files
- Use consistent formatting for property descriptions
- Keep parameter documentation format consistent: `name` _(type)_ - description
- When documenting integrations, use consistent parameter naming and structure

### Integration-Specific Notes
- For WooCommerce integrations, always mention compatibility with HPOS when applicable
- Product Options integrations should list common tab IDs from WooCommerce
- Order and Subscription integrations should include examples of retrieving meta
- All integration documentation should include examples of tabs and conditional display
- When documenting options pages, always include proper menu/page configuration

### File Organization
- Field type documentation goes in `docs/field-types/`
- Integration documentation goes in `docs/integrations/`
- Feature documentation goes in `docs/features/`
- All documentation files should use `.md` extension
- Main index files (integrations.md, field-types.md) should link to all related docs

## Conditional Fields
The plugin provides a robust conditional logic system for dynamically showing/hiding fields:

### Condition Structure
Each condition requires:
- `field`: The ID of the field to check (can use path references)
- `condition`: The comparison operator
- `value`: The value to compare against

### Available Operators
- `==`: Equal (default)
- `!=`: Not equal
- `>`, `>=`, `<`, `<=`: Comparison operators
- `between`: Value is between two numbers, inclusive 
- `contains`, `not_contains`: String contains/doesn't contain value
- `in`, `not_in`: Value is/isn't in an array
- `empty`, `not_empty`: Value is/isn't empty

### Multiple Conditions
- Combine with `'and'` (default) or `'or'` between conditions
- Create nested condition groups with sub-arrays for complex logic

### Path References
- Dot notation for nested fields: `parent.child`
- Hash symbols for relative paths: `#` (parent), `##` (grandparent)
- Array access: `multi_field[0]` for specific items

### Technical Implementation
- Conditional logic lives in `Field.js`, `hooks.js` (useConditions), and `functions.js`
- Hidden fields are still submitted but have `data-hide-field="true"` attribute
- Conditions are evaluated in real-time as users interact with the form
