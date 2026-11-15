import { Onest, JetBrains_Mono } from 'next/font/google';

// One definition per font: Turbopack fails the build when the same Google font is declared twice with different options.
export const onest = Onest({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-onest',
  display: 'swap',
});

export const jb = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '700'],
  variable: '--font-jb',
  display: 'swap',
});
