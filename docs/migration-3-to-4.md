# Migration from WPify Custom Fields 3.x to 4.x

This guide will help you migrate your codebase from version 3.x to version 4.x of the WPify Custom Fields plugin.

## Requirements Changes

- **PHP Version**: Upgraded from PHP 8.0+ to PHP 8.1+
- **WordPress Version**: Requires WordPress 6.2+

## JavaScript Changes

- Extending field types is not compatible
- Field sanitization has been improved and standardized according to WordPress standards

## Type Compatibility

- For backward compatibility, v4.x supports type aliases for old field types. However, it's recommended to update to the new standardized types for future compatibility.
- Array key `title` is now `label` in the field definition

## Migration Steps

1. **Update PHP Version**: Ensure your environment meets the PHP 8.1+ requirement
2. **Update WordPress**: Ensure you're running WordPress 6.2+
3. **Check Field Sanitization**: All fields are now sanitized according to WordPress standards. Review your custom field types and ensure they are compatible with the new sanitization process
4. **Test Thoroughly**: After migration, thoroughly test your forms, especially those with custom field types

## Breaking Changes

- PHP 8.0 is no longer supported
- The field typing system has been enhanced and may require updates to custom field types
- JavaScript architecture has been significantly revised

## Need Help?

If you encounter issues during migration, please visit our GitHub repository at https://github.com/wpify/custom-fields for support.
