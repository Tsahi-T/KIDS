export function isPhoto(avatar) {
  return typeof avatar === 'string' && avatar.startsWith('photo:')
}

export function photoName(avatar) {
  return avatar.split(':')[1]
}

export default function AvatarDisplay({ avatar, size = 32 }) {
  if (isPhoto(avatar)) {
    return (
      <img
        src={`/avatars/${photoName(avatar)}.png`}
        alt={photoName(avatar)}
        style={{
          width: size, height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          verticalAlign: 'middle',
          border: '2px solid rgba(255,255,255,0.3)',
        }}
      />
    )
  }
  return <span style={{ fontSize: size * 0.85 }}>{avatar}</span>
}
