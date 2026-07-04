// Shared <source> pair for every clip on the page. Modern VP9/WebM first
// (~⅓ the size), then the universal H.264 fallback — the browser keeps the
// first type it can decode. The WebM lives next to the MP4 with the same
// base name, so it's derived rather than passed twice.
const VideoSources = ({ mp4 }: { mp4: string }) => (
  <>
    <source src={mp4.replace(/\.mp4$/, '.webm')} type="video/webm" />
    <source src={mp4} type="video/mp4" />
  </>
)

export default VideoSources
