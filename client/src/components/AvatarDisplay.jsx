export function isPhoto(avatar) {
  return typeof avatar === 'string' && avatar.startsWith('photo:')
}

export function isUrl(avatar) {
  return typeof avatar === 'string' && avatar.startsWith('url:')
}

export function photoName(avatar) {
  return avatar.split(':')[1]
}

export default function AvatarDisplay({ avatar, size = 32 }) {
  const imgStyle = {
    width: size, height: size,
    borderRadius: '50%',
    objectFit: 'cover',
    verticalAlign: 'middle',
    border: '2px solid rgba(255,255,255,0.3)',
  }

  if (isPhoto(avatar)) {
    return <img src={`/avatars/${photoName(avatar)}.png`} alt={photoName(avatar)} style={imgStyle} />
  }
  if (isUrl(avatar)) {
    return <img src={avatar.slice(4)} alt="avatar" style={imgStyle} />
  }
  return <span style={{ fontSize: size * 0.85 }}>{avatar}</span>
}
