import { Link } from "react-router";
import styles from "./HomePage.module.css";

interface LessonLink {
  readonly id: string;
  readonly title: string;
}

const LESSONS: readonly LessonLink[] = [{ id: "lesson_1", title: "Lesson 1" }];

function HomePage() {
  return (
    <main className={styles.homePage}>
      <h1 className={styles.title}>English with Fun</h1>
      <ul className={styles.lessonList}>
        {LESSONS.map((lesson) => (
          <li key={lesson.id}>
            <Link className={styles.lessonLink} to={`/lesson/${lesson.id}`}>
              {lesson.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default HomePage;
