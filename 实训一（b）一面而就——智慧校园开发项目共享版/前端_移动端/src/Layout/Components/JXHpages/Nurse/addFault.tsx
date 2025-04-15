
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker'; // 日期选择器
import 'react-datepicker/dist/react-datepicker.css';
import style from './nurse.module.css';
import { NavBar } from 'antd-mobile'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'animate.css';
import {  Toast } from 'antd-mobile';


interface FormData {
	date: Date;
	status: 'normal' | 'abnormal';
	summary: string;
	images: string[];   
	name:string;
	school:string;
	img:string,
	num:string
}

export default function NurseForm() {
	const navigate = useNavigate();
	const userMsg = JSON.parse(localStorage.getItem('userMsg')) || []
	// console.log(userMsg,'124');
	
	const [formData, setFormData] = useState<FormData>({
		date: new Date(),
		status: 'normal',      
		summary: '',   //巡逻总结
		images: [],
		name:userMsg.name,
		school:'保定振涛教育',
		img:'1',
		num :'4'
	});

	const [tempImage, setTempImage] = useState<string | null>(null);

	const handleDateChange = (date: Date) => {
		setFormData({ ...formData, date });
	};

	const handleStatusChange = (status: 'normal' | 'abnormal') => {
		setFormData(obj => ({
			...obj, 
			status,
			num: status === 'abnormal'? '1' : '4'
		}))
		// if (status === 'abnormal') {
		// 	setFormData({ ...formData, num: '1' });
		// } else if (status === 'normal') {
		// 	setFormData({ ...formData, num: '4' });
		// }
		// setFormData({ ...formData, status });
	};

	const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setFormData({ ...formData, summary: e.target.value });
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			const reader = new FileReader();
			reader.onload = (event) => {
				setTempImage(event.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const addImage = () => {
		if (tempImage) {
			setFormData({ ...formData, images: [...formData.images, tempImage] })
			setTempImage(null)
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault(); 
		// console.log(formData,'124421142');
		let res = await axios.post('http://localhost:3000/JXH/jaddfault',{formData:formData},{
			headers: { 
			  'Content-Type': 'multipart/form-data', // 确保正确设置Content-Type
			},
		  })
		console.log(res.data.data);
		if (res.data.code === 200) {
			Toast.show({
				content: '提交成功',
			  })
			  window.history.back()
		} else {
			// alert('提交失败');
		}
		
	};

	useEffect(() => {

		
	},[])

	return (
		<div>
		<div className={style.formContainer}>
			<form onSubmit={handleSubmit}>
				{/* <div className={style.header}>
          <span className={style.backButton}>◀think▷</span>
          <h2>护学岗</h2>
        </div> */}
				<div title='返回按钮显示文字' className={style.title} onClick={() => { window.history.back() }}>
					<NavBar back=''  >
						护学岗
					</NavBar>
				</div>

				<div className={style.formGroup}>
					<label>填报日期</label>
					<DatePicker
						selected={formData.date}
						onChange={handleDateChange}
						dateFormat="yyyy-MM-dd"
						className={style.datePicker}
						popperPlacement="bottom-start"
					/>
				</div>

				<div className={style.formGroup}>
					<label>巡逻情况</label>
					<div className={style.radioGroup}>
						<label>
							<input
								type="radio"
								name="status"
								checked={formData.status === 'normal'}
								onChange={() => handleStatusChange('normal')}
							/>
							正常
						</label>
						<label>
							<input
								type="radio"
								name="status"
								checked={formData.status === 'abnormal'}
								onChange={() => handleStatusChange('abnormal')}
							/>
							异常
						</label>
					</div>
				</div>

				<div className={style.formGroup}>
					<label>巡逻总结</label>
					<textarea
						value={formData.summary}
						onChange={handleSummaryChange}
						placeholder="请输入护导总结..."
						className={style.textarea}
					/>
				</div>
 
				<div className={style.formGroup}>
					<label>视频或图片</label>
					<div className={style.imageUploader}>
						<input
							type="file"
							accept="image/*"
							onChange={handleImageUpload}
							style={{ display: 'none' }}
							id="imageInput"
						/>
						<label htmlFor="imageInput" className={style.uploadButton}>
							<span className={style.plusSign}>+</span>
							<span>上传图片</span>
						</label>
						{tempImage && (
							<div className={style.previewContainer}>
								<img src={tempImage} alt="Preview" className={style.previewImage} />
								<button type="button" onClick={addImage} className={style.addButton}>
									添加
								</button>
							</div>
						)}
						<div className={style.imageGallery}>
							{formData.images.map((image, index) => (
								<div key={index} className={style.imageItem}>
									<img src={image} alt={`Uploaded ${index}`} className={style.galleryImage} />
								</div>
							))}
						</div>
					</div>
				</div>

				<button type="submit" className={style.submitButton}>
					提交
				</button>
			</form>
		</div></div>
	);
}