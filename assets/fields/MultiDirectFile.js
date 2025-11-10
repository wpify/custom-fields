import { useCallback, useEffect, useState, useRef } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { Button, Icon, Spinner } from '@wordpress/components';
import { upload as uploadIcon, trash as trashIcon, page as pageIcon } from '@wordpress/icons';
import { useSortableList, useDirectFileUpload, useDirectFileInfo } from '@/helpers/hooks';
import { IconButton } from '@/components/IconButton';
import clsx from 'clsx';
import { checkValidityMultiNonZeroType } from '@/helpers/validators';

function DirectFileItem({ file, onRemove, disabled }) {
	const fileInfo = useDirectFileInfo(file.path);

	const formatFileSize = (bytes) => {
		if (!bytes) return '';
		const sizes = ['B', 'KB', 'MB', 'GB'];
		if (bytes === 0) return '0 B';
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
	};

	const getFileName = () => {
		if (!file.path || typeof file.path !== 'string') return file.name || '';
		// Extract filename from path
		const parts = file.path.split('/');
		return parts[parts.length - 1];
	};

	const getFileUrl = () => {
		if (!file.path || typeof file.path !== 'string') return null;

		// Check if file is within ABSPATH (public directory)
		const abspath = window.wpifycf?.abspath || '';
		const siteUrl = window.wpifycf?.site_url || '';

		if (abspath && siteUrl && file.path.startsWith(abspath)) {
			// File is in public directory, convert to URL
			return file.path.replace(abspath, siteUrl + '/');
		}

		// File is outside public directory, not downloadable
		return null;
	};

	const isDownloadable = getFileUrl() !== null;

	return (
		<div className={clsx('wpifycf-multi-direct-file-item', {
			'wpifycf-multi-direct-file-item--uploading': file.uploading
		})}>
			{!disabled && (
				<div className="wpifycf-multi-direct-file-item__sort">
					<IconButton icon="move" className="wpifycf-sort" />
				</div>
			)}
			<div className="wpifycf-multi-direct-file-item__content">
				{file.uploading ? (
					<div className="wpifycf-direct-file-uploading">
						<Spinner />
						<div className="wpifycf-direct-file-progress">
							<div
								className="wpifycf-direct-file-progress-bar"
								style={{ width: `${file.progress || 0}%` }}
							/>
						</div>
						<span className="wpifycf-direct-file-progress-text">
							{__('Uploading...', 'wpify-custom-fields')} {Math.round(file.progress || 0)}%
						</span>
					</div>
				) : (
					<div className="wpifycf-direct-file-info">
						<Icon icon={pageIcon} />
						<div className="wpifycf-direct-file-details">
							<div className="wpifycf-direct-file-header">
								{isDownloadable ? (
									<a
										href={getFileUrl()}
										target="_blank"
										rel="noopener noreferrer"
										className="wpifycf-direct-file-name wpifycf-direct-file-name--link"
									>
										{getFileName()}
									</a>
								) : (
									<span className="wpifycf-direct-file-name">
										{getFileName()}
									</span>
								)}
								{!disabled && (
									<div className="wpifycf-multi-direct-file-item__actions">
										<IconButton icon="trash" onClick={onRemove} />
									</div>
								)}
							</div>
							<span className="wpifycf-direct-file-path">{file.path}</span>
							{(file.size || fileInfo?.data?.size) && (
								<span className="wpifycf-direct-file-size">
									{formatFileSize(file.size || fileInfo?.data?.size)}
								</span>
							)}
						</div>
					</div>
				)}
				{file.error && (
					<div className="wpifycf-direct-file-error">
						{file.error}
					</div>
				)}
			</div>
		</div>
	);
}

