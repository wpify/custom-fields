import { RawHTML } from '@wordpress/element';
import { useCallback, useContext, useEffect, useRef, useState, useMemo } from 'react';
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Code } from '@/fields/Code';
import { checkValidityStringType } from '@/helpers/validators';
import { AppContext } from '@/components/AppContext';
import { stripHtml } from '@/helpers/functions';
import {
	Modal,
	Button,
	Flex,
	FlexItem,
} from '@wordpress/components';
import { fullscreen } from '@wordpress/icons';

const VIEW_VISUAL = 'visual';
const VIEW_HTML = 'html';

/**
 * Get the Gutenberg editor iframe element (if exists).
 * Returns null if not in iframe mode.
 */
function getEditorIframe() {
	const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
	return iframe;
}

/**
 * Check if Gutenberg is using iframe mode.
 * This is detected from the parent window by looking for the editor-canvas iframe.
 */
function isGutenbergIframeMode() {
	const iframe = getEditorIframe();
	return !! iframe;
}

/**
 * Get the document where our elements are rendered.
 * In Gutenberg iframe mode, elements are in the iframe's document.
 */
function getTargetDocument() {
	const iframe = getEditorIframe();
	if ( iframe?.contentDocument ) {
		return iframe.contentDocument;
	}
	return document;
}

/**
 * Get the window containing TinyMCE resources.
 * TinyMCE is always loaded in the main window.
 */
function getTinyMCEWindow() {
	return window;
}

/**
 * TinyMCE Manager - Centralized editor lifecycle management.
 * Uses WordPress's wp.oldEditor API for reliable TinyMCE handling.
 * Handles both iframe and non-iframe Gutenberg modes.
 */
const TinyMCEManager = {
	/**
	 * Get the window where TinyMCE lives.
	 * In iframe mode, TinyMCE resources are in parent window.
	 */
	getWindow() {
		return getTinyMCEWindow();
	},

	/**
	 * Check if Gutenberg is using iframe mode.
	 */
	isIframeMode() {
		return isGutenbergIframeMode();
	},

	/**
	 * Get the document where elements are rendered.
	 * @param {boolean} forceMainDocument - If true, always use main document (for modals)
	 */
	getTargetDocument( forceMainDocument = false ) {
		if ( forceMainDocument ) {
			return document;
		}
		return getTargetDocument();
	},

	/**
	 * Get TinyMCE instance from correct window context.
	 */
	getTinyMCE() {
		const win = this.getWindow();
		return win.tinymce;
	},

	/**
	 * Get WordPress editor L10n settings.
	 */
	getEditorL10n() {
		const win = this.getWindow();
		return win.wpEditorL10n;
	},

	/**
	 * Get WordPress oldEditor API.
	 */
	getOldEditor() {
		const win = this.getWindow();
		return win.wp?.oldEditor;
	},

	/**
	 * Check if TinyMCE is available.
	 */
	isAvailable() {
		const tinymce = this.getTinyMCE();
		const editorL10n = this.getEditorL10n();
		return tinymce !== undefined && editorL10n?.tinymce !== undefined;
	},

	/**
	 * Initialize a new TinyMCE instance.
	 * Uses wp.oldEditor.initialize for non-iframe mode.
	 * Uses direct tinymce.init with target for iframe mode.
	 */
	initialize( id, options = {} ) {
		const tinymce = this.getTinyMCE();
		const editorL10n = this.getEditorL10n();
		const oldEditor = this.getOldEditor();
		const win = this.getWindow();
		const inIframe = this.isIframeMode();

		if ( ! tinymce || ! editorL10n?.tinymce ) {
			return null;
		}

		// Check if already exists.
		const existing = tinymce.get( id );
		if ( existing ) {
			return existing;
		}

		const { baseURL: base_url, suffix, settings } = editorL10n.tinymce;

		// Override TinyMCE defaults with WordPress settings.
		tinymce.EditorManager.overrideDefaults( { base_url, suffix } );

		// Apply toolbar configuration.
		const toolbars = win.wpifycf_wysiwyg_toolbars || window.wpifycf_wysiwyg_toolbars || {};
		const toolbar = options.toolbar || 'full';
		const toolbarConfig = {};
		if ( toolbars[ toolbar ] ) {
			Object.keys( toolbars[ toolbar ] ).forEach( ( i ) => {
				toolbarConfig[ 'toolbar' + i ] = toolbars[ toolbar ][ i ];
			} );
		}

		// Build TinyMCE configuration.
		const tinymceConfig = {
			...settings,
			...toolbarConfig,
			height: options.height || 300,
			wp_autoresize_on: false,
			setup: options.setup,
		};

		// Check if target element exists (in correct document context).
		// For modals, always use main document since WordPress Modal renders there.
		const forceMainDocument = options.forceMainDocument || false;
		const targetDoc = this.getTargetDocument( forceMainDocument );
		const targetElement = targetDoc.getElementById( id );

		if ( inIframe && ! forceMainDocument ) {
			// In iframe mode, we must use direct TinyMCE init with target element
			// because wp.oldEditor looks for elements in the parent document.
			if ( ! targetElement ) {
				return null;
			}

			tinymce.init( {
				...tinymceConfig,
				target: targetElement,
			} );
		} else if ( oldEditor ) {
			// Use wp.oldEditor if available (recommended WordPress way).
			oldEditor.initialize( id, {
				tinymce: tinymceConfig,
			} );
		} else {
			// Fallback to direct TinyMCE init.
			tinymce.init( {
				...tinymceConfig,
				selector: '#' + id,
			} );
		}

		return tinymce.get( id );
	},

	/**
	 * Destroy a TinyMCE instance.
	 */
	destroy( id ) {
		const tinymce = this.getTinyMCE();
		const oldEditor = this.getOldEditor();
		const inIframe = this.isIframeMode();

		if ( ! tinymce ) {
			return false;
		}

		const ed = tinymce.get( id );
		if ( ! ed ) {
			return false;
		}

		// Save content to textarea before destroying.
		ed.save();

		// Remove all event listeners.
		ed.off();

		// Use wp.oldEditor.remove if available and not in iframe.
		if ( oldEditor && ! inIframe ) {
			oldEditor.remove( id );
		} else {
			ed.destroy();
		}

		return true;
	},

	/**
	 * Get editor instance.
	 */
	get( id ) {
		const tinymce = this.getTinyMCE();
		return tinymce ? tinymce.get( id ) : null;
	},
};

