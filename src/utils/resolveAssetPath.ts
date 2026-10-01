// Resolves a relative asset path (e.g. "./img/x.jpg", "../common/img/y.jpg") from
// config.json against the lesson's base folder (e.g. "/assets/lesson_1/").
export function resolveAssetPath(basePath: string, relativePath: string): string {
  return new URL(relativePath, new URL(basePath, window.location.origin)).pathname;
}
