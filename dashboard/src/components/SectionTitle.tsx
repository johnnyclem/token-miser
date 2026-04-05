import React from 'react';
import { L, he } from '../theme';

interface SectionTitleProps {
  children: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => (
  <h3
    style={{
      fontSize: 15,
      fontWeight: 600,
      color: L.text,
      fontFamily: he.sans,
      marginBottom: 16,
      marginTop: 8,
    }}
  >
    {children}
  </h3>
);

export default SectionTitle;
