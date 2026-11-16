import { requireHub } from '@/lib/hub/guard';
import { history, monthChatUsd, toHtml } from '@/lib/hub/assistant';
import { Chat } from './Chat';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;
export const metadata = { title: 'Claude' };

export default async function ChatPage() {
  await requireHub();
  const [rows, spent] = await Promise.all([history('web', 40), monthChatUsd()]);
  const initial = rows.map((r) => ({ role: r.role, html: r.role === 'assistant' ? toHtml(r.text) : null, text: r.text, model: r.model ?? undefined }));
  const budget = Number(process.env.HUB_CHAT_BUDGET_USD) || 20;
  return <Chat initial={initial} spent={spent} budget={budget} ready={Boolean(process.env.ANTHROPIC_API_KEY)} />;
}
