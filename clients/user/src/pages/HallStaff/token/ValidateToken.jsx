import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { default as jsQR } from 'jsqr';
import { hallStaffAPI } from '../../../services/api';
import '../HallStaffPages.css';

export const ValidateToken = () => {
    const [qrData, setQrData] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [result, setResult] = useState(null);
    const [scanMode, setScanMode] = useState('manual'); // 'manual' or 'camera'
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState('');

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const animationIdRef = useRef(null);

    // Get system diagnostics
    const getSystemInfo = () => {
        const info = {
            browser: navigator.userAgent,
            mediaDevicesSupported: !!navigator.mediaDevices?.getUserMedia,
            httpsEnabled: window.location.protocol === 'https:',
            localhost: window.location.hostname === 'localhost',
            platform: navigator.platform,
            timestamp: new Date().toISOString()
        };
        return info;
    };

    // Handle QR code data input (manual entry)
    const handleQrInput = (e) => {
        setQrData(e.target.value);
    };

    // Submit QR code data to backend
    const handleValidate = async () => {
        if (!qrData.trim()) {
            setMessage('Please enter or scan QR code data');
            setMessageType('error');
            return;
        }

        setLoading(true);
        setMessage('');
        setResult(null);

        try {
            const response = await hallStaffAPI.scanQrToken(qrData);
            const data = response.data;

            // Display result
            setResult(data);
            setMessage(data.message || 'Token scanned successfully');
            setMessageType(data.valid ? 'success' : 'error');

            // Clear input after successful scan
            if (data.valid) {
                setQrData('');
                // Auto-clear success message after 3 seconds
                setTimeout(() => {
                    setMessage('');
                    setResult(null);
                }, 3000);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setMessage(`Error validating token: ${errorMessage}`);
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    // Start camera QR scanning
    const startCamera = async () => {
        try {
            setCameraError('');

            // Check if mediaDevices API is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setCameraError('❌ Camera API not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.');
                console.error('MediaDevices API not available');
                return;
            }

            // Check HTTPS/secure context
            if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                setCameraError('⚠️ Camera requires HTTPS connection. Please use a secure connection.');
                console.error('Insecure context - HTTPS required');
                return;
            }

            // Try to access camera with better error handling
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setCameraActive(true);
                scanQrFromCamera();
            }
        } catch (error) {
            console.error('Camera error details:', {
                name: error.name,
                message: error.message,
                code: error.code
            });

            // Provide specific error messages based on error type
            let errorMsg = '';

            if (error.name === 'NotReadableError' || error.name === 'NotAllowedError') {
                errorMsg = '❌ Camera error: ' + error.name + '\n\n' +
                    'Troubleshooting:\n' +
                    '• Check if another app is using the camera\n' +
                    '• Try restarting the browser\n' +
                    '• Restart your laptop\n' +
                    '• Check camera permissions in system settings\n\n' +
                    'Alternative: Use manual QR entry mode instead.';
            } else if (error.name === 'NotFoundError') {
                errorMsg = '❌ No camera device found.\n\n' +
                    'Please ensure your laptop has a working camera connected.';
            } else if (error.name === 'SecurityError') {
                errorMsg = '❌ Camera access blocked for security reasons.\n\n' +
                    'Make sure:\n' +
                    '• You\'re using HTTPS (on localhost it\'s fine)\n' +
                    '• Camera permissions are not blocked in browser settings';
            } else if (error.name === 'AbortError') {
                errorMsg = '❌ Camera access aborted. The device may be disconnected.\n\n' +
                    'Please reconnect your camera and try again.';
            } else if (error.name === 'TypeError') {
                errorMsg = '❌ Camera not supported on this device or browser.\n\n' +
                    'Please use a modern browser (Chrome, Firefox, Safari, Edge).';
            } else {
                errorMsg = '❌ Camera unavailable: ' + (error.message || 'Unknown error') + '\n\n' +
                    'Please try:\n' +
                    '• Refresh the page\n' +
                    '• Check browser camera permissions\n' +
                    '• Switch to manual QR entry mode';
            }

            setCameraError(errorMsg);
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
        }
        setCameraActive(false);
        setCameraError('');
    };

    // Scan QR code from camera feed
    const scanQrFromCamera = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || !cameraActive) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const scan = async () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.hidden = true;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert',
                });

                if (code) {
                    // Found QR code
                    setQrData(code.data);
                    setMessage('QR code detected! Click Validate Token to process.');
                    setMessageType('success');
                    stopCamera();
                    return;
                }
            }

            animationIdRef.current = requestAnimationFrame(scan);
        };

        scan();
    };

    // Handle key press (Enter to validate)
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Enter' && qrData.trim() && !loading) {
                handleValidate();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [qrData, loading]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="page-wrapper">
            <Link to="/hallStaff/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card">
                <h1 className="page-title">Validate Meal Token</h1>
                <p className="page-subtitle">Scan or enter QR code to validate student meal tokens</p>

                {/* Message Display */}
                {message && (
                    <div className={`message ${messageType}`}>
                        {message}
                    </div>
                )}

                {/* Result Display */}
                {result && (
                    <div className={`token-result-card result-${result.valid ? 'success' : 'fail'}`}>
                        <div className="result-status">
                            {result.valid ? '✓ Valid' : '✗ Invalid'}
                        </div>
                        <div className="result-details">
                            <div className="result-item">
                                <span className="label">Status:</span>
                                <span className="value">{result.result}</span>
                            </div>
                            {result.mealType && (
                                <div className="result-item">
                                    <span className="label">Meal Type:</span>
                                    <span className="value">{result.mealType}</span>
                                </div>
                            )}
                            {result.mealDate && (
                                <div className="result-item">
                                    <span className="label">Meal Date:</span>
                                    <span className="value">{result.mealDate}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Mode Selector */}
                <div className="mode-selector" style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
                    <button
                        className={`mode-btn ${scanMode === 'manual' ? 'active' : ''}`}
                        onClick={() => {
                            setScanMode('manual');
                            stopCamera();
                            setMessage('');
                        }}
                    >
                        📝 Manual Entry
                    </button>
                    <button
                        className={`mode-btn ${scanMode === 'camera' ? 'active' : ''}`}
                        onClick={() => setScanMode('camera')}
                    >
                        📸 Scan Camera
                    </button>
                </div>

                {/* Manual Entry Mode */}
                {scanMode === 'manual' && (
                    <div className="qr-input-section">
                        <div className="form-group">
                            <label htmlFor="qrData">QR Code Data</label>
                            <textarea
                                id="qrData"
                                value={qrData}
                                onChange={handleQrInput}
                                placeholder="Scan QR code or paste the QR code data here..."
                                rows="4"
                                style={{
                                    fontFamily: 'monospace',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div className="qr-instructions">
                            <p>
                                <strong>How to use manual entry:</strong>
                            </p>
                            <ul>
                                <li>Use a QR code scanner device to scan the student's meal token QR code</li>
                                <li>The QR code data will be automatically entered into the text area above</li>
                                <li>Press Enter or click "Validate Token" to verify the token</li>
                            </ul>
                        </div>

                        <div className="button-group">
                            <button
                                onClick={handleValidate}
                                disabled={loading || !qrData.trim()}
                                className="btn btn-primary"
                            >
                                {loading ? 'Validating...' : 'Validate Token'}
                            </button>
                            <button
                                onClick={() => setQrData('')}
                                className="btn btn-cancel"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Camera Scan Mode */}
                {scanMode === 'camera' && (
                    <div className="camera-input-section">
                        {!cameraActive ? (
                            <>
                                <div className="camera-instructions">
                                    <p>
                                        <strong>📸 Camera QR Code Scanning</strong>
                                    </p>
                                    <p>
                                        Point your device's camera at the student's meal token QR code.
                                        The QR code will be automatically detected and extracted.
                                    </p>
                                    
                                </div>
                                <div className="button-group">
                                    <button
                                        onClick={startCamera}
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        📱 Start Camera
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="camera-container">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        style={{
                                            width: '100%',
                                            borderRadius: '8px',
                                            backgroundColor: '#000'
                                        }}
                                    />
                                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                                    <div className="camera-overlay">
                                        <div className="qr-scan-box" />
                                    </div>
                                </div>

                                {cameraError && (
                                    <div className="message error" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                                        {cameraError}
                                    </div>
                                )}

                                <div className="button-group">
                                    <button
                                        onClick={stopCamera}
                                        className="btn btn-cancel"
                                    >
                                        ✕ Stop Camera
                                    </button>
                                </div>

                                {qrData && (
                                    <div className="camera-result">
                                        <p><strong>QR Code Found:</strong></p>
                                        <button
                                            onClick={handleValidate}
                                            disabled={loading}
                                            className="btn btn-primary"
                                            style={{ width: '100%' }}
                                        >
                                            {loading ? 'Validating...' : 'Validate Token'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .page-wrapper {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem 1rem;
                }

                .back-link {
                    display: inline-block;
                    margin-bottom: 1.5rem;
                    color: #3498db;
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 0.2s;
                }

                .back-link:hover {
                    color: #2980b9;
                }

                .card {
                    background: white;
                    border-radius: 8px;
                    padding: 2rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .page-title {
                    margin: 0 0 0.5rem 0;
                    color: #2c3e50;
                    font-size: 1.8rem;
                }

                .page-subtitle {
                    margin: 0 0 1.5rem 0;
                    color: #7f8c8d;
                    font-size: 0.95rem;
                }

                /* Mode Selector */
                .mode-selector {
                    display: flex;
                    gap: 1rem;
                    border-bottom: 2px solid #ecf0f1;
                    padding-bottom: 1rem;
                }

                .mode-btn {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    border: none;
                    background: transparent;
                    color: #7f8c8d;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    border-bottom: 3px solid transparent;
                    position: relative;
                    bottom: -1rem;
                }

                .mode-btn:hover {
                    color: #3498db;
                }

                .mode-btn.active {
                    color: #3498db;
                    border-bottom-color: #3498db;
                }

                /* Token Result Card */
                .token-result-card {
                    margin: 1rem 0;
                    padding: 1.5rem;
                    border-radius: 8px;
                    border-left: 5px solid;
                }

                .result-success {
                    background-color: #d4edda;
                    border-left-color: #27ae60;
                }

                .result-fail {
                    background-color: #f8d7da;
                    border-left-color: #e74c3c;
                }

                .result-status {
                    font-size: 1.3rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                    color: inherit;
                }

                .result-success .result-status {
                    color: #155724;
                }

                .result-fail .result-status {
                    color: #721c24;
                }

                .result-details {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }

                .result-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.3rem;
                }

                .result-item .label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    opacity: 0.8;
                }

                .result-item .value {
                    font-size: 1rem;
                    font-weight: 600;
                    word-break: break-word;
                }

                /* Input Sections */
                .qr-input-section,
                .camera-input-section {
                    background: #f8f9fa;
                    padding: 1.5rem;
                    border-radius: 8px;
                    border: 1px solid #dee2e6;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: #2c3e50;
                    font-weight: 600;
                    font-size: 0.95rem;
                }

                .form-group textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 0.9rem;
                }

                .form-group textarea:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
                }

                /* Instructions */
                .qr-instructions,
                .camera-instructions {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 6px;
                    padding: 1rem;
                    margin: 1rem 0;
                    font-size: 0.9rem;
                }

                .qr-instructions p,
                .camera-instructions p {
                    margin: 0 0 0.5rem 0;
                    color: #2c3e50;
                }

                 .qr-instructions ul {
                     margin: 0;
                     padding-left: 1.5rem;
                     color: #555;
                 }

                 .qr-instructions li {
                     margin-bottom: 0.3rem;
                 }

                 /* Details/Summary (Troubleshooting) */
                 details {
                     cursor: pointer;
                 }

                 details summary {
                     outline: none;
                 }

                 details[open] summary {
                     margin-bottom: 0.75rem;
                 }

                 details ul {
                     margin: 0;
                     padding-left: 1.25rem;
                     color: #555;
                 }

                 details li {
                     margin-bottom: 0.5rem;
                     font-size: 0.9rem;
                 }

                 details code {
                     background-color: #f0f0f0;
                     padding: 2px 6px;
                     border-radius: 3px;
                     font-family: 'Courier New', monospace;
                     font-size: 0.85rem;
                 }

                /* Camera Styles */
                .camera-container {
                    position: relative;
                    width: 100%;
                    background: #000;
                    border-radius: 8px;
                    overflow: hidden;
                    margin: 1rem 0;
                }

                .camera-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                }

                .qr-scan-box {
                    width: 250px;
                    height: 250px;
                    border: 3px solid rgba(52, 211, 153, 0.7);
                    border-radius: 8px;
                    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(52, 211, 153, 0.5);
                    }
                    50% {
                        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 40px rgba(52, 211, 153, 0.8);
                    }
                }

                .camera-result {
                    background: #d4edda;
                    border: 1px solid #c3e6cb;
                    border-radius: 6px;
                    padding: 1rem;
                    margin: 1rem 0;
                    color: #155724;
                }

                .camera-result p {
                    margin: 0 0 1rem 0;
                    font-weight: 600;
                }

                 /* Messages */
                 .message {
                     padding: 1rem;
                     border-radius: 4px;
                     margin-bottom: 1rem;
                     font-weight: 600;
                     line-height: 1.6;
                 }

                 .message.error {
                     background-color: #f8d7da;
                     color: #721c24;
                     border: 1px solid #f5c6cb;
                     font-size: 0.9rem;
                     white-space: pre-wrap;
                     word-wrap: break-word;
                 }

                 .message.success {
                     background-color: #d4edda;
                     color: #155724;
                     border: 1px solid #c3e6cb;
                 }

                /* Buttons */
                .button-group {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }

                .btn {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 4px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-decoration: none;
                    display: inline-block;
                }

                .btn-primary {
                    background-color: #3498db;
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    background-color: #2980b9;
                }

                .btn-cancel {
                    background-color: #95a5a6;
                    color: white;
                }

                .btn-cancel:hover:not(:disabled) {
                    background-color: #7f8c8d;
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 640px) {
                    .card {
                        padding: 1.5rem 1rem;
                    }

                    .page-title {
                        font-size: 1.5rem;
                    }

                    .result-details {
                        grid-template-columns: 1fr;
                    }

                    .button-group {
                        flex-direction: column;
                    }

                    .btn {
                        width: 100%;
                    }

                    .mode-selector {
                        flex-direction: column;
                    }

                    .mode-btn {
                        padding: 0.75rem;
                        bottom: 0;
                        border-bottom: 2px solid #ecf0f1 !important;
                    }

                    .mode-btn.active {
                        border-bottom-color: #3498db !important;
                    }

                    .qr-scan-box {
                        width: 150px;
                        height: 150px;
                    }
                }
            `}</style>
        </div>
    );
};





