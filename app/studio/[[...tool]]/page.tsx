import StudioWrapper from './studio-wrapper'

export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  return <StudioWrapper />
}
