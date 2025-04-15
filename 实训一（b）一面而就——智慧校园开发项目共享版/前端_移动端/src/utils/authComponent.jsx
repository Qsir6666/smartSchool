// 判断token是否存在，如果存在正常渲染，如果不存在重定向到登录路由
import { Navigate, useNavigate } from "react-router-dom";
// 登录权鉴
const AuthComponent = ({ children }) => {
  // let isToken = JSON.parse(localStorage.getItem('token') ) 
  let isToken = localStorage.getItem('token')
  if (isToken) {
    return <><div>{children}</div></>
  } else {
    return <Navigate to='/login' replace/>
  }
 
}
export default AuthComponent


