import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    rules: {
      // Unused variables with underscore prefix are allowed
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      
      // Allow Function type in specific cases (Proxy patterns)
      '@typescript-eslint/no-unsafe-function-type': 'off',
      
      // Allow any in specific patterns (Proxy, middleware)
      '@typescript-eslint/no-explicit-any': 'off',
      
      // Allow img element for now (can be optimized later)
      '@next/next/no-img-element': 'warn',
      
      // Allow anonymous default export
      'import/no-anonymous-default-export': 'off',
      
      // React hooks exhaustive deps - warn only
      'react-hooks/exhaustive-deps': 'warn',
      
      // Allow unused expressions for specific patterns
      '@typescript-eslint/no-unused-expressions': ['warn', {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true
      }]
    }
  }
];

export default eslintConfig;
