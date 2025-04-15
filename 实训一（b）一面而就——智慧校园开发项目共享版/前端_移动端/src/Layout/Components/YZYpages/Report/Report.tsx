import React, { useState, useEffect, useRef } from "react";
import { NavBar, Toast, Picker, Cell, TextArea, Input, Form, Switch } from '@nutui/nutui-react';
import { ArrowLeft, Close, Plus } from '@nutui/icons-react';
import { useNavigate } from "react-router-dom";
import sparkMD5 from 'spark-md5';
import axios from 'axios';
import report from '../css/report.module.css';
// 接口
import userService from '../axios/userService';

// 定义常量，每个文件分片的大小为 5MB
const CHUNK_SIZE = 5 * 1024 * 1024;

// 隐患类型选项接口
interface PickerOption {
    text: string | number;
    value: string | number;
    disabled?: boolean;
    children?: PickerOption[];
    className?: string | number;
}

const http = "http://localhost:3000";

// 定义 Report 组件
const Report: React.FC = () => {
    // 用于页面导航
    const nav = useNavigate();
    // 隐患信息
    const [value, setValue] = useState<string>('');
    // 隐患类型选择器是否可见
    const [isVisible, setIsVisible] = useState<boolean>(false);
    // 所选隐患类型的描述
    const [baseDesc, setBaseDesc] = useState<string>('');
    // 所选隐患类型的值
    const [val, setVal] = useState<Array<number | string>>([]);
    // 隐患类型选项
    const [options, setOptions] = useState<PickerOption[]>([]);
    // 隐患地点
    const [place, setPlace] = useState('');
    // 是否已处理
    const [checkedAsync, setCheckedAsync] = useState<boolean>(false);
    // 用于存储用户选择的文件
    const [file, setFile] = useState<File | null>(null);
    // 上传进度
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    // 用于防止重复触发上传逻辑
    const uploading = useRef<boolean>(false);
    // 提交表单时的加载状态
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // 获取隐患类型
    const fetchType = async () => {
        try {
            const data = await userService.getType();
            setOptions(data);
        } catch (error) {
            console.error("加载类型失败", error);
            Toast.show('加载类型失败，请稍后重试')
        }
    };

    useEffect(() => {
        fetchType();
    }, []);

    // 确认选择隐患类型后的处理函数
    const confirmPicker = (
        options: PickerOption[],
        values: (string | number)[]
    ): void => {
        let description = '';
        options.forEach((option: PickerOption) => {
            description += ` ${option.text}`;
        });
        setBaseDesc(description);
        setVal(values);
    };

    // 处理文件选择事件
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setUploadProgress(0);
        }
    };

    // 计算文件的唯一标识 (哈希)
    const calculateFileHash = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>): void => {
                if (e.target && e.target.result instanceof ArrayBuffer) {
                    const hash = sparkMD5.ArrayBuffer.hash(e.target.result);
                    resolve(hash);
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsArrayBuffer(file);
        });
    };

    // 上传单个分片
    const uploadChunk = async (chunk: Blob, fileHash: string, chunkIndex: number, fileName: string) => {
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('fileName', fileName);
        formData.append('fileHash', fileHash);
        formData.append('chunkIndex', chunkIndex.toString());

        return axios.post(
            `http://localhost:3000/YZY/upload?fileHash=${fileHash}&chunkIndex=${chunkIndex}&fileName=${fileName}`,
            formData,
            {
                onUploadProgress: (progressEvent: ProgressEvent): void => {
                    const totalChunks = Math.ceil(file!.size / CHUNK_SIZE);
                    const progress =
                        ((chunkIndex + progressEvent.loaded / progressEvent.total) /
                            totalChunks) *
                        100;
                    setUploadProgress(progress);
                },
            },
        );
    };

    // 开始文件上传
    const handleUpload = async (): Promise<void> => {
        if (!file || uploading.current) return;

        uploading.current = true;
        try {
            const fileHash = await calculateFileHash(file);
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            // 检查哪些分片已经上传
            const { data: uploadedChunks } = await axios.post(
                'http://localhost:3000/YZY/check',
                {
                    fileName: file.name,
                    fileHash,
                },
            );

            // 上传未完成的分片
            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                if (uploadedChunks?.includes(chunkIndex)) {
                    console.log('跳过chunkIndx', chunkIndex);
                    setUploadProgress(((chunkIndex + 1) / totalChunks) * 100);
                    continue;
                }
                console.log('上传chunkIndx', chunkIndex);
                const start = chunkIndex * CHUNK_SIZE;
                const end = Math.min(file.size, start + CHUNK_SIZE);
                const chunk = file.slice(start, end);

                await uploadChunk(chunk, fileHash, chunkIndex, file.name);
            }

            // 通知服务端合并分片
            await axios.post('http://localhost:3000/YZY/merge', {
                fileName: file.name,
                fileHash,
                totalChunks,
            });
            Toast.show('上传成功！')
            
        } catch (error) {
            console.error('文件上传失败', error);
            Toast.show('文件上传失败，请稍后重试')
        } finally {
            uploading.current = false;
        }
    };

    // 提交隐患信息
    const hiddenAdd = async () => {
        if (value === '') {
            Toast.show('请补全内容~')
            return;
        }
        setIsSubmitting(true);
        try {
            const { data: { code, msg } } = await axios.post("http://localhost:3000/YZY/hiddenAdd", {
                type: val,
                detail: value,
                PhotosOrVideos: `${http}/routes/uploads/${file?.name}`,
                place: place,
                dispose: checkedAsync,
                userName: '67ceda39068d580ff8b29676',
                time: new Date(),
            });
            if (code === 200) {
               
                Toast.show(msg)
                await handleUpload();
                nav('/Check');
            }
        } catch (error) {
            Toast.show('提交信息失败，请稍后重试')
        } finally {
            setIsSubmitting(false);
        }
    };

    // 处理开关状态变化
    const onChangeAsync = (value: boolean, event: any): void => {
        setCheckedAsync(value);
    };

    return (
        <div className="p-4">
            {/* 头部 */}
      
                <NavBar
                    right={<span onClick={hiddenAdd} className={`${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>提交</span>}
                    back={<ArrowLeft />}
                    onBackClick={() => { nav('/layout'); }}
                    fixed
                    placeholder
                >
                    <div className="title">
                        <span className="desc">工作审批</span>
                    </div>
                </NavBar>
  
            {/* 隐患类型 */}
            <Cell
                title="上报类型"
                description={baseDesc}
                onClick={() => setIsVisible(!isVisible)}
                className="mt-4"
            />
            <Picker
                title="请选择上报类型"
                visible={isVisible}
                value={val}
                options={options}
                onConfirm={confirmPicker}
                onClose={() => {
                    setIsVisible(false)
                }}
            />
            {/* 隐患描述信息 */}
            <TextArea
                value={value}
                onChange={(newValue) => setValue(newValue)}
                placeholder="请输入描述信息..."
                className="mt-4"
                style={{ height: '180px' }}
            />
            {/* 上传视频或图片 */}
            <Cell className="mt-4 flex flex-wrap items-center pb-0">
                <input type="file" onChange={handleFileChange} id={report.fileInput} multiple className="float-left" />
                <div className="ml-5 mt-0">
                    <progress value={uploadProgress} max="100" className="w-full" />
                    <div>上传进度：{uploadProgress.toFixed(2)}%</div>
                </div>
            </Cell>
            {/* 隐患地点 */}
            <Form className="mt-4">
                <Form.Item label="上报标题" name="username">
                    <Input
                        className="nut-input-text"
                        placeholder="请输入标题"
                        type="text"
                        onChange={(val) => setPlace(val)}
                    />
                </Form.Item>
                {/* 是否已处理 */}
                <Form.Item label="是否已处理">
                    <div className="flex items-center">
                        <span className="mr-2">否</span>
                        <Switch
                            className="mr-2"
                            checked={checkedAsync}
                            onChange={onChangeAsync}
                        />
                        <span>是</span>
                    </div>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Report;
    