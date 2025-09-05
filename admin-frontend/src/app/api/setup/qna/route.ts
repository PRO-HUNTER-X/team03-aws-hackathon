// 임시 QnA 데이터 저장소 (실제로는 데이터베이스 사용)
let qnaData: Array<{ 
  id: string;
  question: string; 
  answer: string; 
  category: string;
  createdAt: Date;
}> = [];

export async function POST(request: Request) {
  try {
    const { qnaList } = await request.json();

    if (!qnaList || !Array.isArray(qnaList)) {
      return Response.json(
        { message: 'QnA 목록이 올바르지 않습니다' },
        { status: 400 }
      );
    }

    // QnA 데이터 저장
    qnaData = qnaList.map((item: any, index: number) => ({
      id: `qna_${index + 1}`,
      question: item.question,
      answer: item.answer,
      category: item.category,
      createdAt: new Date()
    }));

    return Response.json({
      statusCode: 201,
      success: true,
      message: 'QnA 데이터가 성공적으로 설정되었습니다',
      count: qnaData.length
    });
  } catch (error) {
    return Response.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return Response.json({
      success: true,
      data: qnaData,
      count: qnaData.length
    });
  } catch (error) {
    return Response.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}