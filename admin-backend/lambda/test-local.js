const { handler: loginHandler } = require('./dist/login');
const { handler: verifyHandler } = require('./dist/verify');

// 로그인 테스트
async function testLogin() {
  console.log('🧪 로그인 테스트 시작...');
  
  const event = {
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    }),
    headers: {}
  };

  const result = await loginHandler(event);
  console.log('로그인 결과:', JSON.parse(result.body));
  
  if (result.statusCode === 200) {
    const { access_token } = JSON.parse(result.body).data;
    return access_token;
  }
  return null;
}

// 토큰 검증 테스트
async function testVerify(token) {
  console.log('🧪 토큰 검증 테스트 시작...');
  
  const event = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const result = await verifyHandler(event);
  console.log('검증 결과:', JSON.parse(result.body));
}

// 전체 테스트 실행
async function runTests() {
  try {
    const token = await testLogin();
    if (token) {
      await testVerify(token);
    }
  } catch (error) {
    console.error('테스트 오류:', error);
  }
}

runTests();