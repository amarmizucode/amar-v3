/**
 * The reference's two arrow glyphs, shared so every usage stays identical.
 *
 * `CornerArrow` is its `g_btn_svg` — the diagonal corner mark on the CTA
 * pills. `RightArrow` is its `problem_stats_svg` — the straight shafted arrow
 * used on the slider controls.
 */

export function CornerArrow({
  className = "",
  tight = false,
}: {
  className?: string;
  /**
   * Crops the viewBox to the glyph itself. The mark only covers about half
   * of its 12×12 box, so where a CornerArrow must read at the same size as
   * a RightArrow (whose glyph fills its box), the un-cropped box renders it
   * half as big at the same width.
   */
  tight?: boolean;
}) {
  return (
    <svg
      viewBox={tight ? "2.55 3 6.46 6.45" : "0 0 12 12"}
      width="100%"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M8.90954 9.09046L9 3L2.90954 3.09046L2.90213 4.32367L6.86437 4.25391L2.55914 8.55914L3.44086 9.44086L7.74609 5.13563L7.68708 9.10862L8.90954 9.09046Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function RightArrow({
  className = "",
  back = false,
}: {
  className?: string;
  back?: boolean;
}) {
  return (
    <svg viewBox="0 0 13 13" width="100%" fill="none" className={className} aria-hidden>
      <path
        d={
          back
            ? "M6.696 13L0 6.5L6.696 0L8.04 1.32796L3.672 5.5448H13V7.4552H3.672L8.04 11.6953L6.696 13Z"
            : "M6.304 0L13 6.5L6.304 13L4.96 11.672L9.328 7.4552L0 7.4552L0 5.5448L9.328 5.5448L4.96 1.30466L6.304 0Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}
