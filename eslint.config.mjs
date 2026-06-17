import neostandard, { resolveIgnoresFromGitignore } from 'neostandard'

export default [
  ...neostandard({
    env: ['browser'],
    ignores: resolveIgnoresFromGitignore()
  }),
  {
    rules: {
      'import-x/no-absolute-path': 'off',
      'import-x/order': ['error', {
        groups: ['unknown', 'external', 'internal'],
        pathGroups: [
          { pattern: '/app.config', group: 'internal', position: 'before' },
          { pattern: '/data/**', group: 'internal', position: 'before' },
          { pattern: '/*.svg', group: 'internal', position: 'before' },
          { pattern: '/components/**', group: 'internal', position: 'after' },
          { pattern: '/controllers/**', group: 'internal', position: 'after' },
          { pattern: '/screens/**', group: 'internal', position: 'after' },
          { pattern: '/utils/**', group: 'internal', position: 'after' }
        ],
        pathGroupsExcludedImportTypes: [],
        distinctGroup: false,
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true }
      }],

      'react/jsx-key': 'off',
      'react/jsx-closing-tag-location': 'off',
      'react/no-direct-mutation-state': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-unknown-property': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-string-refs': 'off',
      'react/jsx-handler-names': 'off'
    }
  }
]
