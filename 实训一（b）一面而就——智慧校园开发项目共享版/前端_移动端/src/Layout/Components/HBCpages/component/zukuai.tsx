import React from "react";
import { NavBar } from 'react-vant';
import { useNavigate } from "react-router";
interface IProps {
    title: string;
    area: string
}
const App: React.FC<IProps> = (props) => {
    const navigate = useNavigate()
    const back = () => {
        // console.log('点击了返回',props.area)
        navigate(`${props.area}`)
    }
    return (
        <>
            <div>
                <NavBar
                    title={props.title}
                    fixed
                    placeholder
                    onClickLeft={() => navigate(`${props.area}`)}
                />
                {/* <NavBar  onBack={back}>{props.title}</NavBar> */}
            </div>
        </>
    )
}
export default App;