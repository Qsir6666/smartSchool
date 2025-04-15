import { Form, Button, } from '@nutui/nutui-react'
import { ArrowLeft, Check, Order, ArrowRight } from '@nutui/icons-react'
import '@nutui/nutui-react/dist/style.css'
import styles from '../css/examine.module.css'
import 'animate.css';
import { useNavigate } from 'react-router-dom';
import TimeFormatter from '../pages/TimeFormatter'
import { useEffect, useState } from 'react';

const examine = () => {
  const nav = useNavigate()

  const [date,setDate] = useState(new Date())

  const Fan = () => {
    nav('/layout');
  }
  useEffect(()=>{
    const interval = setInterval(()=>{
      setDate(new Date())
    })

    return ()=> clearInterval(interval)
  },[])

  return (
    <div className={styles.box}>
      <div className={styles.yuan}>
        <div className={styles.tu}><ArrowLeft onClick={() => Fan()} /></div>
        <div className={styles.abc}>
          <div className={styles.ul}>
            <h2>下午好~</h2>
            <p>今天也是完美的一天~</p>
          </div>
          <div className={styles.span}>
            <span><TimeFormatter date={date} format="YYYY-MM-DD HH:mm:ss" /></span>
          </div>
        </div>

        <div>
          <div className={styles.boxTow} >
            <Form
              // divider
              footer={
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                  }}
                >
                  <Button nativeType="submit" block type="primary">
                    确定
                  </Button>
                </div>
              }
            >
              <Form.Item
                label={<Order className={styles.order} />}
                name="username"
              >
                <p className={styles.abcp}>未检查 <span className={styles.orderOne}>2</span><ArrowRight style={{ color: "#00a8ff" }} /></p>
              </Form.Item>
              <Form.Item
                label={<Check className={styles.check} />}
                name="age"
              >
                <p className={styles.abcp}>已检查<span className={styles.orderTow}>3</span><ArrowRight style={{ color: "#00a8ff" }} /></p>
              </Form.Item>

            </Form>

          </div>

        </div>
        <div className="animate__animated animate__fadeIn">
          <div className={styles.boxTowA}></div>
          <div className={styles.boxTowB}></div>
        </div>

      </div>
      <div className={styles.sao} onClick={() => nav('/Sweep')}>
        <div className={styles.rem} >
          {/* <RemoveRectangle /> */}
          [-]
        </div>
        <p className={styles.saoOne}>
          扫码检查
        </p>
      </div>
    </div>
  )
}

export default examine