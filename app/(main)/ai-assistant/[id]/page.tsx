import AIAssistant from "../AIassistant";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function GetConversation({ params }: Props) {
  const { id } = await params;
  if (!id) return null;
  return <AIAssistant conversation_id={id} />;
}