/**
 * EventIsolationWrapper - Prevents events from propagating to parent (Gutenberg).
 * This is crucial for making TinyMCE work in block editor context.
 */
function EventIsolationWrapper( { children, className } ) {
	/**
	 * Stop event propagation and dispatch synthetic mouseup.
	 * The synthetic mouseup satisfies Gutenberg's block selection logic.
	 */
	const handleMouseUp = useCallback( ( e ) => {
		e.stopPropagation();
		// Dispatch synthetic event to window - this is the SCF fix.
		window.dispatchEvent( new MouseEvent( 'mouseup' ) );
	}, [] );

	const handleMouseDown = useCallback( ( e ) => {
		e.stopPropagation();
	}, [] );

	const handleClick = useCallback( ( e ) => {
		e.stopPropagation();
	}, [] );

	const handleKeyDown = useCallback( ( e ) => {
		// Only stop propagation for certain keys that might interfere.
		// Allow Tab to propagate for accessibility.
		if ( e.key !== 'Tab' && e.key !== 'Escape' ) {
			e.stopPropagation();
		}
	}, [] );

	const handleFocus = useCallback( ( e ) => {
		e.stopPropagation();
	}, [] );

	return (
		<div
			className={ clsx( 'wpifycf-event-isolation-wrapper', className ) }
			onMouseDown={ handleMouseDown }
			onMouseUp={ handleMouseUp }
			onClick={ handleClick }
			onKeyDown={ handleKeyDown }
			onFocus={ handleFocus }
		>
			{ children }
		</div>
	);
}

/**
 * TinyMCE - Inline TinyMCE editor with proper lifecycle management.
 */
