import Fx from '@/components/site/Fx';

// Har sahifa almashganda qayta chiziladi: kirish animatsiyasi shu yerda.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Fx />
      <div className="page-in">{children}</div>
    </>
  );
}
