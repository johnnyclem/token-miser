import React from 'react';
import { oe, Ue } from '../theme';

const links = [
  { label: 'GitHub', href: 'https://github.com/anthropics/claude-code' },
  { label: 'npm', href: 'https://www.npmjs.com/package/token-miser' },
  { label: 'MIT License', href: 'https://github.com/anthropics/claude-code/blob/main/LICENSE' },
];

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        padding: 'clamp(32px, 5vw, 64px) clamp(20px, 5vw, 64px)',
        maxWidth: 960,
        margin: '0 auto',
        borderTop: `1px solid ${oe.border}`,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
      }}
    >
      {/* Left side: logo + version */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${oe.accent}, ${oe.purple})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
            color: '#fff',
            fontFamily: Ue.mono,
          }}
        >
          TM
        </div>
        <span
          style={{
            fontSize: 14,
            color: oe.textDim,
            fontFamily: Ue.mono,
          }}
        >
          token-miser v0.1.0
        </span>
      </div>

      {/* Right side: links */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', alignItems: 'center' }}>
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 14,
              color: oe.textDim,
              fontFamily: Ue.sans,
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = oe.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.color = oe.textDim)}
          >
            {link.label}
          </a>
        ))}
        <span
          style={{
            fontSize: 13,
            color: oe.textDim,
            fontFamily: Ue.sans,
          }}
        >
          by token-miser contributors
        </span>
      </div>
    </footer>
  );
};

export default Footer;