function TinyMCE( {
	htmlId,
	value,
	onChange,
	height = 300,
	disabled = false,
	toolbar = 'full',
	delay = false,
} ) {
	const editorRef = useRef( null );
	const textareaRef = useRef( null );
	const [ isInitialized, setIsInitialized ] = useState( false );
	const [ isDelayed, setIsDelayed ] = useState( delay );
	const initTimeoutRef = useRef( null );

	// Sanitize ID for use as HTML ID and TinyMCE selector.
	const sanitizedId = useMemo(
		() => htmlId
			.replace( /\./g, '__' )
			.replace( /\[/g, '_' )
			.replace( /\]/g, '_' )
			.replace( /[^a-zA-Z0-9_-]/g, '_' ),
		[ htmlId ]
	);

	/**
	 * Initialize TinyMCE editor.
	 */
	const initializeEditor = useCallback( () => {
		if ( editorRef.current || disabled ) {
			return;
		}

		if ( ! TinyMCEManager.isAvailable() ) {
			initTimeoutRef.current = setTimeout( initializeEditor, 100 );
			return;
		}

		const init = {
			height: Math.max( height, 300 ),
			toolbar,
			setup( ed ) {
				editorRef.current = ed;

				ed.on( 'init', () => {
					// Set initial content.
					if ( value ) {
						ed.setContent( value );
					}
					setIsInitialized( true );
				} );

				// Sync content changes to React state.
				ed.on( 'change keyup', () => {
					ed.save();
					const content = ed.getContent();
					onChange?.( content );
				} );

				// Gutenberg block selection fix - dispatch mouseup to window.
				ed.on( 'mouseup', () => {
					window.dispatchEvent( new MouseEvent( 'mouseup' ) );
				} );

				// Prevent mousedown from deselecting block.
				ed.on( 'mousedown', ( e ) => {
					e.stopPropagation();
				} );
			},
		};

		TinyMCEManager.initialize( sanitizedId, init );
	}, [ sanitizedId, height, toolbar, onChange, value, disabled ] );

	/**
	 * Handle delayed initialization click.
	 */
	const handleDelayedInit = useCallback( () => {
		setIsDelayed( false );
	}, [] );

	/**
	 * Initialize on mount (if not delayed).
	 */
	useEffect( () => {
		if ( ! isDelayed && ! disabled ) {
			// Small delay to ensure DOM is ready.
			initTimeoutRef.current = setTimeout( initializeEditor, 50 );
		}

		return () => {
			if ( initTimeoutRef.current ) {
				clearTimeout( initTimeoutRef.current );
			}
		};
	}, [ isDelayed, disabled, initializeEditor ] );

	/**
	 * Cleanup on unmount.
	 */
	useEffect( () => {
		return () => {
			if ( editorRef.current ) {
				TinyMCEManager.destroy( sanitizedId );
				editorRef.current = null;
			}
		};
	}, [ sanitizedId ] );

	/**
	 * Sync external value changes to editor.
	 */
	useEffect( () => {
		const ed = editorRef.current;
		if ( ed && isInitialized ) {
			const currentContent = ed.getContent();
			// Only update if actually different to avoid cursor jumping.
			if ( value !== currentContent && value !== undefined ) {
				const bookmark = ed.selection.getBookmark( 2, true );
				ed.setContent( value || '' );
				try {
					ed.selection.moveToBookmark( bookmark );
				} catch ( e ) {
					// Bookmark may be invalid after content change.
				}
			}
		}
	}, [ value, isInitialized ] );

	// Delayed initialization UI.
	if ( isDelayed ) {
		return (
			<div
				className="wpifycf-field-wysiwyg__delay-wrapper"
				style={ { minHeight: height + 94 } }
				onClick={ handleDelayedInit }
				role="button"
				tabIndex={ 0 }
				onKeyDown={ ( e ) => e.key === 'Enter' && handleDelayedInit() }
			>
				<div className="wpifycf-field-wysiwyg__delay-message">
					{ __( 'Click to initialize editor', 'wpify-custom-fields' ) }
				</div>
				{ value && (
					<RawHTML className="wpifycf-field-wysiwyg__delay-preview">
						{ value }
					</RawHTML>
				) }
			</div>
		);
	}

	return (
		<div className="wpifycf-field-wysiwyg__editor-container">
			<textarea
				ref={ textareaRef }
				id={ sanitizedId }
				defaultValue={ value || '' }
				style={ { height } }
				disabled={ disabled }
			/>
		</div>
	);
}

/**
 * ModalTinyMCE - Shows preview inline, opens editor in modal.
 * This is the approach used by ACF/SCF for Gutenberg compatibility.
 * Used as a fallback when inline approach has issues.
 */
