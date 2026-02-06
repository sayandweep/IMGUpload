import { useState, useRef, type ChangeEvent } from "react";
import '../index.css'
import axios from "axios";





// type
type UploadingStatus = 'idle' | 'uploading' | 'success' | 'error';





// export
export default function FileUploader() {

	const [file, setFile] = useState<File | null>(null);
	const [status, setStatus] = useState<UploadingStatus>('idle');
	const [uploadProgress, setUploadProgress] = useState(0);
	const fileInputRef = useRef<HTMLInputElement>(null);


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
            await axios.post('https://httpbin.org/post', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},

                onUploadProgress: (progressEvent) => {
                    const prog = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
                    setUploadProgress(prog);
                }
			});

			setStatus('success');
		} catch (error) {
			console.error('Upload error:', error);
			setStatus('error');
		}
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
            <button disabled>{uploadProgress}% Uploaded</button>
            <button onClick={() => {setFile(null); setStatus('idle')}} style={{width: '100%'}} id='reset-btn'>Reset</button>
        </div>
        }
		{file && status === 'error' && <p>Upload failed. Please try again.</p>}

		{file && status === 'idle' && <button onClick={uploadHandler}>Upload</button>}

		</div>
	);
}
