type Props = { className?: string };

export function IconInstagram({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function IconFacebook({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" />
    </svg>
  );
}

export function IconTikTok({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14.5 3c.4 2.4 1.9 4 4.5 4.3v3.1c-1.5-.1-2.9-.6-4.1-1.5v6.4c0 3.3-2.6 6-5.9 6S3 18.6 3 15.3s2.6-6 5.9-6c.4 0 .8 0 1.2.1v3.2c-.4-.2-.8-.3-1.2-.3-1.6 0-2.9 1.3-2.9 3s1.3 3 2.9 3 2.9-1.3 2.9-3V3h2.7z" />
    </svg>
  );
}

export function IconGoogle({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6c-.2 1.2-1 2.3-2.1 3v2.5h3.4C20.7 17.7 22 15.2 22 12.2z" />
      <path fill="#34A853" d="M12 22c2.8 0 5.1-.9 6.8-2.5l-3.4-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6C4.7 19.8 8.1 22 12 22z" />
      <path fill="#FBBC05" d="M6.4 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.5H3C2.3 8.9 2 10.4 2 12s.3 3.1 1 4.5l3.4-2.6z" />
      <path fill="#EA4335" d="M12 5.9c1.5 0 2.9.5 4 1.5l3-3C17.1 2.7 14.8 2 12 2 8.1 2 4.7 4.2 3 7.5l3.4 2.6C7.2 7.7 9.4 5.9 12 5.9z" />
    </svg>
  );
}

export function IconSeo({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconSocial({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="7" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.2 9.5l3 5.5M14.8 9l-2 5.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconAds({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 18V6l16 6-16 6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconDesign({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 16c4-8 12-10 16-10-2 5-4 10-8 12-3 1.5-6 1-8-2z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15" cy="9" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  switch (name) {
    case "instagram":
      return <IconInstagram className={className} />;
    case "facebook":
      return <IconFacebook className={className} />;
    case "tiktok":
      return <IconTikTok className={className} />;
    case "google":
      return <IconGoogle className={className} />;
    case "seo":
      return <IconSeo className={className} />;
    case "social":
      return <IconSocial className={className} />;
    case "ads":
      return <IconAds className={className} />;
    case "design":
      return <IconDesign className={className} />;
    default:
      return <IconSocial className={className} />;
  }
}