function ModalTinyMCE( {
	htmlId,
	value,
	onChange,
	height = 300,
	disabled = false,
	toolbar = 'full',
} ) {
	const [ isOpen, setOpen ] = useState( false );
	const [ isFullScreen, setIsFullScreen ] = useState( false );
	const [ localValue, setLocalValue ] = useState( value );
	const editorRef = useRef( null );
	const [ isInitialized, setIsInitialized ] = useState( false );

	// Generate unique ID for modal editor.
	const modalEditorId = useMemo(
		() => `wpifycf_modal_${ htmlId }`
			.replace( /\./g, '__' )
			.replace( /\[/g, '_' )
			.replace( /\]/g, '_' )
			.replace( /[^a-zA-Z0-9_-]/g, '_' ),
		[ htmlId ]
	);

	// Sync external value to local.
	useEffect( () => {
		setLocalValue( value );
	}, [ value ] );

	// Handle modal open.
	const handleOpen = useCallback( () => {
		setLocalValue( value );
		setOpen( true );
	}, [ value ] );

	// Handle modal close - save changes.
	const handleClose = useCallback( () => {
		// Get final content from editor.
		const ed = editorRef.current;
		if ( ed ) {
			const content = ed.getContent();
			onChange?.( content );
		}
		setOpen( false );
		setIsInitialized( false );
	}, [ onChange ] );

	// Handle cancel - discard changes.
	const handleCancel = useCallback( () => {
		setLocalValue( value );
		setOpen( false );
		setIsInitialized( false );
	}, [ value ] );

	// Toggle fullscreen.
	const handleToggleFullscreen = useCallback( () => {
		setIsFullScreen( ( prev ) => ! prev );
	}, [] );

	// Store initial value when modal opens (to avoid re-init on content changes).
	const initialValueRef = useRef( '' );

	// Initialize editor when modal opens.
	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}

		// Capture the current value when modal opens.
		initialValueRef.current = localValue || '';

		const initEditor = () => {
			if ( ! TinyMCEManager.isAvailable() ) {
				setTimeout( initEditor, 100 );
				return;
			}

			// Don't reinitialize if editor already exists.
			if ( editorRef.current ) {
				return;
			}

			const init = {
				height: Math.max( height, 300 ),
				toolbar,
				forceMainDocument: true, // Modal is always in main document
				setup( ed ) {
					editorRef.current = ed;

					ed.on( 'init', () => {
						ed.setContent( initialValueRef.current );
						setIsInitialized( true );
						ed.focus();
					} );

					ed.on( 'change keyup', () => {
						ed.save();
						setLocalValue( ed.getContent() );
					} );
				},
			};

			TinyMCEManager.initialize( modalEditorId, init );
		};

		// Small delay for modal to render.
		const timeout = setTimeout( initEditor, 100 );

		return () => {
			clearTimeout( timeout );
			if ( editorRef.current ) {
				TinyMCEManager.destroy( modalEditorId );
				editorRef.current = null;
			}
		};
	}, [ isOpen, modalEditorId, height, toolbar ] ); // Removed localValue from deps

	return (
		<>
			{ /* Preview / Trigger */ }
			<div
				className={ clsx(
					'wpifycf-field-wysiwyg__preview-wrapper',
					disabled && 'is-disabled'
				) }
			>
				<div
					className="wpifycf-field-wysiwyg__preview"
					onClick={ disabled ? undefined : handleOpen }
					role={ disabled ? undefined : 'button' }
					tabIndex={ disabled ? undefined : 0 }
					onKeyDown={ ( e ) => ! disabled && e.key === 'Enter' && handleOpen() }
				>
					{ value ? (
						<RawHTML>{ value }</RawHTML>
					) : (
						<span className="wpifycf-field-wysiwyg__placeholder">
							{ __( 'Click to add content...', 'wpify-custom-fields' ) }
						</span>
					) }
				</div>

				{ ! disabled && (
					<Button
						onClick={ handleOpen }
						variant="primary"
						className="wpifycf-field-wysiwyg__edit-button"
					>
						{ __( 'Edit', 'wpify-custom-fields' ) }
					</Button>
				) }
			</div>

			{ /* Modal with Editor */ }
			{ isOpen && (
				<Modal
					title={ __( 'Edit Content', 'wpify-custom-fields' ) }
					onRequestClose={ handleClose }
					shouldCloseOnClickOutside={ false }
					overlayClassName="wpifycf-wysiwyg-modal-overlay"
					isFullScreen={ isFullScreen }
					className={ clsx(
						'wpifycf-wysiwyg-modal',
						isFullScreen && 'is-fullscreen'
					) }
					headerActions={
						<Button
							size="small"
							onClick={ handleToggleFullscreen }
							icon={ fullscreen }
							isPressed={ isFullScreen }
							label={
								isFullScreen
									? __( 'Exit fullscreen', 'wpify-custom-fields' )
									: __( 'Enter fullscreen', 'wpify-custom-fields' )
							}
						/>
					}
				>
					<div className="wpifycf-wysiwyg-modal__editor">
						<textarea
							id={ modalEditorId }
							defaultValue={ localValue || '' }
							style={ { height: isFullScreen ? 'calc(100vh - 200px)' : height } }
						/>
					</div>

					<Flex
						className="wpifycf-wysiwyg-modal__actions"
						justify="flex-end"
						expanded={ false }
					>
						<FlexItem>
							<Button
								variant="tertiary"
								onClick={ handleCancel }
							>
								{ __( 'Cancel', 'wpify-custom-fields' ) }
							</Button>
						</FlexItem>
						<FlexItem>
							<Button
								__next40pxDefaultSize
								variant="primary"
								onClick={ handleClose }
							>
								{ __( 'Done', 'wpify-custom-fields' ) }
							</Button>
						</FlexItem>
					</Flex>
				</Modal>
			) }
		</>
	);
}

