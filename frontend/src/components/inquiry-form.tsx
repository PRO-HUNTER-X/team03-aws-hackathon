'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const inquirySchema = z.object({
  category: z.string().min(1, '문의 유형을 선택해주세요'),
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자 이내로 입력해주세요'),
  content: z.string().min(10, '내용을 10자 이상 입력해주세요').max(1000, '내용은 1000자 이내로 입력해주세요'),
  urgency: z.string().min(1, '긴급도를 선택해주세요')
})

type InquiryFormData = z.infer<typeof inquirySchema>

export function InquiryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      category: '',
      title: '',
      content: '',
      urgency: ''
    }
  })

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true)
    try {
      // TODO: API 호출 구현
      console.log('문의 제출:', data)
      // 임시로 2초 대기
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('문의가 성공적으로 제출되었습니다!')
      form.reset()
    } catch (error) {
      console.error('문의 제출 실패:', error)
      alert('문의 제출에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>새 문의 작성</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 문의 유형 선택 */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>문의 유형 *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="문의 유형을 선택해주세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="technical">기술 문의</SelectItem>
                      <SelectItem value="billing">결제 문의</SelectItem>
                      <SelectItem value="general">일반 문의</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 제목 입력 */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목 *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="문의 제목을 입력해주세요" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 내용 입력 */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>내용 *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="문의 내용을 자세히 입력해주세요"
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 긴급도 선택 */}
            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>긴급도 *</FormLabel>
                  <FormControl>
                    <div className="flex gap-4">
                      {[
                        { value: 'low', label: '낮음', color: 'text-green-600' },
                        { value: 'medium', label: '보통', color: 'text-yellow-600' },
                        { value: 'high', label: '높음', color: 'text-red-600' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value={option.value}
                            checked={field.value === option.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className={option.color}>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 제출 버튼 */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? '제출 중...' : '문의 제출'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}