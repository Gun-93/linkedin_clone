export default function Avatar({ name = '', src, size = 32 }) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    return src ? (
        <img
            src={src}
            alt={name}
            className="rounded-full object-cover"
            style={{ width: size, height: size }}/>
    ) : (
        <div
            className="rounded-full bg-blue-600 text-white grid place-items-center font-semibold"
            style={{ width: size, height: size }}>
            {initials || 'U'}
        </div>
    )
}