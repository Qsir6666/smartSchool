import React, { Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
import routes from './router/index.tsx'
import '@nutui/nutui-react/dist/style.css'
import './App.css' //存放全局样式

function App() {
  let element = useRoutes(routes)

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <Suspense fallback={<div>加载中.....</div>}>
        <div>
          {element}
        </div>
      </Suspense>
    </div >
  )
}

export default App
