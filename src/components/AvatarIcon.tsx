import { ExplorerAvatar } from '../state/rimbaStore';

const AVATAR_IMAGE_MAP: Record<ExplorerAvatar | 'worm', string> = {
  bee: '/assets/images/avatar-bee.png',
  frog: '/assets/images/avatar-frog.png',
  crab: '/assets/images/avatar-crab.png',
  biji: '/assets/images/avatar-biji.png',
  worm: '/assets/images/avatar-worm.png'
};

export function ExplorerAvatarSvg({
  avatar,
  size = 44
}: {
  avatar: ExplorerAvatar | 'worm';
  size?: number;
}) {
  const src = AVATAR_IMAGE_MAP[avatar] || AVATAR_IMAGE_MAP.biji;

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className="rounded-full object-contain shrink-0 block select-none"
      style={{ width: size, height: size }}
    />
  );
}
