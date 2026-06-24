// Filmic texture. Two fixed, non-interactive layers (animated grain + a vignette
// with faint scanlines) keep the whole page reading as graded footage rather
// than flat web panels. All styling lives in index.css so it stays GPU-cheap.
export default function FilmOverlay() {
  return (
    <>
      <div className="vignette-layer" aria-hidden />
      <div className="grain-layer" aria-hidden />
    </>
  )
}
