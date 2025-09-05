import StatusPageClient from './status-client';

export async function generateStaticParams() {
  return [
    { id: 'demo-001' },
    { id: 'demo-002' },
    { id: 'demo-003' }
  ];
}

export const dynamicParams = false;

type InquiryStatus = "pending" | "processing" | "completed";

interface InquiryData {
  id: string;
  title: string;
  category: string;
  status: InquiryStatus;
  createdAt: string;
  estimatedResponseTime: number;
  timeline: TimelineEvent[];
}

interface TimelineEvent {
  id: string;
  type: "created" | "ai_response" | "escalated" | "human_response" | "completed";
  title: string;
  description: string;
  timestamp: string;
  icon: "message" | "bot" | "user" | "check";
}

export default function StatusPage() {
  return <StatusPageClient />;
}

