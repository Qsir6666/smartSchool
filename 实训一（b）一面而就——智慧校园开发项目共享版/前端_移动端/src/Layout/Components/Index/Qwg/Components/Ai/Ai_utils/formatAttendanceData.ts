import { format } from 'date-fns';

interface AttendanceData {
  name: string;
  total: number;
  present: number;
  cate2: number;
  cate3: number;
  cate4: number;
}

export const formatAttendanceDataForAI = (data: AttendanceData[], date: Date) => {
  // 基础统计信息
  const totalStudents = data.reduce((acc, curr) => acc + curr.total, 0);
  const totalPresent = data.reduce((acc, curr) => acc + curr.present, 0);
  const totalCate2 = data.reduce((acc, curr) => acc + curr.cate2, 0);
  const totalCate3 = data.reduce((acc, curr) => acc + curr.cate3, 0);
  const totalCate4 = data.reduce((acc, curr) => acc + curr.cate4, 0);
  
  // 格式化为易读的文本
  const formattedDate = format(date, 'yyyy年MM月dd日');
  let dataString = `${formattedDate}考勤数据统计：\n`;
  dataString += `总学生数：${totalStudents}人\n`;
  dataString += `实到人数：${totalPresent}人\n`;
  dataString += `出勤率：${((totalPresent / totalStudents) * 100).toFixed(1)}%\n`;
  dataString += `病假：${totalCate2}人\n`;
  dataString += `事假：${totalCate3}人\n`;
  dataString += `旷课：${totalCate4}人\n\n`;
  
  // 各学院详细数据
  dataString += "各学院详细数据：\n";
  data.forEach(item => {
    const attendanceRate = ((item.present / item.total) * 100).toFixed(1);
    dataString += `${item.name}：\n`;
    dataString += `应到/实到：${item.total}/${item.present}人，`;
    dataString += `出勤率：${attendanceRate}%，`;
    dataString += `病假${item.cate2}人，`;
    dataString += `事假${item.cate3}人，`;
    dataString += `旷课${item.cate4}人\n`;
  });
  
  return dataString;
} 