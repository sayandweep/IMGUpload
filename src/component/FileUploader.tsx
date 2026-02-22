import { useState, useRef, type ChangeEvent } from "react";
import '../index.css'
import {supabase} from '../supabase'





// type
type UploadingStatus = 'idle' | 'uploading' | 'success' | 'error';





// export
export default function FileUploader() {

	const [file, setFile] = useState<File | null>(null);
	const [status, setStatus] = useState<UploadingStatus>('idle');
	const [uploadProgress, setUploadProgress] = useState(0);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [shareLink, setShareLink] = useState<string>('');
	const [cWord, setCWord] = useState<string>('Copy Link');
	const [color, setColor] = useState<string>('');


    function uploaderDiv() {
        fileInputRef.current?.click();
    }

	function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
		if (e.target.files) {
			setFile(e.target.files[0]);
		}
	}

	async function uploadHandler() {
		if (!file) return;

		setStatus('uploading');
        setUploadProgress(0);


		const formData = new FormData();
		formData.append('file', file);

		try {

			const fileExt = file.name.split('.').pop();
			const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

			const progressInterval = setInterval(() => {
				setUploadProgress(prev => {
					if (prev >= 90) {
						clearInterval(progressInterval);
						return 90;
					}
					return prev + 10;
				});
			}, 200);

			// Upload to Supabase Storage
			const { error } = await supabase.storage
				.from('uploads')
				.upload(fileName, file, {
					cacheControl: '3600',
					upsert: false
				});

			clearInterval(progressInterval);
			setUploadProgress(100);

			if (error) {
				throw error;
			}

			// Get public URL
			const { data: urlData } = supabase.storage
				.from('uploads')
				.getPublicUrl(fileName);

			setShareLink(urlData.publicUrl);
			setStatus('success');


		} catch (error) {
			console.error('Upload error:', error);
			setStatus('error');
		}
	}

	function copyToClipboard() {
		navigator.clipboard.writeText(shareLink);
		setCWord('Copied');
		setColor('rgb(0, 106, 48)')
	}

	//return
	return (

	<div className="upload-container">
        <div className="fileinput" onClick={uploaderDiv}>
            <h2>Upload IMG</h2>
            <input type="file" ref={fileInputRef} className="uploadfile" onChange={handleFileChange} hidden accept=".jpg,.jpeg,.png,.gif"/>
    </div>





		{file && (
			<div className="file-info">
			<p>Name: {file.name}</p>
			<p>Type: {(file.size / 1024).toFixed(1)}KB</p>
			<p>Type: {file.type}</p>
			</div>
		)}



		{file && status === 'uploading' && <button disabled>{uploadProgress}%</button>}
		{file && status === 'success' &&
        <div>
            {/* <button onClick={() => {setFile(null); setStatus('idle')}} style={{width: '100%'}} id='reset-btn'>Reset</button> */}
						<button onClick={copyToClipboard} style={{width: '100%', background: color}} id='copy-btn'>{cWord}</button>
        </div>
        }
		{file && status === 'error' && <p>Upload failed. Please try again.</p>}

		{file && status === 'idle' && <button onClick={uploadHandler}>Upload</button>}
		
		</div>
	);
}
