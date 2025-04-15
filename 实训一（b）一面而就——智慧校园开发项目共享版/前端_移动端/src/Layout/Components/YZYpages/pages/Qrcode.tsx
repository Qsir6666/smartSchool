import  { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';  // 修改导入方式
import { Overlay, Loading,  } from '@nutui/nutui-react'
import { QrCode, } from '@nutui/icons-react';

const QRCodeGenerator = ({
    value,
    buttonText = <QrCode></QrCode>,
    downloadText = '下载二维码 (JPEG)',
    size = 256,
    bgColor = '#ffffff',
    fgColor = '#000000',
    level = 'H',  // 提高容错率
}) => {
    const qrCodeRef = useRef(null);

    const downloadQRCode = () => {
        if (qrCodeRef.current) {
            const svg = qrCodeRef.current;
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            canvas.width = size;
            canvas.height = size;
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const url = canvas.toDataURL('image/jpeg', 1.0);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'qrcode.jpg';
                link.click();
            };
            img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
        }
    };

    const [visible, setVisible] = useState(false)
    const wrapperStyle = {
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    }

    const [a, seta] = useState(false)
    const handleToggleShow = () => {
        setVisible(true)
        setTimeout(() => {
            seta(true)
        }, 2000)
    }
    const onClose = () => {
        setVisible(false)
        seta(false);
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <button
                onClick={() => handleToggleShow()}
                style={{ padding: '1px 1px', }}
            >
                {buttonText}
            </button>

            <Overlay visible={visible} onClick={onClose}>
                <div className="wrapper" style={wrapperStyle}>
                    {a ? undefined : <Loading>生成中</Loading>}
                    {a ? <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                        <div>
                            <QRCodeSVG
                                ref={qrCodeRef}
                                value={value}
                                size={size}
                                bgColor={bgColor}
                                fgColor={fgColor}
                                level={level}
                                includeMargin={true}
                            />
                        </div>
                        <button
                            onClick={downloadQRCode}
                            style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}
                        >
                            {downloadText}
                        </button>
                    </div> : undefined}
                </div>
            </Overlay>
        </div>
    );
};

export default QRCodeGenerator;