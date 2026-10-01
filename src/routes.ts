import { createBrowserRouter } from 'react-router'
import App from './App'
import LessonPagePlaceholder from './pages/LessonPagePlaceholder'

const routes = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      {
        path: '/lesson/:id',
        Component: LessonPagePlaceholder,
      },
    ],
  },
])

export default routes
