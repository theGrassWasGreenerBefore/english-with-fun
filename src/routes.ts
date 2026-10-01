import { createBrowserRouter } from 'react-router'
import App from './App'
import HomePage from './pages/HomePage'
import LessonPage from './pages/LessonPage'

const routes = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: '/lesson/:id',
        Component: LessonPage,
      },
    ],
  },
])

export default routes
