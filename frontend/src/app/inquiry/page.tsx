import { InquiryForm } from '@/components/inquiry-form'

export default function InquiryPage() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">문의하기</h1>
        <p className="text-muted-foreground">
          궁금한 점이나 문제가 있으시면 언제든 문의해 주세요. AI가 즉시 답변을 드립니다.
        </p>
      </div>
      <InquiryForm />
    </div>
  )
}