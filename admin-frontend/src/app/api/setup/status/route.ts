// 임시 QnA 데이터 저장소 (실제로는 데이터베이스 사용)
let qnaData: Array<{ question: string; answer: string; category: string }> = [];

export async function GET() {
  try {
    const isComplete = qnaData.length > 0;
    const hasQnA = qnaData.length > 0;

    return Response.json({
      success: true,
      data: {
        setupComplete: isComplete,
        hasQnAData: hasQnA,
        nextStep: isComplete ? 'dashboard' : 'qna-setup',
        message: isComplete 
          ? '설정이 완료되었습니다. 대시보드로 이동하세요.' 
          : 'QnA 데이터를 설정해주세요.'
      }
    });
  } catch (error) {
    return Response.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}