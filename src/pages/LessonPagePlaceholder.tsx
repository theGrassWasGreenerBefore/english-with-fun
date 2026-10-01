import { useParams } from 'react-router'

function LessonPagePlaceholder() {
  const params = useParams()

  return (
    <>
      Lesson ID: {params.id}
    </>
  )
}

export default LessonPagePlaceholder
