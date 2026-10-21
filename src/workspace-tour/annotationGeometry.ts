export type AnnotationRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function center(rect: AnnotationRect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function edgePoint(rect: AnnotationRect, toward: { x: number; y: number }) {
  const origin = center(rect);
  const dx = toward.x - origin.x;
  const dy = toward.y - origin.y;
  const scale = Math.min(
    rect.width / 2 / Math.max(Math.abs(dx), 0.001),
    rect.height / 2 / Math.max(Math.abs(dy), 0.001),
  );
  return { x: origin.x + dx * scale, y: origin.y + dy * scale };
}

export function annotationConnectorPath(
  label: AnnotationRect,
  target: AnnotationRect,
) {
  const start = edgePoint(label, center(target));
  const end = edgePoint(target, center(label));
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  const curve = Math.min(24, Math.max(8, distance * 0.07));
  const normalX = distance ? (-dy / distance) * curve : 0;
  const normalY = distance ? (dx / distance) * curve : 0;
  return `M ${start.x} ${start.y} C ${start.x + dx * 0.34 + normalX} ${start.y + dy * 0.34 + normalY}, ${start.x + dx * 0.68 + normalX} ${start.y + dy * 0.68 + normalY}, ${end.x} ${end.y}`;
}
