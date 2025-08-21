/**
 * Custom ESLint Rules for Dhacle Project
 * 
 * snake_case/camelCase 오류 방지를 위한 커스텀 규칙
 */

module.exports = {
  rules: {
    // database.generated.ts 직접 import 금지
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['*/database.generated', '**/database.generated'],
          message: '❌ Use @/types instead of database.generated! This prevents snake_case/camelCase errors.'
        }
      ]
    }],

    // 위험한 DB 필드 접근 경고
    'no-restricted-syntax': [
      'warn',
      {
        // finalAmount, studentCount 등 자주 실수하는 필드
        selector: "MemberExpression[property.name='finalAmount']",
        message: '⚠️  Use final_amount (snake_case) for DB fields or use typed-client for automatic conversion'
      },
      {
        selector: "MemberExpression[property.name='studentCount']",
        message: '⚠️  Use total_students (snake_case) for DB fields or use typed-client for automatic conversion'
      },
      {
        selector: "MemberExpression[property.name='createdAt']",
        message: '⚠️  Use created_at (snake_case) for DB fields or use typed-client for automatic conversion'
      },
      {
        selector: "MemberExpression[property.name='updatedAt']",
        message: '⚠️  Use updated_at (snake_case) for DB fields or use typed-client for automatic conversion'
      }
    ],

    // supabase.from() 직접 호출 시 경고 (점진적 마이그레이션)
    'no-restricted-properties': [
      'warn',
      {
        object: 'supabase',
        property: 'from',
        message: '💡 Consider using db.from() from @/lib/supabase/typed-client for automatic case conversion'
      }
    ]
  },

  overrides: [
    {
      // typed-client.ts 자체는 규칙 제외
      files: ['**/typed-client.ts', '**/typed-client.js'],
      rules: {
        'no-restricted-imports': 'off',
        'no-restricted-syntax': 'off',
        'no-restricted-properties': 'off'
      }
    },
    {
      // 테스트 파일은 규칙 완화
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        'no-restricted-syntax': 'off'
      }
    }
  ]
};