/**
 * Wysiwyg - Main WYSIWYG field component with Visual/HTML tabs.
 * Uses inline editing with event isolation for Gutenberg by default.
 * Falls back to modal approach if forceModal is true.
 */
export function Wysiwyg( {
	id,
	htmlId,
	value,
	onChange,
	height = 300,
	className,
	disabled = false,
	setTitle,
	toolbar = 'full',
	delay = false,
	tabs = 'all', // 'all', 'visual', 'text'
	forceModal = false, // Force modal approach for Gutenberg
} ) {
	const [ view, setView ] = useState( VIEW_VISUAL );
	const { context } = useContext( AppContext );

	// Update field title from content.
	useEffect( () => {
		setTitle?.( stripHtml( value || '' ).replace( /\n/g, ' ' ).substring( 0, 50 ) );
	}, [ setTitle, value ] );

	// Determine which tabs to show.
	const canShowVisual = tabs === 'all' || tabs === 'visual';
	const canShowText = tabs === 'all' || tabs === 'text';
	const showTabs = tabs === 'all';

	// Force view based on tabs setting.
	useEffect( () => {
		if ( tabs === 'visual' && view === VIEW_HTML ) {
			setView( VIEW_VISUAL );
		} else if ( tabs === 'text' && view === VIEW_VISUAL ) {
			setView( VIEW_HTML );
		}
	}, [ tabs, view ] );

	// Determine if we need event isolation (Gutenberg context).
	const needsIsolation = context === 'gutenberg';

	// Check if Gutenberg is using iframe mode.
	const gutenbergIframeMode = context === 'gutenberg' && isGutenbergIframeMode();

	// Use modal approach if:
	// 1. forceModal is explicitly set, OR
	// 2. Gutenberg is in iframe mode (TinyMCE can't render across document boundaries)
	const useModal = context === 'gutenberg' && ( forceModal || gutenbergIframeMode );

	const editorComponent = (
		<TinyMCE
			htmlId={ htmlId }
			value={ value }
			onChange={ onChange }
			height={ height }
			disabled={ disabled }
			toolbar={ toolbar }
			delay={ delay }
		/>
	);

	return (
		<div className={ clsx( 'wpifycf-field-wysiwyg', `wpifycf-field-wysiwyg--${ id }`, className ) }>
			{ showTabs && (
				<div className="wpifycf-field-wysiwyg__tabs">
					{ canShowVisual && (
						<button
							type="button"
							className={ clsx( 'wpifycf-field-wysiwyg__tab', view === VIEW_VISUAL && 'active' ) }
							onClick={ () => setView( VIEW_VISUAL ) }
						>
							{ __( 'Visual', 'wpify-custom-fields' ) }
						</button>
					) }
					{ canShowText && (
						<button
							type="button"
							className={ clsx( 'wpifycf-field-wysiwyg__tab', view === VIEW_HTML && 'active' ) }
							onClick={ () => setView( VIEW_HTML ) }
						>
							{ __( 'HTML', 'wpify-custom-fields' ) }
						</button>
					) }
				</div>
			) }

			{ view === VIEW_VISUAL && (
				disabled ? (
					<RawHTML className="wpifycf-field-wysiwyg__raw">
						{ value }
					</RawHTML>
				) : useModal ? (
					<ModalTinyMCE
						htmlId={ htmlId }
						value={ value }
						onChange={ onChange }
						height={ height }
						disabled={ disabled }
						toolbar={ toolbar }
					/>
				) : needsIsolation ? (
					<EventIsolationWrapper>
						{ editorComponent }
					</EventIsolationWrapper>
				) : (
					editorComponent
				)
			) }

			{ view === VIEW_HTML && (
				<Code
					value={ value }
					onChange={ onChange }
					height={ height + 94 }
					id={ id }
					htmlId={ htmlId }
					language="html"
					theme="light"
					disabled={ disabled }
				/>
			) }
		</div>
	);
}

Wysiwyg.checkValidity = checkValidityStringType;
Wysiwyg.VIEW_VISUAL = VIEW_VISUAL;
Wysiwyg.VIEW_HTML = VIEW_HTML;

export default Wysiwyg;