function MultiDirectFile({
	id,
	value = [],
	onChange,
	className,
	disabled = false,
	allowed_types,
	max_size,
}) {
	useEffect(() => {
		if (!Array.isArray(value)) {
			onChange([]);
		}
	}, [value, onChange]);

	const [files, setFiles] = useState([]);
	const containerRef = useRef(null);
	const fileInputRef = useRef(null);
	const uploadMutation = useDirectFileUpload();
	const lastSyncedValueRef = useRef([]);

	// Load files from value prop (on mount or external changes)
	useEffect(() => {
		// Check if this is an external change (not from our onChange)
		const currentValueStr = JSON.stringify([...value].sort());
		const lastSyncedStr = JSON.stringify([...lastSyncedValueRef.current].sort());
		const isExternalChange = currentValueStr !== lastSyncedStr;

		// Only process if value changed externally (not from our own onChange)
		if (isExternalChange) {
			setFiles(prevFiles => {
				// Don't interfere with active uploads
				const hasUploading = prevFiles.some(f => f.uploading);
				if (hasUploading) return prevFiles;

				if (Array.isArray(value) && value.length > 0) {
					const valueFiles = value.map((path, index) => {
						// Check if we already have this file in state
						const existingFile = prevFiles.find(f => f.path === path);
						if (existingFile) {
							return existingFile;
						}
						// Create new file object
						return {
							id: `file-${index}-${path}`,
							path,
							name: path.split('/').pop(),
							uploading: false,
							progress: 0,
							error: null,
						};
					});

					return valueFiles;
				} else if (value.length === 0) {
					// Value was cleared
					return [];
				}

				return prevFiles;
			});
		}
	}, [value]);

	// Sync files state to value prop (when files change)
	useEffect(() => {
		const paths = files
			.filter(f => !f.uploading && f.path && !f.error)
			.map(f => f.path);

		// Only call onChange if paths actually changed
		const currentPaths = JSON.stringify(paths.sort());
		const valuePaths = JSON.stringify([...value].sort());

		if (currentPaths !== valuePaths) {
			// Update the ref before calling onChange to prevent re-initialization
			lastSyncedValueRef.current = paths;
			onChange(paths);
		}
	}, [files, value, onChange]);

	const onSortEnd = useCallback((sortedFiles) => {
		setFiles(sortedFiles);
		// Extract paths from sorted files and update value
		const paths = sortedFiles.filter(f => !f.uploading && f.path).map(f => f.path);
		lastSyncedValueRef.current = paths;
		onChange(paths);
	}, [onChange]);

	useSortableList({
		containerRef,
		items: files,
		setItems: onSortEnd,
		disabled,
		dragHandle: '.wpifycf-multi-direct-file-item__sort',
	});

	const formatFileSize = (bytes) => {
		if (!bytes) return '';
		const sizes = ['B', 'KB', 'MB', 'GB'];
		if (bytes === 0) return '0 B';
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
	};

	const handleFilesSelect = useCallback(async (event) => {
		const selectedFiles = Array.from(event.target.files);
		if (selectedFiles.length === 0) return;

		// Create temporary file objects for each selected file
		const tempFiles = selectedFiles.map((file, index) => ({
			id: `uploading-${Date.now()}-${index}`,
			name: file.name,
			size: file.size,
			uploading: true,
			progress: 0,
			error: null,
			file, // Store the actual File object temporarily
		}));

		// Add uploading files to the display
		setFiles(prevFiles => [...prevFiles, ...tempFiles]);

		// Create upload promises for each file
		const uploadPromises = tempFiles.map(async (tempFile) => {
			const file = tempFile.file;

			// Validate file size
			if (max_size && file.size > max_size) {
				const maxSizeMB = (max_size / 1024 / 1024).toFixed(2);
				return {
					id: tempFile.id,
					success: false,
					error: sprintf(__('File size exceeds maximum allowed size of %sMB', 'wpify-custom-fields'), maxSizeMB),
				};
			}

			// Validate MIME type
			if (allowed_types && allowed_types.length > 0 && !allowed_types.includes(file.type)) {
				return {
					id: tempFile.id,
					success: false,
					error: sprintf(__('File type "%s" is not allowed', 'wpify-custom-fields'), file.type),
				};
			}

			// Upload file
			try {
				const response = await uploadMutation.mutateAsync({
					file,
					fieldId: id,
					onProgress: (progress) => {
						setFiles(prevFiles =>
							prevFiles.map(f =>
								f.id === tempFile.id
									? { ...f, progress }
									: f
							)
						);
					},
				});

				return {
					id: tempFile.id,
					success: true,
					response,
				};
			} catch (error) {
				return {
					id: tempFile.id,
					success: false,
					error: error.message || __('Upload failed', 'wpify-custom-fields'),
				};
			}
		});

		// Wait for all uploads to complete
		const results = await Promise.allSettled(uploadPromises);

		// Update all file states atomically
		setFiles(prevFiles =>
			prevFiles.map(f => {
				const result = results.find(r =>
					r.status === 'fulfilled' && r.value.id === f.id
				);

				if (!result || result.status === 'rejected') return f;

				const uploadResult = result.value;

				if (uploadResult.success) {
					return {
						...f,
						path: uploadResult.response.temp_path,
						size: uploadResult.response.size,
						uploading: false,
						progress: 0,
						error: null,
						file: undefined, // Remove the File object
					};
				} else {
					return {
						...f,
						uploading: false,
						progress: 0,
						error: uploadResult.error,
					};
				}
			})
		);

		// Clear the input
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	}, [id, max_size, allowed_types, uploadMutation]);

	const remove = useCallback(
		(removeId) => () => {
			setFiles(prevFiles => prevFiles.filter((file) => file.id !== removeId));
		},
		[]
	);

	const handleButtonClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	return (
		<div
			className={clsx('wpifycf-field-multi-direct-file', `wpifycf-field-multi-direct-file--${id}`, className)}
		>
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFilesSelect}
				style={{ display: 'none' }}
				accept={allowed_types && allowed_types.length > 0 ? allowed_types.join(',') : undefined}
				multiple
			/>

			{!disabled && (
				<Button
					className="wpifycf-button__add"
					onClick={handleButtonClick}
					icon={uploadIcon}
					variant="secondary"
					isSmall
				>
					{__('Add files', 'wpify-custom-fields')}
				</Button>
			)}

			{files.length > 0 && (
				<div className="wpifycf-multi-direct-file-items" ref={containerRef}>
					{files.map((file) => (
						<DirectFileItem
							key={file.id}
							file={file}
							remove={remove(file.id)}
							onRemove={remove(file.id)}
							disabled={disabled}
						/>
					))}
				</div>
			)}
		</div>
	);
}

MultiDirectFile.checkValidity = checkValidityMultiNonZeroType;

export default MultiDirectFile;
