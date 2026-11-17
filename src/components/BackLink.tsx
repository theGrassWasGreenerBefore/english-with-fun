import { Link } from "react-router";
import styles from "./BackLink.module.css";
function BackLink() {
  return (
    <Link className={styles.lessonLink} to="/" title="Back to list">
      {"<<"}
    </Link>
  );
}

export default BackLink;
