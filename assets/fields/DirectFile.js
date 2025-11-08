import { __, sprintf } from '@wordpress/i18n';
import { useState, useRef } from '@wordpress/element';
import { Button, Icon, Spinner } from '@wordpress/components';
import { upload as uploadIcon, trash as trashIcon, page as pageIcon } from '@wordpress/icons';
import { checkValidityStringType } from '../helpers/validators';
import { useDirectFileUpload, useDirectFileInfo } from '../helpers/hooks';

function DirectFile({ id, htmlId, value, onChange, required, allowed_types, max_size, ...props }) {
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState(null);
	const [fileSize, setFileSize] = useState(null);
	const fileInputRef = useRef(null);
	const uploadMutation = useDirectFileUpload();
	const fileInfo = useDirectFileInfo(value);

	const formatFileSize = (bytes) => {
		if (!bytes) return '';
		const sizes = ['B', 'KB', 'MB', 'GB'];
		if (bytes === 0) return '0 B';
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
	};

	const handleFileSelect = (event) => {
		const file = event.target.files[0];
		if (!file) return;

		setError(null);

		// Validate file size
		if (max_size && file.size > max_size) {
			const maxSizeMB = (max_size / 1024 / 1024).toFixed(2);
			setError(
				sprintf(__('File size exceeds maximum allowed size of %sMB', 'wpify-custom-fields'), maxSizeMB)
			);
			return;
		}

		// Validate MIME type
		if (allowed_types && allowed_types.length > 0 && !allowed_types.includes(file.type)) {
			setError(
				sprintf(__('File type "%s" is not allowed', 'wpify-custom-fields'), file.type)
			);
			return;
		}

		// Upload file using the custom hook
		setUploading(true);
		setProgress(0);

		uploadMutation.mutate(
			{
				file,
				fieldId: id,
				onProgress: setProgress,
			},
			{
				onSuccess: (response) => {
					onChange(response.temp_path);
					setFileSize(response.size);
					setUploading(false);
					setProgress(0);
				},
				onError: (error) => {
					setError(error.message || __('Upload failed', 'wpify-custom-fields'));
					setUploading(false);
					setProgress(0);
				},
			}
		);
	};

	const handleDelete = () => {
		onChange('');
		setFileSize(null);
		setError(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleButtonClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const getFileName = () => {
		if (!value || typeof value !== 'string') return '';
		// Extract filename from path
		const parts = value.split('/');
		return parts[parts.length - 1];
	};

	const getFileUrl = () => {
		if (!value || typeof value !== 'string') return null;

		// Check if file is within ABSPATH (public directory)
		const abspath = window.wpifycf?.abspath || '';
		const siteUrl = window.wpifycf?.site_url || '';

		if (abspath && siteUrl && value.startsWith(abspath)) {
			// File is in public directory, convert to URL
			return value.replace(abspath, siteUrl + '/');
		}

		// File is outside public directory, not downloadable
		return null;
	};

	const isDownloadable = getFileUrl() !== null;
	const hasFile = typeof value === 'string' && value.length > 0;

	return (
		<div className="wpifycf-field-direct-file">
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileSelect}
				style={{ display: 'none' }}
				accept={allowed_types && allowed_types.length > 0 ? allowed_types.join(',') : undefined}
			/>

			{!hasFile && !uploading && (
				<div className="wpifycf-direct-file-empty">
					<Button
						variant="secondary"
						onClick={handleButtonClick}
						icon={uploadIcon}
					>
						{__('Choose File', 'wpify-custom-fields')}
					</Button>
				</div>
			)}

			{uploading && (
				<div className="wpifycf-direct-file-uploading">
					<Spinner />
					<div className="wpifycf-direct-file-progress">
						<div
							className="wpifycf-direct-file-progress-bar"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<span className="wpifycf-direct-file-progress-text">
						{__('Uploading...', 'wpify-custom-fields')} {Math.round(progress)}%
					</span>
				</div>
			)}

			{hasFile && !uploading && (
				<div className="wpifycf-direct-file-preview">
					<div className="wpifycf-direct-file-info">
						<Icon icon={pageIcon} />
						<div className="wpifycf-direct-file-details">
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
							<span className="wpifycf-direct-file-meta">
								<span className="wpifycf-direct-file-path">{value}</span>
								{(fileSize || fileInfo?.data?.size) && (
									<span className="wpifycf-direct-file-size">
										{formatFileSize(fileSize || fileInfo?.data?.size)}
									</span>
								)}
							</span>
						</div>
					</div>
					<div className="wpifycf-direct-file-actions">
						<Button
							variant="secondary"
							onClick={handleButtonClick}
							icon={uploadIcon}
							isSmall
						>
							{__('Replace', 'wpify-custom-fields')}
						</Button>
						<Button
							variant="secondary"
							onClick={handleDelete}
							icon={trashIcon}
							isDestructive
							isSmall
						>
							{__('Remove', 'wpify-custom-fields')}
						</Button>
					</div>
				</div>
			)}

			{error && (
				<div className="wpifycf-direct-file-error">
					{error}
				</div>
			)}
		</div>
	);
}

DirectFile.checkValidity = checkValidityStringType;

export default DirectFile;
